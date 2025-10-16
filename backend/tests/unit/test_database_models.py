# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for database models to improve coverage.

Covers:
- Model __repr__ methods
- Model initialization
"""

from uuid import uuid4
from datetime import UTC, datetime, timedelta

from src.infrastructure.database.models.content import ContentModel
from src.infrastructure.database.models.content_version import ContentVersionModel
from src.infrastructure.database.models.currency import CurrencyModel
from src.infrastructure.database.models.language import LanguageModel
from src.infrastructure.database.models.locale import LocaleModel
from src.infrastructure.database.models.url_route import URLRouteModel, URLRedirectModel
from src.infrastructure.database.models.user_preferences import UserPreferencesModel


class TestDatabaseModelRepr:
    """Test database model __repr__ methods."""

    def test_content_model_repr(self):
        """Test ContentModel __repr__."""
        model = ContentModel(
            id=uuid4(),
            type='page',
            status='draft',
            created_by='user-123',
            updated_by='user-123'
        )
        repr_str = repr(model)
        assert 'ContentModel' in repr_str

    def test_content_version_model_repr(self):
        """Test ContentVersionModel __repr__."""
        model = ContentVersionModel(
            id=uuid4(),
            content_id=uuid4(),
            language_code='en',
            slug='test-slug',
            title='Test Title',
            body='<p>Test</p>'
        )
        repr_str = repr(model)
        assert 'ContentVersionModel' in repr_str

    def test_currency_model_repr(self):
        """Test CurrencyModel __repr__."""
        model = CurrencyModel(
            code='USD',
            name='US Dollar',
            symbol='$',
            decimal_places=2,
            symbol_position='before',
            thousands_separator=',',
            decimal_separator='.'
        )
        repr_str = repr(model)
        assert 'CurrencyModel' in repr_str

    def test_language_model_repr(self):
        """Test LanguageModel __repr__."""
        model = LanguageModel(
            code='en',
            display_name='English',
            native_name='English',
            direction='ltr',
            url_prefix='/en',
            default_currency='USD',
            locale_code='en-US',
            is_default=True,
            is_active=True,
            sort_order=1
        )
        repr_str = repr(model)
        assert 'LanguageModel' in repr_str

    def test_locale_model_repr(self):
        """Test LocaleModel __repr__."""
        model = LocaleModel(
            code='en-US',
            language_code='en',
            country_code='US',
            display_name='English (United States)',
            date_format='MM/DD/YYYY',
            time_format='12h',
            first_day_of_week=0,
            is_active=True
        )
        repr_str = repr(model)
        assert 'LocaleModel' in repr_str

    def test_url_route_model_repr(self):
        """Test URLRouteModel __repr__."""
        model = URLRouteModel(
            id=uuid4(),
            content_version_id=uuid4(),
            language_code='en',
            path='/test-path',
            slug='test-slug'
        )
        repr_str = repr(model)
        assert 'URLRouteModel' in repr_str

    def test_url_redirect_model_repr(self):
        """Test URLRedirectModel __repr__."""
        model = URLRedirectModel(
            id=uuid4(),
            from_path='/old-path',
            to_primary_url_id=uuid4(),
            status_code=301,
            created_by='user-123'
        )
        repr_str = repr(model)
        assert 'URLRedirectModel' in repr_str

    def test_user_preferences_model_repr(self):
        """Test UserPreferencesModel __repr__."""
        model = UserPreferencesModel(
            id=uuid4(),
            session_id='session-123',
            selected_currency='USD',
            expires_at=datetime.now(UTC).replace(tzinfo=None) + timedelta(days=30)
        )
        repr_str = repr(model)
        assert 'UserPreferencesModel' in repr_str
