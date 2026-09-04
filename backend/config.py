from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/indiabuddy"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    JWT_SECRET_KEY: str = "supersecretkey"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    NEWSAPI_KEY: str = ""
    GHOST_BROWSER_URL: str = "http://ghost-browser:8001"
    
    CORS_ORIGINS: List[str] = ["*"]
    ENVIRONMENT: str = "development"
    
    RATE_LIMIT_PER_MINUTE: int = 60
    MAX_GHOST_BROWSER_POOL_SIZE: int = 3
    
    DAILY_REPORT_HOUR: int = 6

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
