import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def refresh_top_routes():
    logger.info("Running job: Refresh prices for top 20 routes")
    # Impl here

async def fetch_news_sentiment():
    logger.info("Running job: Fetch latest news + run RNN sentiment")
    # Impl here

async def generate_daily_report():
    logger.info("Running job: Generate daily market report")
    # Impl here

async def verify_promo_codes():
    logger.info("Running job: Verify promo codes batch")
    # Impl here

async def retrain_model():
    logger.info("Running job: Retrain transformer model")
    # Impl here

def start_scheduler():
    scheduler = AsyncIOScheduler()
    
    # Every 4h
    scheduler.add_job(refresh_top_routes, 'interval', hours=4)
    # Every 6h
    scheduler.add_job(fetch_news_sentiment, 'interval', hours=6)
    # Daily at 06:00 IST (UTC+5:30 -> 00:30 UTC)
    scheduler.add_job(generate_daily_report, 'cron', hour=0, minute=30) 
    # Hourly
    scheduler.add_job(verify_promo_codes, 'interval', hours=1)
    # Weekly
    scheduler.add_job(retrain_model, 'interval', weeks=1)
    
    scheduler.start()
    logger.info("Scheduler started.")
