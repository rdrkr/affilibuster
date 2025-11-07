# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for preferences route handlers.

Tests currency validation exception handling and route logic.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from affilibuster_backend.domain.entities.generated.models import (
    CurrencyCode,
    DetectedLanguage2,
    UserPreferences,
)
from affilibuster_backend.infrastructure.api.routes.preferences import router, validate_currency_code


@pytest.mark.unit
class TestValidateCurrencyCode:
    """Test validate_currency_code function."""

    @pytest.mark.asyncio
    async def test_validate_currency_code_returns_false_on_exception(self):
        """Test validate_currency_code returns False when exception occurs."""
        # Arrange
        use_case = AsyncMock()
        use_case.execute.side_effect = Exception("Test exception")

        # Act
        result = await validate_currency_code(CurrencyCode.USD, use_case)

        # Assert
        assert result is False

    @pytest.mark.asyncio
    async def test_validate_currency_code_returns_false_on_http_error(self):
        """Test validate_currency_code returns False on HTTP errors."""
        # Arrange
        use_case = AsyncMock()
        use_case.execute.side_effect = RuntimeError("HTTP error")

        # Act
        result = await validate_currency_code(CurrencyCode.EUR, use_case)

        # Assert
        assert result is False

    @pytest.mark.asyncio
    async def test_validate_currency_code_returns_false_on_timeout(self):
        """Test validate_currency_code returns False on timeout."""
        # Arrange
        use_case = AsyncMock()
        use_case.execute.side_effect = TimeoutError("Request timeout")

        # Act
        result = await validate_currency_code(CurrencyCode.GBP, use_case)

        # Assert
        assert result is False


