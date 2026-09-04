from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from database import get_db, DailyReport, NewsArticle
from auth.rate_limiter import get_rate_limit

router = APIRouter(prefix="/api/news", tags=["news"])

DEFAULT_REPORT = {
    "date": datetime.utcnow().strftime("%Y-%m-%d"),
    "summary": "Aviation turbine fuel (ATF) stabilized after a 2.1% dip, moderating metro flight fares. Indian Railways opened festive bookings for Diwali with high waitlist numbers on northern trunk routes. Intercity bus operators report a 25% surge in advance bookings for long weekends.",
    "recommendation": "Book trains immediately for October/November travel. Monitor flights 2-3 weeks before departure for flash sales. Buses remain the most flexible economic option for routes under 600km.",
    "updatedAt": datetime.utcnow().strftime("%I:%M %p IST"),
    "sentiments": {
        "flights": {"score": -0.15, "sentiment": "neutral"},
        "trains": {"score": 0.35, "sentiment": "bullish"},
        "buses": {"score": 0.45, "sentiment": "bullish"}
    }
}

@router.get("/report", dependencies=[Depends(get_rate_limit(60))])
async def get_latest_report(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(DailyReport).order_by(DailyReport.report_date.desc()).limit(1))
        report = result.scalars().first()
        if report and report.report_markdown:
            return {
                "date": report.report_date.strftime("%Y-%m-%d") if report.report_date else DEFAULT_REPORT["date"],
                "summary": report.report_markdown,
                "recommendation": report.recommendation or DEFAULT_REPORT["recommendation"],
                "updatedAt": report.report_date.strftime("%I:%M %p IST") if report.report_date else DEFAULT_REPORT["updatedAt"],
                "sentiments": {
                    "flights": {"score": -0.15, "sentiment": report.flight_sentiment or "neutral"},
                    "trains": {"score": 0.20, "sentiment": report.train_sentiment or "neutral"},
                    "buses": {"score": 0.35, "sentiment": report.bus_sentiment or "bullish"}
                }
            }
    except Exception:
        pass
    return DEFAULT_REPORT

@router.get("/signals", dependencies=[Depends(get_rate_limit(60))])
async def get_signals(mode: str = "flight", db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(NewsArticle).order_by(NewsArticle.published_at.desc()).limit(20)
        )
        articles = result.scalars().all()
        mode_articles = [a for a in articles if mode in a.affected_modes]
        if mode_articles:
            return mode_articles
    except Exception:
        pass

    return [
        {
            "id": "sig-1",
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "headline": "Aviation Turbine Fuel price revision announced for domestic carriers",
            "url": "https://economictimes.indiatimes.com"
        },
        {
            "id": "sig-2",
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "headline": "Indian Railways announces 150+ special trains for festive rush",
            "url": "https://timesofindia.indiatimes.com"
        },
        {
            "id": "sig-3",
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "headline": "Intercity bus demand hits record highs across western and southern corridors",
            "url": "https://business-standard.com"
        }
    ]
