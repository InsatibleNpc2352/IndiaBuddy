from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db, PriceRecord, Route
from auth.rate_limiter import get_rate_limit
from datetime import datetime, timedelta

router = APIRouter(prefix="/api", tags=["history"])

@router.get("/history", dependencies=[Depends(get_rate_limit(60))])
async def get_history(
    origin: str,
    destination: str,
    mode: str,
    days: int = Query(90),
    db: AsyncSession = Depends(get_db)
):
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # First get route
    route_result = await db.execute(select(Route).where(Route.origin == origin, Route.destination == destination))
    route = route_result.scalars().first()
    
    if not route:
        return {"history": []}
        
    records_result = await db.execute(
        select(PriceRecord).where(
            PriceRecord.route_id == route.id,
            PriceRecord.mode == mode,
            PriceRecord.scraped_at >= cutoff_date
        ).order_by(PriceRecord.scraped_at)
    )
    
    records = records_result.scalars().all()
    
    return {
        "history": [
            {"date": r.scraped_at.isoformat(), "price": r.price, "operator": r.operator} for r in records
        ]
    }
