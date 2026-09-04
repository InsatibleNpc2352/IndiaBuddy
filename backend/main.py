from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging

from config import settings
from database import init_db
from scheduler import start_scheduler
from security.middleware import SecurityHeadersMiddleware, InputSanitizationMiddleware, IPBlockMiddleware

from routers import auth, search, predict, compare, history, cities, promos, news

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="IndiaBuddy Travel Tracker", version="1.0.0")

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"]) # Should configure in production
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(InputSanitizationMiddleware)
app.add_middleware(IPBlockMiddleware)

# Routers
app.include_router(auth.router)
app.include_router(search.router)
app.include_router(predict.router)
app.include_router(compare.router)
app.include_router(history.router)
app.include_router(cities.router)
app.include_router(promos.router)
app.include_router(news.router)

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing Database...")
    await init_db()
    logger.info("Starting Scheduler...")
    start_scheduler()

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}

# Exception Handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"message": "The requested resource was not found"},
    )

@app.exception_handler(422)
async def validation_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=422,
        content={"message": "Unprocessable Entity", "details": str(exc)},
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Internal Server Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error"},
    )
