# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Unit tests for Strapi repository implementation."""

from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from infrastructure.cms.strapi_repository_impl import (
    StrapiAPIError,
    StrapiRepositoryImpl,
)


class TestStrapiAPIError:
    """Tests for StrapiAPIError exception."""

    def test_initialization_with_all_parameters(self):
        """Test that StrapiAPIError initializes with all parameters."""
        error = StrapiAPIError(
            status_code=404,
            message="Not Found",
            details={"error": "Resource not found"},
        )

        assert error.status_code == 404
        assert error.message == "Not Found"
        assert error.details == {"error": "Resource not found"}
        assert str(error) == "Strapi API error (404): Not Found"

    def test_initialization_without_details(self):
        """Test that StrapiAPIError initializes with empty details when not provided."""
        error = StrapiAPIError(status_code=500, message="Internal Server Error")

        assert error.status_code == 500
        assert error.message == "Internal Server Error"
        assert error.details == {}


class TestStrapiRepositoryInitialization:
    """Tests for StrapiRepositoryImpl initialization."""

    def test_initialization_with_default_values(self):
        """Test that repository initializes with default values from settings."""
        with patch("infrastructure.cms.strapi_repository_impl.settings") as mock_settings:
            mock_settings.strapi_url = "http://strapi:1337"
            mock_settings.strapi_api_token = "test-token"

            repo = StrapiRepositoryImpl()

            assert repo.base_url == "http://strapi:1337"
            assert repo.api_token == "test-token"
            assert repo.timeout == 30.0

    def test_initialization_with_custom_values(self):
        """Test that repository accepts custom base URL and API token."""
        repo = StrapiRepositoryImpl(base_url="http://custom:1337", api_token="custom-token")

        assert repo.base_url == "http://custom:1337"
        assert repo.api_token == "custom-token"
        assert repo.timeout == 30.0


class TestGetHeaders:
    """Tests for _get_headers method."""

    def test_get_headers_with_api_token(self):
        """Test that _get_headers includes Authorization header when token is present."""
        repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
        headers = repo._get_headers()

        assert headers == {"Authorization": "Bearer test-token"}

    def test_get_headers_without_api_token(self):
        """Test that _get_headers returns empty dict when token is not present."""
        with patch("infrastructure.cms.strapi_repository_impl.settings") as mock_settings:
            mock_settings.strapi_url = "http://strapi:1337"
            mock_settings.strapi_api_token = ""  # Empty string

            repo = StrapiRepositoryImpl(base_url="http://strapi:1337")
            headers = repo._get_headers()

            assert headers == {}


class TestBuildUrl:
    """Tests for _build_url method."""

    def test_build_url_with_api_prefix(self):
        """Test that _build_url handles path that already starts with /api/."""
        repo = StrapiRepositoryImpl(base_url="http://strapi:1337")
        url = repo._build_url("/api/about")

        assert url == "http://strapi:1337/api/about"

    def test_build_url_with_slash_prefix(self):
        """Test that _build_url adds /api prefix to path starting with /."""
        repo = StrapiRepositoryImpl(base_url="http://strapi:1337")
        url = repo._build_url("/about")

        assert url == "http://strapi:1337/api/about"

    def test_build_url_without_slash_prefix(self):
        """Test that _build_url adds /api/ prefix to path without leading slash."""
        repo = StrapiRepositoryImpl(base_url="http://strapi:1337")
        url = repo._build_url("about")

        assert url == "http://strapi:1337/api/about"


