from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import date
import json

from config import settings
from auth.rate_limiter import get_rate_limit
from scoring.generator import generate_route_options
from cache import redis_client

router = APIRouter(prefix="/api", tags=["search"])

@router.get("/search", dependencies=[Depends(get_rate_limit(60))])
async def search_routes(
    origin: str, 
    destination: str, 
    date: date, 
    mode: str = Query("all")
):
    cache_key = f"search:{origin.lower()}:{destination.lower()}:{date.isoformat()}:{mode}"
    cached_result = await redis_client.get(cache_key)
    if cached_result:
        try:
            return json.loads(cached_result)
        except Exception:
            pass

    all_options = generate_route_options(origin, destination, date)
    
    clean_mode = mode.lower()
    if "flight" in clean_mode:
        results = all_options.get("flights", [])
    elif "train" in clean_mode:
        results = all_options.get("trains", [])
    elif "bus" in clean_mode:
        results = all_options.get("buses", [])
    else:
        # All modes combined
        results = all_options.get("flights", []) + all_options.get("trains", []) + all_options.get("buses", [])

    await redis_client.setex(cache_key, 1800, json.dumps(results))
    return results