@pytest.mark.unit
class TestGetPreferencesRoute:
    """Test GET preferences route handler."""

    @pytest.fixture
    def test_app(self):
        """Create test FastAPI app with preferences routes."""
        app = FastAPI()
        app.include_router(router, prefix="/v1")
        return app

    @pytest.fixture
    def mock_get_use_case(self):
        """Create mock GetUserPreferences use case."""
        return AsyncMock()

    @pytest.fixture
    def mock_update_use_case(self):
        """Create mock UpdateUserPreferences use case."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_get_preferences_creates_new_when_none_exist(self, test_app, mock_get_use_case, mock_update_use_case):
        """Test GET creates new preferences when none exist (covers line 94)."""
        from affilibuster_backend.infrastructure.dependencies import (
            get_get_user_preferences_use_case,
            get_update_user_preferences_use_case,
        )

        # Mock get_use_case to return None (no existing preferences)
        mock_get_use_case.execute.return_value = None

        # Mock update_use_case to return new preferences (with timezone-aware datetimes)
        new_prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            detected_language=None,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )
        mock_update_use_case.execute.return_value = new_prefs

        # Override dependencies
        test_app.dependency_overrides[get_get_user_preferences_use_case] = lambda: mock_get_use_case
        test_app.dependency_overrides[get_update_user_preferences_use_case] = lambda: mock_update_use_case

        async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
            response = await client.get(
                "/v1/user/preferences",
                headers={"X-Session-Id": "test-session"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["sessionId"] == "test-session"
        assert data["selectedCurrency"] == "USD"

        # Verify new preferences were created
        mock_update_use_case.execute.assert_called_once()


@pytest.mark.unit
class TestUpdatePreferencesRoute:
    """Test PUT preferences route handler."""

    @pytest.fixture
    def test_app(self):
        """Create test FastAPI app with preferences routes."""
        app = FastAPI()
        app.include_router(router, prefix="/v1")
        return app

    @pytest.fixture
    def mock_strapi_use_case(self):
        """Create mock Strapi use case."""
        use_case = AsyncMock()

        # Create mock currency objects with necessary fields
        class MockCurrency:
            def __init__(self, code, is_active) -> None:
                self.code = code
                self.is_active = is_active

        class MockCurrencyResponse:
            def __init__(self) -> None:
                self.data = [
                    MockCurrency("USD", True),
                    MockCurrency("EUR", True),
                ]

        # Mock valid currency response
        use_case.execute.return_value = MockCurrencyResponse()
        return use_case

    @pytest.fixture
    def mock_update_use_case(self):
        """Create mock UpdateUserPreferences use case."""
        return AsyncMock()

    @pytest.fixture
    def mock_prefs_repo(self):
        """Create mock preferences repository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_update_preferences_with_existing_preferences(
        self, test_app, mock_strapi_use_case, mock_update_use_case, mock_prefs_repo
    ):
        """Test PUT updates existing preferences (covers lines 144-153)."""
        from affilibuster_backend.infrastructure.dependencies import (
            get_cms_content_use_case,
            get_preferences_repo,
            get_update_user_preferences_use_case,
        )

        # Mock existing preferences
        existing_prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            detected_language=None,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )
        mock_prefs_repo.get_by_session.return_value = existing_prefs

        # Mock update result (with timezone-aware datetimes)
        updated_prefs = UserPreferences(
            id=existing_prefs.id,
            session_id="test-session",
            selected_currency=CurrencyCode.EUR,
            dismissed_language_prompt=False,
            detected_language=None,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )
        mock_update_use_case.execute.return_value = updated_prefs

        # Override dependencies
        test_app.dependency_overrides[get_cms_content_use_case] = lambda: mock_strapi_use_case
        test_app.dependency_overrides[get_update_user_preferences_use_case] = lambda: mock_update_use_case
        test_app.dependency_overrides[get_preferences_repo] = lambda: mock_prefs_repo

        async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
            response = await client.put(
                "/v1/user/preferences",
                headers={"X-Session-Id": "test-session"},
                json={"selectedCurrency": "EUR"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["selectedCurrency"] == "EUR"

        # Verify existing preferences were updated
        mock_prefs_repo.get_by_session.assert_called_once_with("test-session")
        mock_update_use_case.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_preferences_creates_new_when_none_exist(
        self, test_app, mock_strapi_use_case, mock_update_use_case, mock_prefs_repo
    ):
        """Test PUT creates new preferences when none exist (covers lines 154-162)."""
        from affilibuster_backend.infrastructure.dependencies import (
            get_cms_content_use_case,
            get_preferences_repo,
            get_update_user_preferences_use_case,
        )

        # Mock no existing preferences
        mock_prefs_repo.get_by_session.return_value = None

        # Mock update result (with timezone-aware datetimes)
        new_prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            selected_currency=CurrencyCode.EUR,
            dismissed_language_prompt=False,
            detected_language=None,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )
        mock_update_use_case.execute.return_value = new_prefs

        # Override dependencies
        test_app.dependency_overrides[get_cms_content_use_case] = lambda: mock_strapi_use_case
        test_app.dependency_overrides[get_update_user_preferences_use_case] = lambda: mock_update_use_case
        test_app.dependency_overrides[get_preferences_repo] = lambda: mock_prefs_repo

        async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
            response = await client.put(
                "/v1/user/preferences",
                headers={"X-Session-Id": "test-session"},
                json={"selectedCurrency": "EUR"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["sessionId"] == "test-session"
        assert data["selectedCurrency"] == "EUR"

        # Verify new preferences were created
        mock_prefs_repo.get_by_session.assert_called_once_with("test-session")
        mock_update_use_case.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_only_dismissed_language_prompt(
        self, test_app, mock_strapi_use_case, mock_update_use_case, mock_prefs_repo
    ):
        """Test PUT updates only dismissed_language_prompt on existing preferences (covers lines 148-149)."""
        from affilibuster_backend.infrastructure.dependencies import (
            get_cms_content_use_case,
            get_preferences_repo,
            get_update_user_preferences_use_case,
        )

        # Mock existing preferences
        existing_prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            detected_language=None,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )
        mock_prefs_repo.get_by_session.return_value = existing_prefs

        # Mock update result
        updated_prefs = UserPreferences(
            id=existing_prefs.id,
            session_id="test-session",
            selected_currency=CurrencyCode.USD,  # unchanged
            dismissed_language_prompt=True,  # changed
            detected_language=None,  # unchanged
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )
        mock_update_use_case.execute.return_value = updated_prefs

        # Override dependencies
        test_app.dependency_overrides[get_cms_content_use_case] = lambda: mock_strapi_use_case
        test_app.dependency_overrides[get_update_user_preferences_use_case] = lambda: mock_update_use_case
        test_app.dependency_overrides[get_preferences_repo] = lambda: mock_prefs_repo

        async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
            response = await client.put(
                "/v1/user/preferences",
                headers={"X-Session-Id": "test-session"},
                json={"dismissedLanguagePrompt": True},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["dismissedLanguagePrompt"] is True

        # Verify the existing preferences object was updated
        assert existing_prefs.dismissed_language_prompt is True

    @pytest.mark.asyncio
    async def test_update_only_detected_language(
        self, test_app, mock_strapi_use_case, mock_update_use_case, mock_prefs_repo
    ):
        """Test PUT updates only detected_language on existing preferences (covers lines 150-152)."""
        from affilibuster_backend.infrastructure.dependencies import (
            get_cms_content_use_case,
            get_preferences_repo,
            get_update_user_preferences_use_case,
        )

        # Mock existing preferences
        existing_prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            detected_language=None,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )
        mock_prefs_repo.get_by_session.return_value = existing_prefs

        # Mock update result
        updated_prefs = UserPreferences(
            id=existing_prefs.id,
            session_id="test-session",
            selected_currency=CurrencyCode.USD,  # unchanged
            dismissed_language_prompt=False,  # unchanged
            detected_language=DetectedLanguage2.IT,  # changed
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )
        mock_update_use_case.execute.return_value = updated_prefs

        # Override dependencies
        test_app.dependency_overrides[get_cms_content_use_case] = lambda: mock_strapi_use_case
        test_app.dependency_overrides[get_update_user_preferences_use_case] = lambda: mock_update_use_case
        test_app.dependency_overrides[get_preferences_repo] = lambda: mock_prefs_repo

        async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
            response = await client.put(
                "/v1/user/preferences",
                headers={"X-Session-Id": "test-session"},
                json={"detectedLanguage": "it"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["detectedLanguage"] == "it"

        # Verify existing preferences object was updated
        assert existing_prefs.detected_language == DetectedLanguage2.IT

    @pytest.mark.asyncio
    async def test_update_all_fields_on_existing_preferences(
        self, test_app, mock_strapi_use_case, mock_update_use_case, mock_prefs_repo
    ):
        """Test PUT updates all fields on existing preferences (covers lines 146-152)."""
        from affilibuster_backend.infrastructure.dependencies import (
            get_cms_content_use_case,
            get_preferences_repo,
            get_update_user_preferences_use_case,
        )

        # Mock existing preferences
        existing_prefs = UserPreferences(
            id=uuid4(),
            session_id="test-session",
            selected_currency=CurrencyCode.USD,
            dismissed_language_prompt=False,
            detected_language=None,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )
        mock_prefs_repo.get_by_session.return_value = existing_prefs

        # Mock update result
        updated_prefs = UserPreferences(
            id=existing_prefs.id,
            session_id="test-session",
            selected_currency=CurrencyCode.EUR,
            dismissed_language_prompt=True,
            detected_language=DetectedLanguage2.HE,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )
        mock_update_use_case.execute.return_value = updated_prefs

        # Override dependencies
        test_app.dependency_overrides[get_cms_content_use_case] = lambda: mock_strapi_use_case
        test_app.dependency_overrides[get_update_user_preferences_use_case] = lambda: mock_update_use_case
        test_app.dependency_overrides[get_preferences_repo] = lambda: mock_prefs_repo

        async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
            response = await client.put(
                "/v1/user/preferences",
                headers={"X-Session-Id": "test-session"},
                json={
                    "selectedCurrency": "EUR",
                    "dismissedLanguagePrompt": True,
                    "detectedLanguage": "he",
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert data["selectedCurrency"] == "EUR"
        assert data["dismissedLanguagePrompt"] is True
        assert data["detectedLanguage"] == "he"

        # Verify all fields were updated
        assert existing_prefs.selected_currency == CurrencyCode.EUR
        assert existing_prefs.dismissed_language_prompt is True
        assert existing_prefs.detected_language == DetectedLanguage2.HE

    @pytest.mark.asyncio
    async def test_update_preferences_with_invalid_currency_raises_400(
        self, test_app, mock_update_use_case, mock_prefs_repo
    ):
        """Test PUT with invalid currency raises 400 error (covers line 127)."""
        from affilibuster_backend.infrastructure.dependencies import (
            get_cms_content_use_case,
            get_preferences_repo,
            get_update_user_preferences_use_case,
        )

        # Create mock strapi use case that returns currencies NOT including JPY
        mock_invalid_strapi_use_case = AsyncMock()

        class MockCurrency:
            def __init__(self, code, is_active) -> None:
                self.code = code
                self.is_active = is_active

        class MockCurrencyResponse:
            def __init__(self) -> None:
                self.data = [
                    MockCurrency("USD", True),
                    MockCurrency("EUR", True),
                    # JPY is NOT in the list
                ]

        mock_invalid_strapi_use_case.execute.return_value = MockCurrencyResponse()

        # Mock no existing preferences (so we test validation before anything else)
        mock_prefs_repo.get_by_session.return_value = None

        # Override dependencies
        test_app.dependency_overrides[get_cms_content_use_case] = lambda: mock_invalid_strapi_use_case
        test_app.dependency_overrides[get_update_user_preferences_use_case] = lambda: mock_update_use_case
        test_app.dependency_overrides[get_preferences_repo] = lambda: mock_prefs_repo

        async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
            response = await client.put(
                "/v1/user/preferences",
                headers={"X-Session-Id": "test-session"},
                json={"selectedCurrency": "JPY"},  # JPY is valid enum but not in Strapi
            )

        # Should return 400 with INVALID_CURRENCY error
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        error_detail = data["detail"]
        assert error_detail["code"] == "INVALID_CURRENCY"
        assert "JPY" in error_detail["message"]

        # Verify validation was attempted but update was not called
        mock_invalid_strapi_use_case.execute.assert_called_once()
        mock_update_use_case.execute.assert_not_called()
