# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Unit tests for Strapi repository implementation."""

from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from affilibuster_backend.domain.entities import CMSAPIError
from affilibuster_backend.domain.entities.generated.cms_entities import CMSErrorDetails, LocalesResponse
from affilibuster_backend.domain.entities.generated.models import (
    AboutGetParametersQuery,
    CurrenciesGetResponse,
    LanguagesDetectPostRequest,
)
from affilibuster_backend.infrastructure.cms.strapi_repository_impl import (
    StrapiRepositoryImpl,
)


@pytest.mark.unit
class TestCMSAPIError:
    """Tests for CMSAPIError exception."""

    def test_initialization_with_all_parameters(self):
        """Test that CMSAPIError initializes with all parameters."""
        error = CMSAPIError(
            status_code=404,
            message="Not Found",
            details={"error": "Resource not found"},
        )

        assert error.status_code == 404
        assert error.message == "Not Found"
        assert isinstance(error.details, CMSErrorDetails)
        assert error.details.message == "Resource not found"
        assert str(error) == "CMS API error (404): Not Found"

    def test_initialization_without_details(self):
        """Test that CMSAPIError initializes with empty details when not provided."""
        error = CMSAPIError(status_code=500, message="Internal Server Error")

        assert error.status_code == 500
        assert error.message == "Internal Server Error"
        assert isinstance(error.details, CMSErrorDetails)
        assert error.details.message is None

    def test_initialization_with_strapi_error_dict(self):
        """Test CMSAPIError with Strapi-style error dict structure."""
        error = CMSAPIError(
            status_code=400,
            message="Bad Request",
            details={"error": {"message": "Invalid input", "name": "ValidationError", "status": 400}},
        )

        assert error.status_code == 400
        assert isinstance(error.details, CMSErrorDetails)
        assert error.details.message == "Invalid input"
        assert error.details.name == "ValidationError"
        assert error.details.status == 400

    def test_initialization_with_simple_message_dict(self):
        """Test CMSAPIError with simple message dict."""
        error = CMSAPIError(
            status_code=500,
            message="Server Error",
            details={"message": "Something went wrong"},
        )

        assert error.status_code == 500
        assert isinstance(error.details, CMSErrorDetails)
        assert error.details.message == "Something went wrong"

    def test_initialization_with_cms_error_details_object(self):
        """Test CMSAPIError with CMSErrorDetails object directly."""
        details = CMSErrorDetails(message="Direct error", status=403, name="ForbiddenError")
        error = CMSAPIError(
            status_code=403,
            message="Forbidden",
            details=details,
        )

        assert error.status_code == 403
        assert error.details is details
        assert error.details.message == "Direct error"


@pytest.mark.unit
class TestStrapiRepositoryInitialization:
    """Tests for StrapiRepositoryImpl initialization."""

    def test_initialization_with_default_values(self):
        """Test that repository initializes with default values from settings."""
        with patch("affilibuster_backend.infrastructure.cms.strapi_repository_impl.settings") as mock_settings:
            mock_settings.strapi_url = "http://strapi:1337"
            mock_settings.strapi_api_token = "test-token"

            repo = StrapiRepositoryImpl(api_token="test-token")

            assert repo.base_url == "http://strapi:1337"
            assert repo.api_token == "test-token"
            assert repo.timeout == 30.0

    def test_initialization_with_custom_values(self):
        """Test that repository accepts custom base URL and API token."""
        repo = StrapiRepositoryImpl(base_url="http://custom:1337", api_token="custom-token")

        assert repo.base_url == "http://custom:1337"
        assert repo.api_token == "custom-token"
        assert repo.timeout == 30.0


@pytest.mark.unit
class TestGetHeaders:
    """Tests for _get_headers method."""

    def test_get_headers_with_api_token(self):
        """Test that _get_headers includes Authorization header when token is present."""
        repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
        headers = repo._get_headers()

        assert headers == {"Authorization": "Bearer test-token"}

    def test_get_headers_without_api_token(self):
        """Test that _get_headers returns empty dict when token is not present."""
        with patch("affilibuster_backend.infrastructure.cms.strapi_repository_impl.settings") as mock_settings:
            mock_settings.strapi_url = "http://strapi:1337"
            mock_settings.strapi_api_token = ""  # Empty string

            repo = StrapiRepositoryImpl(api_token="", base_url="http://strapi:1337")
            headers = repo._get_headers()

            assert headers == {}


