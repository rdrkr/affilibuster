# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
FastAPI main application entry point.
"""
import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# Import routers
from src.infrastructure.api.routes import languages, content, currencies, preferences, webhooks

# Import middleware
from src.infrastructure.middleware import RequestLoggingMiddleware, ErrorHandlingMiddleware
from src.config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(
    title="Affilibuster API",
    description="Multi-language affiliate platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    # Serialize responses using field aliases (camelCase)
    response_model_by_alias=True,
)


# Custom HTTP exception handler to return error responses without "detail" wrapper
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom exception handler that returns error responses directly."""
    # If detail is a dict (from ErrorResponse.model_dump()), return it directly
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail,
        )
    # Otherwise return standard format
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

# CORS Configuration
# Allow origins from environment variable or default to localhost
cors_origins_str = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:1337"
)
cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Version middleware
class APIVersionMiddleware(BaseHTTPMiddleware):
    """Middleware to add API version header to all responses."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-API-Version"] = "1.0.0"
        return response


app.add_middleware(APIVersionMiddleware)

# Add request logging middleware (T141)
app.add_middleware(RequestLoggingMiddleware)

# Add error handling middleware (T142)
app.add_middleware(ErrorHandlingMiddleware)

# Register routers
app.include_router(languages.router)
app.include_router(content.router)
app.include_router(currencies.router)
app.include_router(preferences.router)
app.include_router(webhooks.router)

@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint."""
    return {"message": "Affilibuster API v1.0.0", "status": "running"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
