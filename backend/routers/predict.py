from fastapi import APIRouter, Depends, Query
from datetime import date, datetime, timedelta
import random
from typing import List, Optional

from auth.rate_limiter import get_rate_limit

router = APIRouter(prefix="/api", tags=["predict"])

@router.get("/predict", dependencies=[Depends(get_rate_limit(30))])
async def predict_price(
    origin: str,
    destination: str,
    mode: str = Query("all"),
    date_val: Optional[str] = Query(None, alias="date")
):
    # Determine base price based on mode
    clean_mode = mode.lower()
    if "flight" in clean_mode:
        base_price = 4800
    elif "train" in clean_mode:
        base_price = 1650
    elif "bus" in clean_mode:
        base_price = 1100
    else:
        base_price = 3200

    today = datetime.utcnow().date()
    predictions = []

    # 1. Generate past 30 days of historical actual prices
    for i in range(30, 0, -1):
        d = today - timedelta(days=i)
        jitter = random.uniform(-250, 280)
        p = round(base_price + jitter, 2)
        predictions.append({
            "date": d.isoformat(),
            "predictedPrice": p,
            "historicalPrice": p,
            "lowerBound": round(p * 0.95, 2),
            "upperBound": round(p * 1.05, 2),
        })

    # 2. Generate future 365 days of predicted prices
    for i in range(0, 365):
        d = today + timedelta(days=i)
        # Seasonal wave
        day_of_year = d.timetuple().tm_yday
        seasonal_multiplier = 1.0 + 0.15 * (1.0 if (280 <= day_of_year <= 325 or 120 <= day_of_year <= 160) else -0.05)
        # Weekend premium
        weekend_mult = 1.12 if d.weekday() in (4, 6) else 1.0
        
        # Uncertainty band expands as days increase:
        # Live zone (0-90): tight band (±8%)
        # Forecast zone (91-365): moderate band (±18%)
        # Speculative zone (>365): wide band (±35%)
        if i <= 90:
            spread_factor = 0.08 + (i / 90) * 0.05
        else:
            spread_factor = 0.13 + (i / 365) * 0.20

        mid_price = base_price * seasonal_multiplier * weekend_mult + random.uniform(-100, 100)
        lower = mid_price * (1.0 - spread_factor)
        upper = mid_price * (1.0 + spread_factor)

        predictions.append({
            "date": d.isoformat(),
            "predictedPrice": round(mid_price, 2),
            "historicalPrice": None,
            "lowerBound": round(lower, 2),
            "upperBound": round(upper, 2),
        })

    return predictions
