# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Pytest configuration and fixtures for all tests.
"""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from infrastructure.database.config import get_db
from infrastructure.database.models import Base
from main import app

# Test database URL (use in-memory SQLite for tests)
TEST_POSTGRES_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_POSTGRES_URL,
    echo=False,
)

# Create test session factory
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def override_get_db():
    """Override database dependency for tests."""
    async with TestSessionLocal() as session:
        yield session


# Override the dependency
app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture
async def async_client():
    """
    Fixture providing an async HTTP client for API testing.
    """
    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed test data
    await seed_test_data()

    # Create client
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client

    # Drop tables after tests
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def seed_test_data():
    """
    Seed the test database with initial data.

    Note: Languages and currencies are managed by Strapi CMS.
    Backend database only contains app-specific data (user_preferences, url_routes, url_redirects).
    No seeding required for tests.
    """
    # All content (languages, currencies) comes from Strapi
    # Backend DB only needs app-specific data for real tests
    pass


@pytest.fixture
def sample_session_id():
    """Fixture providing a sample session ID for testing."""
    return "test-session-123"


@pytest.fixture
def sample_language_data():
    """Fixture providing sample language data."""
    return {
        "en": {
            "code": "en",
            "displayName": "English",
            "nativeName": "English",
            "direction": "ltr",
            "urlPrefix": "/en",
            "defaultCurrency": "USD",
            "localeCode": "en-US",
            "isDefault": True,
            "isActive": True,
            "sortOrder": 1,
        },
        "it": {
            "code": "it",
            "displayName": "Italian",
            "nativeName": "Italiano",
            "direction": "ltr",
            "urlPrefix": "/it",
            "defaultCurrency": "EUR",
            "localeCode": "it-IT",
            "isDefault": False,
            "isActive": True,
            "sortOrder": 2,
        },
        "he": {
            "code": "he",
            "displayName": "Hebrew",
            "nativeName": "עברית",
            "direction": "rtl",
            "urlPrefix": "/he",
            "defaultCurrency": "ILS",
            "localeCode": "he-IL",
            "isDefault": False,
            "isActive": True,
            "sortOrder": 3,
        },
    }