class TestGet:
    """Tests for get method."""

    @pytest.mark.asyncio
    async def test_get_successful_request(self):
        """Test that get returns data on successful request."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": {"title": "About Us"}}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.get.return_value = mock_response

        with patch(
            "infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
            result = await repo.get("/about")

            assert result == {"data": {"title": "About Us"}}
            mock_client.get.assert_called_once_with(
                "http://strapi:1337/api/about",
                params={},
                headers={"Authorization": "Bearer test-token"},
            )

    @pytest.mark.asyncio
    async def test_get_with_params(self):
        """Test that get passes query parameters."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": []}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.get.return_value = mock_response

        with patch("infrastructure.cms.strapi_repository_impl.settings") as mock_settings:
            mock_settings.strapi_url = "http://strapi:1337"
            mock_settings.strapi_api_token = ""  # Empty string

            with patch(
                "infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
                return_value=mock_client,
            ):
                repo = StrapiRepositoryImpl(base_url="http://strapi:1337")
                _result = await repo.get("/products", params={"locale": "en"})

                mock_client.get.assert_called_once_with(
                    "http://strapi:1337/api/products",
                    params={"locale": "en"},
                    headers={},
                )

    @pytest.mark.asyncio
    async def test_get_raises_strapi_api_error_on_http_error(self):
        """Test that get raises StrapiAPIError on HTTP error."""
        mock_error_response = MagicMock()
        mock_error_response.status_code = 404
        mock_error_response.json.return_value = {"error": {"message": "Not found"}}

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.get.side_effect = httpx.HTTPStatusError(
            "Not Found",
            request=MagicMock(),
            response=mock_error_response,
        )

        with patch(
            "infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token=None)

            with pytest.raises(StrapiAPIError) as exc_info:
                await repo.get("/nonexistent")

            assert exc_info.value.status_code == 404
            assert "GET /nonexistent failed" in exc_info.value.message
            assert exc_info.value.details == {"error": {"message": "Not found"}}

    @pytest.mark.asyncio
    async def test_get_raises_strapi_api_error_on_connection_error(self):
        """Test that get raises StrapiAPIError on connection error."""
        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.get.side_effect = httpx.RequestError("Connection failed")

        with patch(
            "infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token=None)

            with pytest.raises(StrapiAPIError) as exc_info:
                await repo.get("/about")

            assert exc_info.value.status_code == 502
            assert "Failed to connect to Strapi" in exc_info.value.message


class TestPost:
    """Tests for post method."""

    @pytest.mark.asyncio
    async def test_post_successful_request(self):
        """Test that post returns data on successful request."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": {"id": 1, "name": "New Product"}}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.post.return_value = mock_response

        with patch(
            "infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
            data = {"name": "New Product", "price": 100}
            result = await repo.post("/products", data)

            assert result == {"data": {"id": 1, "name": "New Product"}}
            mock_client.post.assert_called_once_with(
                "http://strapi:1337/api/products",
                json=data,
                params={},
                headers={"Authorization": "Bearer test-token"},
            )

    @pytest.mark.asyncio
    async def test_post_with_params(self):
        """Test that post passes query parameters."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": {}}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.post.return_value = mock_response

        with patch("infrastructure.cms.strapi_repository_impl.settings") as mock_settings:
            mock_settings.strapi_url = "http://strapi:1337"
            mock_settings.strapi_api_token = ""  # Empty string

            with patch(
                "infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
                return_value=mock_client,
            ):
                repo = StrapiRepositoryImpl(base_url="http://strapi:1337")
                data = {"title": "Test"}
                _result = await repo.post("/articles", data, params={"locale": "en"})

                mock_client.post.assert_called_once_with(
                    "http://strapi:1337/api/articles",
                    json=data,
                    params={"locale": "en"},
                    headers={},
                )

    @pytest.mark.asyncio
    async def test_post_raises_strapi_api_error_on_http_error(self):
        """Test that post raises StrapiAPIError on HTTP error."""
        mock_error_response = MagicMock()
        mock_error_response.status_code = 400
        mock_error_response.json.return_value = {"error": {"message": "Validation failed"}}

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.post.side_effect = httpx.HTTPStatusError(
            "Bad Request",
            request=MagicMock(),
            response=mock_error_response,
        )

        with patch(
            "infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token=None)

            with pytest.raises(StrapiAPIError) as exc_info:
                await repo.post("/products", {"invalid": "data"})

            assert exc_info.value.status_code == 400
            assert "POST /products failed" in exc_info.value.message
            assert exc_info.value.details == {"error": {"message": "Validation failed"}}

    @pytest.mark.asyncio
    async def test_post_raises_strapi_api_error_on_connection_error(self):
        """Test that post raises StrapiAPIError on connection error."""
        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.post.side_effect = httpx.RequestError("Connection timeout")

        with patch(
            "infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token=None)

            with pytest.raises(StrapiAPIError) as exc_info:
                await repo.post("/products", {"name": "Test"})

            assert exc_info.value.status_code == 502
            assert "Failed to connect to Strapi" in exc_info.value.message


class TestParseError:
    """Tests for _parse_error method."""

    def test_parse_error_with_valid_json(self):
        """Test that _parse_error returns JSON when response contains valid JSON."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"error": {"message": "Not found"}}

        result = StrapiRepositoryImpl._parse_error(mock_response)

        assert result == {"error": {"message": "Not found"}}

    def test_parse_error_with_invalid_json(self):
        """Test that _parse_error returns text when response doesn't contain valid JSON."""
        mock_response = MagicMock()
        mock_response.json.side_effect = Exception("Invalid JSON")
        mock_response.text = "Internal Server Error"

        result = StrapiRepositoryImpl._parse_error(mock_response)

        assert result == {"message": "Internal Server Error"}
