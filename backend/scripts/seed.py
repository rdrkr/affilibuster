# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Database seeding script for development and testing.
Seeds initial data for languages, currencies, and locales.
"""

import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.infrastructure.database.config import get_db_session
from src.infrastructure.database.models.language import LanguageModel
from src.infrastructure.database.models.currency import CurrencyModel
from src.infrastructure.database.models.locale import LocaleModel
from src.infrastructure.database.models.content import ContentModel
from src.infrastructure.database.models.content_version import ContentVersionModel
from sqlalchemy import select
import uuid
from datetime import UTC, datetime


async def seed_languages():
    """
    Seed the languages table with 3 supported languages.
    Reference: data-model.md:37-77
    """
    print("Seeding languages...")
    async with get_db_session() as session:
        # Check if already seeded
        result = await session.execute(select(LanguageModel))
        if result.scalars().first():
            print("  ⏭️  Languages already seeded, skipping...")
            return

        languages = [
            LanguageModel(
                code='en',
                display_name='English',
                native_name='English',
                direction='ltr',
                url_prefix='/en',
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
                url_prefix='/he',
                default_currency='ILS',
                locale_code='he-IL',
                is_default=False,
                is_active=True,
                sort_order=3,
            ),
        ]
        session.add_all(languages)
        await session.commit()
        print(f"  ✅ Seeded {len(languages)} languages")


async def seed_currencies():
    """
    Seed the currencies table with 8 supported currencies.
    Reference: data-model.md:280-316
    """
    print("Seeding currencies...")
    async with get_db_session() as session:
        # Check if already seeded
        result = await session.execute(select(CurrencyModel))
        if result.scalars().first():
            print("  ⏭️  Currencies already seeded, skipping...")
            return

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
        await session.commit()
        print(f"  ✅ Seeded {len(currencies)} currencies")


async def seed_locales():
    """
    Seed the locales table with 3 locales.
    Reference: data-model.md:395-428
    """
    print("Seeding locales...")
    async with get_db_session() as session:
        # Check if already seeded
        result = await session.execute(select(LocaleModel))
        if result.scalars().first():
            print("  ⏭️  Locales already seeded, skipping...")
            return

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
        print(f"  ✅ Seeded {len(locales)} locales")


async def seed_content():
    """
    Seed the content table with sample content for testing.
    """
    print("Seeding content...")
    async with get_db_session() as session:
        # Check if already seeded
        result = await session.execute(select(ContentModel))
        if result.scalars().first():
            print("  ⏭️  Content already seeded, skipping...")
            return

        # Create sample content with versions
        # Content 1: Test Product (EN only)
        content1_id = uuid.uuid4()
        content1 = ContentModel(
            id=content1_id,
            type='product',
            status='published',
            created_by='seed_script',
            updated_by='seed_script',
        )
        version1 = ContentVersionModel(
            id=uuid.uuid4(),
            content_id=content1_id,
            language_code='en',
            slug='test-product',
            title='Test Product',
            body='<p>This is a test product description</p>',
            excerpt='Test product for testing',
            meta_title='Test Product | Affilibuster',
            meta_description='Test product description for SEO',
            is_published=True,
            published_at=datetime.now(UTC).replace(tzinfo=None),
        )

        # Content 2: Eco Bottle (EN and IT)
        content2_id = uuid.uuid4()
        content2 = ContentModel(
            id=content2_id,
            type='product',
            status='published',
            created_by='seed_script',
            updated_by='seed_script',
        )
        version2_en = ContentVersionModel(
            id=uuid.uuid4(),
            content_id=content2_id,
            language_code='en',
            slug='eco-bottle',
            title='Eco Bottle',
            body='<p>Sustainable reusable water bottle made from stainless steel</p>',
            excerpt='Eco-friendly water bottle',
            meta_title='Eco Bottle | Affilibuster',
            meta_description='Buy sustainable reusable bottles',
            is_published=True,
            published_at=datetime.now(UTC).replace(tzinfo=None),
        )
        version2_it = ContentVersionModel(
            id=uuid.uuid4(),
            content_id=content2_id,
            language_code='it',
            slug='bottiglia-eco',
            title='Bottiglia Eco',
            body='<p>Bottiglia d\'acqua riutilizzabile sostenibile in acciaio inossidabile</p>',
            excerpt='Bottiglia ecologica',
            meta_title='Bottiglia Eco | Affilibuster',
            meta_description='Acquista bottiglie riutilizzabili sostenibili',
            is_published=True,
            published_at=datetime.now(UTC).replace(tzinfo=None),
        )

        # Content 3: New Product (EN only - for fallback testing)
        content3_id = uuid.uuid4()
        content3 = ContentModel(
            id=content3_id,
            type='product',
            status='published',
            created_by='seed_script',
            updated_by='seed_script',
        )
        version3_en = ContentVersionModel(
            id=uuid.uuid4(),
            content_id=content3_id,
            language_code='en',
            slug='new-product',
            title='New Product',
            body='<p>This is a new product available only in English</p>',
            excerpt='New product for testing fallback',
            meta_title='New Product | Affilibuster',
            meta_description='New product description',
            is_published=True,
            published_at=datetime.now(UTC).replace(tzinfo=None),
        )

        session.add_all([content1, version1, content2, version2_en, version2_it, content3, version3_en])
        await session.commit()
        print(f"  ✅ Seeded 3 content items with 4 versions")


async def main():
    """
    Main seeding function.
    Runs all seed functions in order.
    """
    print("🌱 Starting database seeding...")

    try:
        # Seed in dependency order
        await seed_languages()
        await seed_currencies()
        await seed_locales()
        await seed_content()

        print("✅ Database seeding completed successfully!")
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
