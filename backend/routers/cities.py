from fastapi import APIRouter, Query, Depends
import json
import os
from auth.rate_limiter import get_rate_limit

router = APIRouter(prefix="/api", tags=["cities"])

# Load cities data from data/cities.json
cities_data = []
potential_paths = [
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "cities.json"),
    os.path.join(os.path.dirname(__file__), "..", "data", "cities.json"),
    os.path.join(os.getcwd(), "data", "cities.json"),
]

for path in potential_paths:
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                cities_data = json.load(f)
            break
        except Exception:
            pass

if not cities_data:
    cities_data = [
        {"name": "Delhi", "state": "Delhi", "iata": "DEL", "station_code": "NDLS"},
        {"name": "Mumbai", "state": "Maharashtra", "iata": "BOM", "station_code": "CSMT"},
        {"name": "Bangalore", "state": "Karnataka", "iata": "BLR", "station_code": "SBC"},
        {"name": "Chennai", "state": "Tamil Nadu", "iata": "MAA", "station_code": "MAS"},
        {"name": "Kolkata", "state": "West Bengal", "iata": "CCU", "station_code": "HWH"},
        {"name": "Hyderabad", "state": "Telangana", "iata": "HYD", "station_code": "HYB"},
        {"name": "Pune", "state": "Maharashtra", "iata": "PNQ", "station_code": "PUNE"},
        {"name": "Ahmedabad", "state": "Gujarat", "iata": "AMD", "station_code": "ADI"},
        {"name": "Jaipur", "state": "Rajasthan", "iata": "JAI", "station_code": "JP"},
        {"name": "Goa", "state": "Goa", "iata": "GOI", "station_code": "MAO"},
    ]

@router.get("/cities", dependencies=[Depends(get_rate_limit(60))])
async def search_cities(q: str = Query(..., min_length=1)):
    query = q.lower().strip()
    matches = []
    for c in cities_data:
        name = c.get("name", "")
        aliases = c.get("aliases", [])
        if query in name.lower() or any(query in a.lower() for a in aliases):
            matches.append(name)
    # Deduplicate while preserving order
    seen = set()
    result = []
    for name in matches:
        if name not in seen:
            seen.add(name)
            result.append(name)
    return result[:10]
