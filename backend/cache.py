import time
import asyncio
import logging
from typing import Optional, Dict, Any
from config import settings

logger = logging.getLogger(__name__)

class InMemoryRedisPipeline:
    def __init__(self, in_memory_cache: 'InMemoryRedis'):
        self.cache = in_memory_cache
        self.commands = []

    async def __aenter__(self):
        self.commands = []
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

    async def zremrangebyscore(self, key: str, min_score: float, max_score: float):
        self.commands.append(('zremrangebyscore', key, min_score, max_score))

    async def zcard(self, key: str):
        self.commands.append(('zcard', key))

    async def zadd(self, key: str, mapping: Dict[str, float]):
        self.commands.append(('zadd', key, mapping))

    async def expire(self, key: str, seconds: int):
        self.commands.append(('expire', key, seconds))

    async def execute(self):
        results = []
        for cmd in self.commands:
            op = cmd[0]
            if op == 'zremrangebyscore':
                key, min_s, max_s = cmd[1], cmd[2], cmd[3]
                scores = self.cache.sorted_sets.get(key, {})
                to_del = [m for m, s in scores.items() if min_s <= s <= max_s]
                for m in to_del:
                    del scores[m]
                results.append(len(to_del))
            elif op == 'zcard':
                key = cmd[1]
                scores = self.cache.sorted_sets.get(key, {})
                results.append(len(scores))
            elif op == 'zadd':
                key, mapping = cmd[1], cmd[2]
                if key not in self.cache.sorted_sets:
                    self.cache.sorted_sets[key] = {}
                self.cache.sorted_sets[key].update(mapping)
                results.append(len(mapping))
            elif op == 'expire':
                results.append(True)
        return results

class InMemoryRedis:
    def __init__(self):
        self.store: Dict[str, Any] = {}
        self.expirations: Dict[str, float] = {}
        self.sorted_sets: Dict[str, Dict[str, float]] = {}

    def _is_expired(self, key: str) -> bool:
        if key in self.expirations and time.time() > self.expirations[key]:
            self.store.pop(key, None)
            self.expirations.pop(key, None)
            self.sorted_sets.pop(key, None)
            return True
        return False

    async def get(self, key: str) -> Optional[str]:
        if self._is_expired(key):
            return None
        return self.store.get(key)

    async def set(self, key: str, value: Any):
        self.store[key] = str(value)

    async def setex(self, key: str, time_sec: int, value: Any):
        self.store[key] = str(value)
        self.expirations[key] = time.time() + time_sec

    async def incr(self, key: str) -> int:
        if self._is_expired(key):
            self.store[key] = "0"
        val = int(self.store.get(key, 0)) + 1
        self.store[key] = str(val)
        return val

    async def expire(self, key: str, seconds: int):
        self.expirations[key] = time.time() + seconds

    def pipeline(self, transaction=True):
        return InMemoryRedisPipeline(self)

    async def ping(self) -> bool:
        return True

# Initialize real redis client with automatic fallback
_real_redis = None
_in_memory_redis = InMemoryRedis()

try:
    import redis.asyncio as aioredis
    _real_redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception:
    pass

class ResilientRedis:
    def __init__(self):
        self._is_connected = None

    async def _client(self):
        if self._is_connected is False:
            return _in_memory_redis
        if _real_redis:
            try:
                # Test connectivity once or on timeout
                if self._is_connected is None:
                    await asyncio.wait_for(_real_redis.ping(), timeout=1.0)
                    self._is_connected = True
                    return _real_redis
                elif self._is_connected is True:
                    return _real_redis
            except Exception:
                logger.info("Redis not reachable. Using in-memory cache/rate-limiter fallback.")
                self._is_connected = False
        return _in_memory_redis

    async def get(self, key: str):
        try:
            client = await self._client()
            return await client.get(key)
        except Exception:
            return await _in_memory_redis.get(key)

    async def set(self, key: str, value: Any):
        try:
            client = await self._client()
            return await client.set(key, value)
        except Exception:
            return await _in_memory_redis.set(key, value)

    async def setex(self, key: str, time_sec: int, value: Any):
        try:
            client = await self._client()
            return await client.setex(key, time_sec, value)
        except Exception:
            return await _in_memory_redis.setex(key, time_sec, value)

    async def incr(self, key: str):
        try:
            client = await self._client()
            return await client.incr(key)
        except Exception:
            return await _in_memory_redis.incr(key)

    async def expire(self, key: str, seconds: int):
        try:
            client = await self._client()
            return await client.expire(key, seconds)
        except Exception:
            return await _in_memory_redis.expire(key, seconds)

    def pipeline(self, transaction=True):
        if self._is_connected:
            try:
                return _real_redis.pipeline(transaction=transaction)
            except Exception:
                pass
        return _in_memory_redis.pipeline(transaction=transaction)

redis_client = ResilientRedis()
