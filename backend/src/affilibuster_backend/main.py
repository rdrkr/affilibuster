# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
FastAPI main application entry point.

Dependency Injection:
- Singleton instances of repositories and services are created at startup
- Factory functions return configured use cases
- Routes depend on interfaces, not implementations (dependency inversion)
"""

import logging
from collections.abc import Awaitable, Callable
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from affilibuster_backend.config import settings

# Import OpenAPI contract loader
from affilibuster_backend.infrastructure.api.openapi_loader import openapi_contract_loader

# Import routers
from affilibuster_backend.infrastructure.api.routes import (
    about,
    components,
    contact,
    currencies,
    error_404,
    error_410,
    files,
    footer,
    homepage,
    languages,
    locales,
    navigation,
    preferences,
    privacy,
    product_page,
    products,
    system_message,
    term,
)

# Import dependency injection setup
from affilibuster_backend.infrastructure.dependencies import initialize_dependencies

# Import middleware
from affilibuster_backend.infrastructure.middleware import (
    ErrorHandlingMiddleware,
    RequestLoggingMiddleware,
)

# Configure logging
logging.basicConfig(level=getattr(logging, settings.log_level), format="%(message)s")

# Initialize dependencies before creating app
initialize_dependencies()

# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="Affilibuster API",
    description="Affiliation Platform API",
    version="1.0.0",
    root_path="/v1",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    # Serialize responses using field aliases (camelCase)
    response_model_by_alias=True,
)

# Module logger
logger = logging.getLogger(__name__)


# ============================================================================
# OpenAPI Contract Integration
# ============================================================================


def custom_openapi() -> dict[str, Any]:
    """
    Override FastAPI's auto-generated OpenAPI schema with the contract spec.

    This ensures /docs and /redoc display the exact OpenAPI contract from
    affilibuster.openapi.yaml rather than FastAPI's derived schema.

    Returns:
        OpenAPI specification from contract file, or FastAPI's default if contract unavailable.

    """
    # Use FastAPI's cached openapi schema if already generated
    if app.openapi_schema:
        return app.openapi_schema

    # Try to load the contract specification
    contract_spec = openapi_contract_loader.get_spec()

    if contract_spec:
        # Use the contract specification as-is
        logger.info("✅ Using OpenAPI contract for /docs and /redoc")
        app.openapi_schema = contract_spec
    else:
        # Fallback to FastAPI's auto-generated schema
        logger.warning("⚠️  OpenAPI contract not found, using FastAPI auto-generated schema")
        app.openapi_schema = get_openapi(
            title=app.title,
            version=app.version,
            description=app.description,
            routes=app.routes,
        )

    return app.openapi_schema


# Override the default openapi method
app.openapi = custom_openapi  # type: ignore[method-assign]


# Custom HTTP exception handler to return error responses without "detail" wrapper
# noinspection PyUnusedLocal
@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    """Return error responses directly without "detail" wrapper."""
    # If detail is a dict (from Error.model_dump()), return it directly
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
# Origins come from environment variable via settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Version middleware
class APIVersionMiddleware(BaseHTTPMiddleware):
    """Middleware to add API version header to all responses."""

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        """Dispatch the request and add API version header to response."""
        response = await call_next(request)
        response.headers["X-API-Version"] = "1.0.0"
        return response


app.add_middleware(APIVersionMiddleware)

# Add request logging middleware (T141)
app.add_middleware(RequestLoggingMiddleware)

# Add error handling middleware (T142)
app.add_middleware(ErrorHandlingMiddleware)

# Register routers (most specific prefixes first, least specific last)
app.include_router(languages.router)
app.include_router(currencies.router)
app.include_router(products.router)
app.include_router(preferences.router)

# Single-type routers (no prefix - must be last)
app.include_router(about.router)
app.include_router(contact.router)
app.include_router(error_404.router)
app.include_router(error_410.router)
app.include_router(footer.router)
app.include_router(homepage.router)
app.include_router(navigation.router)
app.include_router(privacy.router)
app.include_router(product_page.router)
app.include_router(system_message.router)
app.include_router(term.router)

# System/meta routers (no prefix - must be absolutely last to avoid conflicts)
app.include_router(components.router)
app.include_router(files.router)
app.include_router(locales.router)


@app.get("/", include_in_schema=False)
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Affilibuster API v1.0.0", "status": "running"}


@app.get("/health")
async def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}
