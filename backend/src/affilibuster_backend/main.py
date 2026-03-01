# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
FastAPI main application entry point.

Dependency Injection:
- Singleton instances of repositories and services are created at startup
- Factory functions return configured use cases
- Routes depend on interfaces, not implementations (dependency inversion)
"""

import logging
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from typing import Any

import httpx
from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from affilibuster_backend.config import settings

# Import domain models
from affilibuster_backend.domain.entities.generated.models import HealthResponse, RootResponse

# Import OpenAPI contract loader
from affilibuster_backend.infrastructure.api.openapi_loader import openapi_contract_loader

# Import routers
from affilibuster_backend.infrastructure.api.routes import (
    auth,
    consent,
    languages,
    newsletter,
    preferences,
    profile,
    redirects,
)

# Import centralized CMS routes
from affilibuster_backend.infrastructure.api.routes.generated.cms_routes import get_all_cms_routers

# Import database session and repositories
from affilibuster_backend.infrastructure.database.config import get_db_session
from affilibuster_backend.infrastructure.database.repositories import ConfigRepository

# Import dependency injection setup
from affilibuster_backend.infrastructure.dependencies import initialize_dependencies

# Import middleware
from affilibuster_backend.infrastructure.middleware import (
    ErrorHandlingMiddleware,
    QueryParamsParserMiddleware,
    RequestLoggingMiddleware,
)
from affilibuster_backend.infrastructure.middleware.rate_limiter import RateLimitMiddleware

# Configure logging
logging.basicConfig(level=getattr(logging, settings.log_level), format="%(message)s")

# Module logger
logger = logging.getLogger(__name__)


# ============================================================================
# Application Lifespan
# ============================================================================


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """
    Application lifespan handler.

    Startup:
    - Load Strapi API token from database
    - Initialize dependencies

    Shutdown:
    - Cleanup resources

    Note: Database migrations are handled by Alembic.
    Run `alembic upgrade head` before starting the app, or
    migrations will be applied automatically on startup via Docker.

    Args:
        _app: FastAPI application instance (unused, required by FastAPI signature).

    Raises:
        RuntimeError: If Strapi API token not found in database.
    """
    # Startup
    logger.info("🚀 Starting Affilibuster API...")

    # Load Strapi API token from database
    logger.info("🔑 Loading Strapi API token from database...")
    async with get_db_session() as session:
        config_repo = ConfigRepository(session)
        strapi_api_token = await config_repo.get_value("strapi_api_token")

        if not strapi_api_token:
            raise RuntimeError(
                "Strapi API token not found in database. Ensure CMS has started and generated the token."
            )

    logger.info("✅ Strapi API token loaded successfully")

    # Sanity check: Verify Strapi connectivity and authentication
    logger.info("🔌 Verifying Strapi connectivity and authentication...")

    try:
        async with httpx.AsyncClient(verify=settings.app_env == "production") as client:
            response = await client.get(
                f"{settings.strapi_url}/api/health",
                headers={"Authorization": f"Bearer {strapi_api_token}"},
                timeout=5.0,
            )
            response.raise_for_status()
            logger.info("✅ Strapi connection verified successfully")
    except httpx.HTTPStatusError as e:
        logger.exception("❌ Strapi authentication failed: %s", e.response.text)
        raise RuntimeError(f"Failed to authenticate with Strapi: {e.response.status_code} {e.response.text}") from e
    except httpx.RequestError as e:
        logger.exception("❌ Failed to connect to Strapi")
        raise RuntimeError(f"Failed to connect to Strapi: {e!s}") from e

    # Initialize dependencies
    logger.info("📦 Initializing dependencies...")
    initialize_dependencies(strapi_api_token)

    logger.info("✅ Affilibuster API started successfully")

    yield

    # Shutdown
    logger.info("🛑 Shutting down Affilibuster API...")


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
    lifespan=lifespan,
)


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

# Add query params parser middleware (bracket notation support)
# Must be added before request logging so parsed params are available to routes
app.add_middleware(QueryParamsParserMiddleware)

# Add rate limiting middleware (GDPR Art. 32 - security of processing)
app.add_middleware(RateLimitMiddleware)

# Add request logging middleware (T141)
app.add_middleware(RequestLoggingMiddleware)

# Add error handling middleware (T142)
app.add_middleware(ErrorHandlingMiddleware)

# Register routers (most specific prefixes first, least specific last)

# Custom routers with special logic (NOT pure CMS proxies)
app.include_router(auth.router)
app.include_router(consent.router)
app.include_router(newsletter.router)
app.include_router(profile.router)
app.include_router(languages.router)
app.include_router(preferences.router)
app.include_router(redirects.router)

# Centralized CMS proxy routers (auto-generated from configs)
for cms_router in get_all_cms_routers():
    app.include_router(cms_router)


@app.get("/", include_in_schema=False)
async def root() -> RootResponse:
    """Root endpoint."""
    return RootResponse(message=f"{app.title} v{app.version}", status="running")


@app.get("/health")
async def health() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="healthy")
