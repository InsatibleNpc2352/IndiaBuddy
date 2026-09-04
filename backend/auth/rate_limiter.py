import time
from fastapi import Request, HTTPException, status, Depends
import redis.asyncio as redis

from config import settings
from cache import redis_client

class RateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def check_rate_limit(self, ip: str, endpoint: str, limit_per_minute: int) -> bool:
        current_time = int(time.time())
        window_start = current_time - 60
        
        key = f"rate_limit:{ip}:{endpoint}"
        
        async with self.redis.pipeline(transaction=True) as pipe:
            await pipe.zremrangebyscore(key, 0, window_start)
            await pipe.zcard(key)
            await pipe.zadd(key, {str(current_time): current_time})
            await pipe.expire(key, 60)
            results = await pipe.execute()
            
            request_count = results[1]
            
            if request_count >= limit_per_minute:
                # Add violation count
                violation_key = f"violations:{ip}"
                await self.redis.incr(violation_key)
                await self.redis.expire(violation_key, 3600) # Keep violations for an hour
                return False
            return True

rate_limiter_instance = RateLimiter(redis_client)

async def rate_limit_dependency(request: Request, limit: int = 60):
    ip = request.client.host if request.client else "unknown"
    endpoint = request.url.path
    
    # Check if IP is blocked
    violation_count = await redis_client.get(f"violations:{ip}")
    if violation_count and int(violation_count) >= 3:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="IP blocked due to rate limit violations")
    
    is_allowed = await rate_limiter_instance.check_rate_limit(ip, endpoint, limit)
    if not is_allowed:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests")
    
def get_rate_limit(limit: int):
    async def _rate_limit_dependency(request: Request):
        return await rate_limit_dependency(request, limit)
    return _rate_limit_dependency
