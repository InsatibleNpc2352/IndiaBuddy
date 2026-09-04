from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
import html

from config import settings
from cache import redis_client

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

class InputSanitizationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Basic XSS strip from query params
        sanitized_query_params = {}
        modified = False
        for key, value in request.query_params.items():
            sanitized_value = html.escape(value)
            sanitized_query_params[key] = sanitized_value
            if sanitized_value != value:
                modified = True
                
        if modified:
            # We can't easily rewrite query_params in Starlette, so we update the scope directly
            # This is a bit hacky but works for demonstration
            query_string = "&".join(f"{k}={v}" for k, v in sanitized_query_params.items()).encode("utf-8")
            request.scope["query_string"] = query_string

        return await call_next(request)

class IPBlockMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ip = request.client.host if request.client else "unknown"
        
        # Check blacklist
        is_blocked = await redis_client.get(f"blacklist:ip:{ip}")
        if is_blocked:
            return JSONResponse(status_code=403, content={"detail": "IP address is blocked."})
            
        violation_count = await redis_client.get(f"violations:{ip}")
        if violation_count and int(violation_count) >= 3:
            # Add to permanent/longer blacklist and block
            await redis_client.setex(f"blacklist:ip:{ip}", 86400, "blocked") # block for 1 day
            return JSONResponse(status_code=403, content={"detail": "IP address is blocked."})

        return await call_next(request)
