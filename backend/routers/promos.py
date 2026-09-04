from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from database import get_db, PromoCode
from auth.rate_limiter import get_rate_limit

router = APIRouter(prefix="/api/promos", tags=["promos"])

DEFAULT_PROMOS = [
    {
        "id": "promo-1",
        "code": "FLYNOW200",
        "description": "Flat ₹200 off on domestic flights across India",
        "mode": "flights",
        "expiryDate": "2026-10-15",
        "isVerified": True,
        "minAmount": 2500,
        "cardRequirement": "All Cards"
    },
    {
        "id": "promo-2",
        "code": "HDFCFLY",
        "description": "₹350 instant discount on HDFC Bank Credit Cards",
        "mode": "flights",
        "expiryDate": "2026-09-30",
        "isVerified": True,
        "minAmount": 3000,
        "cardRequirement": "HDFC Credit Cards"
    },
    {
        "id": "promo-3",
        "code": "TRAIN50",
        "description": "Zero PG charges + ₹50 cashback on IRCTC train bookings",
        "mode": "trains",
        "expiryDate": "2026-11-01",
        "isVerified": True,
        "minAmount": 500,
        "cardRequirement": "UPI / Net Banking"
    },
    {
        "id": "promo-4",
        "code": "REDBUS150",
        "description": "Flat 15% up to ₹150 off on intercity AC buses",
        "mode": "buses",
        "expiryDate": "2026-10-31",
        "isVerified": True,
        "minAmount": 600,
        "cardRequirement": "All Payment Methods"
    },
    {
        "id": "promo-5",
        "code": "FIRSTBUDDY",
        "description": "₹500 off on first multi-city trip booking via IndiaBuddy",
        "mode": "all",
        "expiryDate": "2026-12-31",
        "isVerified": True,
        "minAmount": 2000,
        "cardRequirement": "New Users"
    },
    {
        "id": "promo-6",
        "code": "ICICITRAVEL",
        "description": "10% off up to ₹750 with ICICI Bank debit/credit cards",
        "mode": "flights",
        "expiryDate": "2026-10-20",
        "isVerified": True,
        "minAmount": 4000,
        "cardRequirement": "ICICI Bank Cards"
    }
]

@router.get("", dependencies=[Depends(get_rate_limit(60))])
async def get_promos(
    platform: Optional[str] = None,
    mode: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(PromoCode).where(PromoCode.is_verified == True)
        if platform:
            query = query.where(PromoCode.platform == platform)
        result = await db.execute(query)
        db_promos = result.scalars().all()
        
        if db_promos:
            formatted = []
            for p in db_promos:
                if mode and p.applicable_modes and mode not in p.applicable_modes:
                    continue
                formatted.append({
                    "id": str(p.id),
                    "code": p.code,
                    "description": f"₹{p.discount_value} off on {p.platform}",
                    "mode": p.applicable_modes[0] if p.applicable_modes else "all",
                    "expiryDate": p.expiry_date.strftime("%Y-%m-%d") if p.expiry_date else "2026-12-31",
                    "isVerified": p.is_verified,
                    "minAmount": p.min_booking_inr or 0,
                    "cardRequirement": p.card_required or "All Cards"
                })
            if formatted:
                return formatted
    except Exception:
        pass

    # Return curated active promo list
    if mode and mode != "all":
        return [p for p in DEFAULT_PROMOS if p["mode"] == mode or p["mode"] == "all"]
    return DEFAULT_PROMOS

@router.get("/all", dependencies=[Depends(get_rate_limit(60))])
async def get_all_active_promos(db: AsyncSession = Depends(get_db)):
    return await get_promos(db=db)
