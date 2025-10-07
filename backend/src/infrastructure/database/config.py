# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Database configuration and session management.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from contextlib import asynccontextmanager
from typing import AsyncGenerator

# Get database URL from environment
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://affilibuster:affilibuster@localhost:5432/affilibuster')

# Convert to async URL if using asyncpg
ASYNC_DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')

# Global engine and session factory (lazy-loaded)
_async_engine = None
_async_session_local = None


def get_engine():
    """Get or create the async engine."""
    global _async_engine
    if _async_engine is None:
        _async_engine = create_async_engine(
            ASYNC_DATABASE_URL,
            echo=bool(os.getenv('SQL_ECHO', False)),
            pool_pre_ping=True,
        )
    return _async_engine


def get_session_factory():
    """Get or create the async session factory."""
    global _async_session_local
    if _async_session_local is None:
        _async_session_local = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _async_session_local


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get a database session.

    Usage:
        async with get_db_session() as session:
            # Use session
            pass
    """
    SessionLocal = get_session_factory()
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for FastAPI to get database session.

    Usage:
        @app.get("/")
        async def route(db: AsyncSession = Depends(get_db)):
            pass
    """
    async with get_db_session() as session:
        yield session
