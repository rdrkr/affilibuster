# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Database configuration and session management."""

import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from affilibuster_backend.config import settings

# Global engine and session factory (lazy-loaded)
# For pytest-xdist support, we store separate engines per worker
_async_engines: dict[str, AsyncEngine] = {}
_async_session_factories: dict[str, async_sessionmaker[AsyncSession]] = {}


def _get_worker_id() -> str:
    """
    Get current pytest-xdist worker ID or 'main' if not in xdist.

    This ensures each xdist worker gets its own database engine,
    preventing 'attached to different loop' errors.
    """
    return os.getenv("PYTEST_XDIST_WORKER", "main")


def get_engine() -> AsyncEngine:
    """
    Get or create the async engine for the current worker.

    Each pytest-xdist worker gets its own engine to avoid event loop conflicts.
    In test mode, uses NullPool to prevent connection reuse across event loops.
    """
    worker_id = _get_worker_id()

    if worker_id not in _async_engines:
        sql_echo = os.getenv("SQL_ECHO", "false")
        is_testing = os.getenv("PYTEST_CURRENT_TEST") or os.getenv("PYTEST_XDIST_WORKER")

        # Build connection URL
        url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")

        # In tests, use NullPool to avoid connection reuse across event loops
        engine_kwargs: dict[str, object] = {
            "echo": sql_echo.lower() in ("true", "1", "yes"),
        }

        if is_testing:
            # NullPool: No connection pooling - new connection per request
            # Prevents "attached to different loop" errors in async tests
            engine_kwargs["poolclass"] = NullPool
        else:
            # Production: Use default connection pooling with health checks
            engine_kwargs["pool_pre_ping"] = True

        _async_engines[worker_id] = create_async_engine(url, **engine_kwargs)

    return _async_engines[worker_id]


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """
    Get or create the async session factory for the current worker.

    Each pytest-xdist worker gets its own session factory.
    """
    worker_id = _get_worker_id()

    if worker_id not in _async_session_factories:
        _async_session_factories[worker_id] = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )

    return _async_session_factories[worker_id]


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession]:
    """
    Get a database session.

    Usage:
        async with get_db_session() as session:
            # Use session
            pass
    """
    session_local = get_session_factory()
    async with session_local() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db() -> AsyncGenerator[AsyncSession]:
    """
    Dependency for FastAPI to get database session.

    Usage:
        @app.get("/")
        async def route(db: AsyncSession = Depends(get_db)):
            pass
    """
    async with get_db_session() as session:
        yield session
