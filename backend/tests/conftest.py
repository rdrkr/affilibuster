# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Pytest configuration and fixtures for all tests.

Provides:
- Real PostgreSQL database for integration tests
- Real Strapi CMS integration (no mocking)
- Sample test data
"""

import asyncio
import os
from pathlib import Path

import httpx
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from affilibuster_backend.config import settings
from affilibuster_backend.infrastructure.cms.strapi_repository_impl import StrapiRepositoryImpl
from affilibuster_backend.main import app


def is_running_in_docker() -> bool:
    """Detect if running inside Docker container."""
    return Path("/.dockerenv").exists() or os.environ.get("DOCKER_ENV") == "true"


def get_strapi_url() -> str:
    """
    Get Strapi URL based on execution environment.

    In Docker: Uses internal hostname from settings (strapi:1337)
    Locally: Uses localhost:1337
    """
    if is_running_in_docker():
        return f"{settings.cms_protocol}://{settings.internal_cms_host}:{settings.cms_port}"
    return f"{settings.cms_protocol}://{settings.cms_host}:{settings.cms_port}"


@pytest_asyncio.fixture
async def async_client():
    """
    Fixture providing an async HTTP client for unit testing.

    For unit tests - uses the app without real database connections.
    For integration tests with real database, use integration_client instead.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


@pytest.fixture
def strapi_url():
    """Fixture providing Strapi URL based on execution environment."""
    return get_strapi_url()


@pytest_asyncio.fixture
async def strapi_token():
    """Fixture providing Strapi API token for tests."""
    # Fetch token from database
    from affilibuster_backend.infrastructure.database.config import get_db_session
    from affilibuster_backend.infrastructure.database.repositories.config_repository import ConfigRepository

    async with get_db_session() as session:
        repo = ConfigRepository(session)
        token = await repo.get_value("strapi_api_token")
        if not token:
            raise RuntimeError("Strapi API token not found in database for tests")
        return token


@pytest_asyncio.fixture
async def wait_for_strapi(strapi_url: str):
    """
    Fixture that waits for Strapi to be healthy before tests run.

    Implements retry logic with exponential backoff.
    Disables SSL verification for self-signed certificates in development.
    """
    max_retries = 30
    retry_delay = 1  # Start with 1 second
    # Disable SSL verification for self-signed certificates in development
    verify_ssl = settings.app_env == "production"

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(verify=verify_ssl) as client:
                response = await client.get(f"{strapi_url}/_health", timeout=5.0)
                if response.status_code in (200, 204):
                    yield
                    return
        except (httpx.ConnectError, httpx.ReadError, httpx.TimeoutException):
            pass

        if attempt < max_retries - 1:
            await asyncio.sleep(retry_delay)

    raise RuntimeError(f"Strapi did not become healthy at {strapi_url} after {max_retries} attempts")


@pytest.fixture
async def real_cms_repository(strapi_url, strapi_token):
    """Fixture providing a real Strapi repository client."""
    return StrapiRepositoryImpl(api_token=strapi_token, base_url=strapi_url)


@pytest_asyncio.fixture
async def integration_app(wait_for_strapi, strapi_token):
    """
    Fixture providing the app with real Strapi repository (no mocking).

    Uses the real Strapi service instead of mocks for true integration testing.
    """
    # Reinitialize dependencies with test token
    from affilibuster_backend.infrastructure.dependencies import initialize_dependencies

    initialize_dependencies(strapi_api_token=strapi_token)

    yield app


@pytest_asyncio.fixture
async def integration_client(integration_app):
    """
    Fixture providing an async HTTP client for real integration tests.

    Uses real Strapi service and real PostgreSQL database (no mocking).
    Database is seeded during backend startup via 'uv run task seed'.
    Depends on integration_app to ensure dependencies are reinitialized.
    """
    async with AsyncClient(transport=ASGITransport(app=integration_app), base_url="http://backend:8000") as client:
        yield client


@pytest.fixture
def strapi_test_data(wait_for_strapi):
    """
    Fixture ensuring Strapi is ready with seeded data.

    Strapi should already be seeded via 'npm run seed' in the CMS.
    This fixture just ensures Strapi is available before tests run.

    Tests should use expected_seed_data constants for assertions:
        from tests.fixtures.expected_seed_data import EXPECTED_CURRENCIES

    IMPORTANT: If cms/src/seed.ts changes, update tests/fixtures/expected_seed_data.py
    """
    # Strapi is ready (wait_for_strapi dependency ensures this)
    # No test data creation needed - Strapi is already seeded
    return


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


@pytest.fixture
def mock_languages_data():
    """Fixture providing mock languages response from Strapi."""
    return {
        "data": [
            {
                "id": 1,
                "documentId": "lang-en",
                "attributes": {
                    "code": "en",
                    "displayName": "English",
                    "nativeName": "English",
                    "direction": "ltr",
                    "defaultCurrency": "USD",
                    "localeCode": "en-US",
                    "isDefault": True,
                    "isActive": True,
                    "sortOrder": 1,
                },
            },
            {
                "id": 2,
                "documentId": "lang-it",
                "attributes": {
                    "code": "it",
                    "displayName": "Italian",
                    "nativeName": "Italiano",
                    "direction": "ltr",
                    "defaultCurrency": "EUR",
                    "localeCode": "it-IT",
                    "isDefault": False,
                    "isActive": True,
                    "sortOrder": 2,
                },
            },
        ],
    }


@pytest.fixture
def mock_currencies_data():
    """Fixture providing mock currencies response from Strapi."""
    return {
        "data": [
            {
                "id": 1,
                "documentId": "curr-usd",
                "attributes": {
                    "code": "USD",
                    "name": "US Dollar",
                    "symbol": "$",
                    "isActive": True,
                    "decimalPlaces": 2,
                    "symbolPosition": "before",
                },
            },
            {
                "id": 2,
                "documentId": "curr-eur",
                "attributes": {
                    "code": "EUR",
                    "name": "Euro",
                    "symbol": "€",
                    "isActive": True,
                    "decimalPlaces": 2,
                    "symbolPosition": "after",
                },
            },
        ],
    }


@pytest.fixture
def mock_content_data():
    """Fixture providing mock content response from Strapi."""
    return {
        "data": [
            {
                "id": 1,
                "documentId": "content-123",
                "attributes": {
                    "title": "Test Page",
                    "slug": "test-page",
                    "content": "This is a test page",
                    "excerpt": "Short excerpt",
                    "language": "en",
                    "metaTitle": "Test Page - SEO Title",
                    "metaDescription": "SEO description",
                    "metaKeywords": ["test", "page"],
                    "publishedAt": "2025-01-01T00:00:00Z",
                    "status": "published",
                },
            },
        ],
    }
