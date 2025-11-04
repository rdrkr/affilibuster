# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Database configuration and session management."""

import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from affilibuster_backend.config import settings

# Global engine and session factory (lazy-loaded)
_async_engine = None
_async_session_local = None


def get_engine() -> AsyncEngine:
    """Get or create the async engine."""
    global _async_engine  # noqa: PLW0603
    if _async_engine is None:
        sql_echo = os.getenv("SQL_ECHO", "false")
        _async_engine = create_async_engine(
            settings.database_url.replace("postgresql://", "postgresql+asyncpg://"),
            echo=sql_echo.lower() in ("true", "1", "yes"),
            pool_pre_ping=True,
        )
    return _async_engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Get or create the async session factory."""
    global _async_session_local  # noqa: PLW0603
    if _async_session_local is None:
        _async_session_local = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _async_session_local


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