@pytest.mark.unit
class TestBuildUrl:
    """Tests for _build_url method."""

    def test_build_url_with_api_prefix(self):
        """Test that _build_url handles path that already starts with /api/."""
        repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")
        url = repo._build_url("/api/about")

        assert url == "http://strapi:1337/api/about"

    def test_build_url_with_slash_prefix(self):
        """Test that _build_url adds /api prefix to path starting with /."""
        repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")
        url = repo._build_url("/about")

        assert url == "http://strapi:1337/api/about"

    def test_build_url_without_slash_prefix(self):
        """Test that _build_url adds /api/ prefix to path without leading slash."""
        repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")
        url = repo._build_url("about")

        assert url == "http://strapi:1337/api/about"


@pytest.mark.unit
class TestGet:
    """Tests for get method."""

    @pytest.mark.asyncio
    async def test_get_successful_request(self):
        """Test that get returns data on successful request."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "data": [
                {
                    "documentId": "550e8400-e29b-41d4-a716-446655440000",
                    "id": 1,
                    "code": "USD",
                    "name": "US Dollar",
                    "symbol": "$",
                    "decimalPlaces": 2,
                    "symbolPosition": "before",
                    "thousandsSeparator": ",",
                    "decimalSeparator": ".",
                    "exchangeRate": 1.0,
                    "publishedAt": "2025-10-30T17:41:47.696Z",
                    "seoMetadata": {
                        "metaTitle": "US Dollar",
                        "metaDescription": "United States Dollar currency",
                        "metaKeywords": ["USD", "dollar", "currency"],
                    },
                }
            ]
        }
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.get.return_value = mock_response

        with patch(
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
            result = await repo.get("/currencies", response_model=CurrenciesGetResponse)

            assert len(result.data) == 1
            assert result.data[0].code == "USD"
            mock_client.get.assert_called_once_with(
                "http://strapi:1337/api/currencies",
                params={},
                headers={"Authorization": "Bearer test-token"},
            )

    @pytest.mark.asyncio
    async def test_get_raises_strapi_api_error_on_http_error(self):
        """Test that get raises CMSAPIError on HTTP error."""
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
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")

            with pytest.raises(CMSAPIError) as exc_info:
                await repo.get("/nonexistent", response_model=CurrenciesGetResponse)

            assert exc_info.value.status_code == 404
            assert "GET /nonexistent failed" in exc_info.value.message
            assert isinstance(exc_info.value.details, CMSErrorDetails)
            assert exc_info.value.details.message == "Not found"

    @pytest.mark.asyncio
    async def test_get_raises_strapi_api_error_on_connection_error(self):
        """Test that get raises CMSAPIError on connection error."""
        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.get.side_effect = httpx.RequestError("Connection failed")

        with patch(
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")

            with pytest.raises(CMSAPIError) as exc_info:
                await repo.get("/currencies", response_model=CurrenciesGetResponse)

            assert exc_info.value.status_code == 502
            assert "Failed to connect to Strapi" in exc_info.value.message


@pytest.mark.unit
class TestPost:
    """Tests for post method."""

    @pytest.mark.asyncio
    async def test_post_successful_request(self):
        """Test that post returns data on successful request."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "data": [
                {
                    "documentId": "550e8400-e29b-41d4-a716-446655440000",
                    "id": 1,
                    "code": "USD",
                    "name": "US Dollar",
                    "symbol": "$",
                    "decimalPlaces": 2,
                    "symbolPosition": "before",
                    "thousandsSeparator": ",",
                    "decimalSeparator": ".",
                    "exchangeRate": 1.0,
                    "publishedAt": "2025-10-30T17:41:47.696Z",
                    "seoMetadata": {
                        "metaTitle": "US Dollar",
                        "metaDescription": "United States Dollar currency",
                        "metaKeywords": ["USD", "dollar", "currency"],
                    },
                }
            ]
        }
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.post.return_value = mock_response

        with patch(
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
            data = LanguagesDetectPostRequest(accept_language="en-US,en;q=0.9")
            result = await repo.post("/languages/detect", data, response_model=CurrenciesGetResponse)

            assert len(result.data) == 1
            assert result.data[0].code == "USD"
            mock_client.post.assert_called_once_with(
                "http://strapi:1337/api/languages/detect",
                json={"accept_language": "en-US,en;q=0.9"},
                params={},
                headers={"Authorization": "Bearer test-token"},
            )

    @pytest.mark.asyncio
    async def test_post_raises_strapi_api_error_on_http_error(self):
        """Test that post raises CMSAPIError on HTTP error."""
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
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")
            data = LanguagesDetectPostRequest(accept_language="invalid")

            with pytest.raises(CMSAPIError) as exc_info:
                await repo.post("/languages/detect", data, response_model=CurrenciesGetResponse)

            assert exc_info.value.status_code == 400
            assert "POST /languages/detect failed" in exc_info.value.message
            assert isinstance(exc_info.value.details, CMSErrorDetails)
            assert exc_info.value.details.message == "Validation failed"

    @pytest.mark.asyncio
    async def test_post_raises_strapi_api_error_on_connection_error(self):
        """Test that post raises CMSAPIError on connection error."""
        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.post.side_effect = httpx.RequestError("Connection timeout")

        with patch(
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")
            data = LanguagesDetectPostRequest(accept_language="en-US")

            with pytest.raises(CMSAPIError) as exc_info:
                await repo.post("/languages/detect", data, response_model=CurrenciesGetResponse)

            assert exc_info.value.status_code == 502
            assert "Failed to connect to Strapi" in exc_info.value.message


@pytest.mark.unit
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


@pytest.mark.unit
class TestGetEdgeCases:
    """Tests for edge cases in get method."""

    @pytest.mark.asyncio
    async def test_get_with_basemodel_params(self):
        """Test that get handles BaseModel params correctly."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": []}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.get.return_value = mock_response

        with patch(
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
            params = AboutGetParametersQuery(locale="en", customPopulate="nested")
            _result = await repo.get("/about", params=params, response_model=CurrenciesGetResponse)

            mock_client.get.assert_called_once_with(
                "http://strapi:1337/api/about",
                params={"locale": "en", "customPopulate": "nested"},
                headers={"Authorization": "Bearer test-token"},
            )

    @pytest.mark.asyncio
    async def test_get_with_none_response_model_raises_value_error(self):
        """Test that get raises ValueError when response_model is None."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": []}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.get.return_value = mock_response

        with patch(
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")

            with pytest.raises(ValueError) as exc_info:
                await repo.get("/currencies", response_model=None)

            assert "response_model is required for type-safe operations" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_get_with_root_model_response(self):
        """Test that get handles RootModel response correctly."""
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {
                "id": 1,
                "documentId": "550e8400-e29b-41d4-a716-446655440000",
                "name": "English",
                "code": "en",
                "createdAt": "2025-10-30T17:41:47.696Z",
                "updatedAt": "2025-10-30T18:23:15.432Z",
                "publishedAt": "2025-10-30T17:41:47.696Z",
                "isDefault": True,
            }
        ]
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.get.return_value = mock_response

        with patch(
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
            result = await repo.get("/i18n/locales", response_model=LocalesResponse)

            assert isinstance(result, LocalesResponse)
            assert len(result.root) == 1
            assert result.root[0].code == "en"


@pytest.mark.unit
class TestPostEdgeCases:
    """Tests for edge cases in post method."""

    @pytest.mark.asyncio
    async def test_post_with_basemodel_data(self):
        """Test that post handles BaseModel data correctly."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": []}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.post.return_value = mock_response

        with patch(
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
            data = LanguagesDetectPostRequest(accept_language="en-US,en;q=0.9")
            _result = await repo.post("/languages/detect", data=data, response_model=CurrenciesGetResponse)

            mock_client.post.assert_called_once()

    @pytest.mark.asyncio
    async def test_post_with_basemodel_params(self):
        """Test that post handles BaseModel params correctly."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": []}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.post.return_value = mock_response

        with patch(
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
            params = AboutGetParametersQuery(locale="en", customPopulate="nested")
            data = LanguagesDetectPostRequest(accept_language="en-US")
            _result = await repo.post(
                "/languages/detect", data=data, params=params, response_model=CurrenciesGetResponse
            )

            mock_client.post.assert_called_once_with(
                "http://strapi:1337/api/languages/detect",
                json={"accept_language": "en-US"},
                params={"locale": "en", "custom_populate": "nested"},
                headers={"Authorization": "Bearer test-token"},
            )

    @pytest.mark.asyncio
    async def test_post_with_none_response_model_raises_value_error(self):
        """Test that post raises ValueError when response_model is None."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": []}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.post.return_value = mock_response

        with patch(
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
            data = LanguagesDetectPostRequest(accept_language="en-US")

            with pytest.raises(ValueError) as exc_info:
                await repo.post("/languages/detect", data=data, response_model=None)

            assert "response_model is required for type-safe operations" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_post_with_root_model_response(self):
        """Test that post handles RootModel response correctly."""
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {
                "id": 1,
                "documentId": "550e8400-e29b-41d4-a716-446655440000",
                "name": "English",
                "code": "en",
                "createdAt": "2025-10-30T17:41:47.696Z",
                "updatedAt": "2025-10-30T18:23:15.432Z",
                "publishedAt": "2025-10-30T17:41:47.696Z",
                "isDefault": True,
            }
        ]
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.post.return_value = mock_response

        with patch(
            "affilibuster_backend.infrastructure.cms.strapi_repository_impl.httpx.AsyncClient",
            return_value=mock_client,
        ):
            repo = StrapiRepositoryImpl(base_url="http://strapi:1337", api_token="test-token")
            data = LanguagesDetectPostRequest(accept_language="en-US")
            result = await repo.post("/languages/detect", data=data, response_model=LocalesResponse)

            assert isinstance(result, LocalesResponse)
            assert len(result.root) == 1
            assert result.root[0].code == "en"


@pytest.mark.unit
class TestFlattenParams:
    """Tests for _flatten_params method."""

    def test_flatten_params_with_simple_dict(self):
        """Test that _flatten_params handles simple flat dict."""
        repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")
        params = {"locale": "en", "page_size": 10}
        result = repo._flatten_params(params)

        assert result == {"locale": "en", "pageSize": 10}

    def test_flatten_params_with_nested_dict(self):
        """Test that _flatten_params handles nested dicts with bracket notation."""
        repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")
        params = {"pagination": {"page": 1, "page_size": 25}}
        result = repo._flatten_params(params)

        assert result == {"pagination[page]": 1, "pagination[pageSize]": 25}

    def test_flatten_params_with_deeply_nested_dict(self):
        """Test that _flatten_params handles deeply nested dicts."""
        repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")
        params = {"filters": {"name": {"contains": "test"}}}
        result = repo._flatten_params(params)

        assert result == {"filters[name][contains]": "test"}

    def test_flatten_params_with_list_of_dicts(self):
        """Test that _flatten_params handles list of dicts with indexed notation."""
        repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")
        params = {"populate": [{"fields": ["id", "name"]}, {"fields": ["title"]}]}
        result = repo._flatten_params(params)

        assert result == {
            "populate[0][fields]": ["id", "name"],
            "populate[1][fields]": ["title"],
        }

    def test_flatten_params_with_none_values(self):
        """Test that _flatten_params excludes None values."""
        repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")
        params = {"locale": "en", "page_size": None}
        result = repo._flatten_params(params)

        assert result == {"locale": "en"}
        assert "pageSize" not in result

    def test_flatten_params_with_mixed_structure(self):
        """Test that _flatten_params handles mixed nested structures."""
        repo = StrapiRepositoryImpl(api_token="test-token", base_url="http://strapi:1337")
        params = {
            "locale": "en",
            "pagination": {"page": 1, "page_size": 10},
            "filters": {"category": {"id": 5}},
        }
        result = repo._flatten_params(params)

        assert result == {
            "locale": "en",
            "pagination[page]": 1,
            "pagination[pageSize]": 10,
            "filters[category][id]": 5,
        }
