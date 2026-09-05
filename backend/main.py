from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
import re

from config import settings
from database import init_db
from scheduler import start_scheduler
from security.middleware import SecurityHeadersMiddleware, InputSanitizationMiddleware, IPBlockMiddleware

from routers import auth, search, predict, compare, history, cities, promos, news

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="IndiaBuddy Travel Tracker", version="1.0.0")

# Build CORS origin list — always include Vercel deployment + localhost dev
_base_origins = list(settings.CORS_ORIGINS)
_extra_origins = [
    "https://frontend-steel-xi-11.vercel.app",
    "https://indiabuddy.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
for _o in _extra_origins:
    if _o not in _base_origins:
        _base_origins.append(_o)

def _is_allowed_origin(origin: str) -> bool:
    """Allow any *.vercel.app subdomain at runtime (covers preview deployments)."""
    if origin in _base_origins:
        return True
    if re.match(r"https://[a-zA-Z0-9-]+(\.vercel\.app)$", origin):
        return True
    return False

class DynamicCORSMiddleware:
    """Wraps CORSMiddleware with dynamic origin checking for *.vercel.app."""
    pass

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=_base_origins,
    allow_origin_regex=r"https://[a-zA-Z0-9\-]+\.vercel\.app",
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
