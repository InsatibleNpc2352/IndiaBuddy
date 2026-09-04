import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Float, ForeignKey, Text

from config import settings

try:
    if "postgresql" in settings.DATABASE_URL:
        import asyncpg
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
except Exception:
    engine = create_async_engine("sqlite+aiosqlite:///./indiabuddy.db", echo=False)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    preferences = Column(JSON, default={})
    
    alerts = relationship("UserAlert", back_populates="user")
    saved_routes = relationship("SavedRoute", back_populates="user")

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String, nullable=False, index=True)
    destination = Column(String, nullable=False, index=True)
    distance_km = Column(Float)

class PriceRecord(Base):
    __tablename__ = "price_records"
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    mode = Column(String, nullable=False)
    operator = Column(String)
    price = Column(Float, nullable=False)
    travel_class = Column(String)
    scraped_at = Column(DateTime, default=datetime.datetime.utcnow)
    travel_date = Column(DateTime, nullable=False)
    source_site = Column(String)
    fees_included = Column(Boolean, default=False)
    raw_data = Column(JSON, default={})

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    mode = Column(String, nullable=False)
    predicted_price = Column(Float, nullable=False)
    confidence_low = Column(Float)
    confidence_high = Column(Float)
    prediction_date = Column(DateTime, default=datetime.datetime.utcnow)
    target_date = Column(DateTime, nullable=False)
    model_version = Column(String)
    zone = Column(String) # live/forecast/speculative

class PromoCode(Base):
    __tablename__ = "promo_codes"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, index=True, nullable=False)
    platform = Column(String, nullable=False)
    discount_type = Column(String, nullable=False) # flat/percent
    discount_value = Column(Float, nullable=False)
    max_discount_inr = Column(Float)
    min_booking_inr = Column(Float)
    expiry_date = Column(DateTime)
    is_verified = Column(Boolean, default=False)
    applicable_modes = Column(JSON, default=[]) # list of modes
    card_required = Column(String)
    source_url = Column(String)
    last_verified_at = Column(DateTime)

class NewsArticle(Base):
    __tablename__ = "news_articles"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    source = Column(String)
    url = Column(String)
    published_at = Column(DateTime)
    sentiment_score = Column(Float)
    sentiment_label = Column(String)
    summary = Column(Text)
    affected_modes = Column(JSON, default=[]) # list of modes
    raw_text = Column(Text)

class DailyReport(Base):
    __tablename__ = "daily_reports"
    id = Column(Integer, primary_key=True, index=True)
    report_date = Column(DateTime, default=datetime.datetime.utcnow)
    flight_sentiment = Column(String)
    train_sentiment = Column(String)
    bus_sentiment = Column(String)
    report_markdown = Column(Text)
    recommendation = Column(Text)

class UserAlert(Base):
    __tablename__ = "user_alerts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    mode = Column(String)
    target_price = Column(Float, nullable=False)
    alert_channel = Column(String, nullable=False) # email/push
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    triggered_at = Column(DateTime)
    
    user = relationship("User", back_populates="alerts")

class SavedRoute(Base):
    __tablename__ = "saved_routes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
import logging
logger = logging.getLogger(__name__)

async def init_db():
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Connected to primary database successfully.")
    except Exception as e:
        logger.warning(f"Primary database unreachable ({e}). Falling back to local SQLite database.")
        engine = create_async_engine("sqlite+aiosqlite:///./indiabuddy.db", echo=False)
        AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Initialized local SQLite database (indiabuddy.db).")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
