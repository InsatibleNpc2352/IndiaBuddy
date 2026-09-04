from fastapi import APIRouter, Depends, Query
from datetime import date
from typing import Dict, List, Any

from auth.rate_limiter import get_rate_limit
from scoring.generator import generate_route_options
from cache import redis_client
import json

router = APIRouter(prefix="/api", tags=["compare"])

@router.get("/compare", dependencies=[Depends(get_rate_limit(60))])
async def compare_modes(
    origin: str,
    destination: str,
    date_val: date = Query(..., alias="date")
):
    cache_key = f"compare:{origin.lower()}:{destination.lower()}:{date_val.isoformat()}"
    cached = await redis_client.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    results = generate_route_options(origin, destination, date_val)
    await redis_client.setex(cache_key, 1800, json.dumps(results))
    return results
