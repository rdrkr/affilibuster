# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Pytest configuration and fixtures for all tests.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from src.main import app
from src.infrastructure.database.models import Base
from src.infrastructure.database.config import get_db


# Test database URL (use in-memory SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
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
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        yield client

    # Drop tables after tests
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def seed_test_data():
    """Seed the test database with initial data."""
    from src.infrastructure.database.models.language import LanguageModel
    from src.infrastructure.database.models.currency import CurrencyModel
    from src.infrastructure.database.models.locale import LocaleModel

    async with TestSessionLocal() as session:
        # Seed languages
        languages = [
            LanguageModel(
                code='en',
                display_name='English',
                native_name='English',
                direction='ltr',
                url_prefix='',
                default_currency='USD',
                locale_code='en-US',
                is_default=True,
                is_active=True,
                sort_order=1,
            ),
            LanguageModel(
                code='it',
                display_name='Italian',
                native_name='Italiano',
                direction='ltr',
                url_prefix='/it',
                default_currency='EUR',
                locale_code='it-IT',
                is_default=False,
                is_active=True,
                sort_order=2,
            ),
            LanguageModel(
                code='he',
                display_name='Hebrew',
                native_name='עברית',
                direction='rtl',
                url_prefix='/il',
                default_currency='ILS',
                locale_code='he-IL',
                is_default=False,
                is_active=True,
                sort_order=3,
            ),
        ]
        session.add_all(languages)

        # Seed currencies
        currencies = [
            CurrencyModel(code='USD', name='US Dollar', symbol='$', decimal_places=2,
                         symbol_position='before', thousands_separator=',',
                         decimal_separator='.', is_active=True, sort_order=1),
            CurrencyModel(code='EUR', name='Euro', symbol='€', decimal_places=2,
                         symbol_position='after', thousands_separator='.',
                         decimal_separator=',', is_active=True, sort_order=2),
            CurrencyModel(code='GBP', name='British Pound', symbol='£', decimal_places=2,
                         symbol_position='before', thousands_separator=',',
                         decimal_separator='.', is_active=True, sort_order=3),
            CurrencyModel(code='ILS', name='Israeli Shekel', symbol='₪', decimal_places=2,
                         symbol_position='before', thousands_separator=',',
                         decimal_separator='.', is_active=True, sort_order=4),
            CurrencyModel(code='CAD', name='Canadian Dollar', symbol='$', decimal_places=2,
                         symbol_position='before', thousands_separator=',',
                         decimal_separator='.', is_active=True, sort_order=5),
            CurrencyModel(code='AUD', name='Australian Dollar', symbol='$', decimal_places=2,
                         symbol_position='before', thousands_separator=',',
                         decimal_separator='.', is_active=True, sort_order=6),
            CurrencyModel(code='JPY', name='Japanese Yen', symbol='¥', decimal_places=0,
                         symbol_position='before', thousands_separator=',',
                         decimal_separator='.', is_active=True, sort_order=7),
            CurrencyModel(code='CNY', name='Chinese Yuan', symbol='¥', decimal_places=2,
                         symbol_position='before', thousands_separator=',',
                         decimal_separator='.', is_active=True, sort_order=8),
        ]
        session.add_all(currencies)

        # Seed locales
        locales = [
            LocaleModel(code='en-US', language_code='en', country_code='US',
                       display_name='English (United States)', date_format='MM/DD/YYYY',
                       time_format='12h', first_day_of_week=0, is_active=True),
            LocaleModel(code='it-IT', language_code='it', country_code='IT',
                       display_name='Italiano (Italia)', date_format='DD/MM/YYYY',
                       time_format='24h', first_day_of_week=1, is_active=True),
            LocaleModel(code='he-IL', language_code='he', country_code='IL',
                       display_name='עברית (ישראל)', date_format='DD/MM/YYYY',
                       time_format='24h', first_day_of_week=0, is_active=True),
        ]
        session.add_all(locales)

        await session.commit()


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
            "urlPrefix": "",
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
            "urlPrefix": "/il",
            "defaultCurrency": "ILS",
            "localeCode": "he-IL",
            "isDefault": False,
            "isActive": True,
            "sortOrder": 3,
        },
    }
