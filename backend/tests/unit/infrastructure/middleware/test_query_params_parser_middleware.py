# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""
Unit tests for QueryParamsParserMiddleware.

Tests bracket notation query parameter parsing and nested dict conversion.
"""

from typing import Any

import pytest
from fastapi import FastAPI, Request
from starlette.testclient import TestClient

from affilibuster_backend.infrastructure.middleware.query_params_parser import (
    QueryParamsParserMiddleware,
    flatten_nested_to_query_params,
    parse_bracket_notation,
    parse_query_string_with_brackets,
)


@pytest.mark.unit
class TestParseBracketNotation:
    """Test parse_bracket_notation function."""

    def test_simple_key_value(self):
        """Test parsing a simple key-value pair without brackets."""
        target: dict[str, Any] = {}
        parse_bracket_notation("locale", "en", target)
        assert target == {"locale": "en"}

    def test_single_bracket(self):
        """Test parsing single bracket notation."""
        target: dict[str, Any] = {}
        parse_bracket_notation("filters[name]", "test", target)
        assert target == {"filters": {"name": "test"}}

    def test_nested_brackets(self):
        """Test parsing deeply nested bracket notation."""
        target: dict[str, Any] = {}
        parse_bracket_notation("filters[roles][roleId][$containsi]", "author", target)
        assert target == {"filters": {"roles": {"roleId": {"$containsi": "author"}}}}

    def test_multiple_values_same_parent(self):
        """Test parsing multiple values under the same parent key."""
        target: dict[str, Any] = {}
        parse_bracket_notation("filters[name]", "test", target)
        parse_bracket_notation("filters[status]", "active", target)
        assert target == {"filters": {"name": "test", "status": "active"}}

    def test_multiple_nested_paths(self):
        """Test parsing multiple nested paths."""
        target: dict[str, Any] = {}
        parse_bracket_notation("filters[roles][roleId][$containsi]", "author", target)
        parse_bracket_notation("filters[roles][name][$eq]", "admin", target)
        assert target == {
            "filters": {
                "roles": {
                    "roleId": {"$containsi": "author"},
                    "name": {"$eq": "admin"},
                }
            }
        }

    def test_strapi_filter_operators(self):
        """Test parsing Strapi filter operators."""
        target: dict[str, Any] = {}
        parse_bracket_notation("filters[$or][0][title][$containsi]", "test", target)
        assert target == {"filters": {"$or": {"0": {"title": {"$containsi": "test"}}}}}

    def test_empty_bracket_segment(self):
        """Test parsing empty bracket segment (array-style param) is kept as-is."""
        target: dict[str, Any] = {}
        parse_bracket_notation("items[]", "value", target)
        # Array-style params like items[] are kept as-is (not converted to nested dict)
        assert target == {"items[]": "value"}

    def test_overwrite_non_dict_value(self):
        """Test overwriting a non-dict value with nested structure."""
        target: dict[str, Any] = {"filters": "old_value"}
        parse_bracket_notation("filters[name]", "new", target)
        assert target == {"filters": {"name": "new"}}


@pytest.mark.unit
class TestParseQueryStringWithBrackets:
    """Test parse_query_string_with_brackets function."""

    def test_empty_query_string(self):
        """Test parsing empty query string."""
        result = parse_query_string_with_brackets("")
        assert result == {}

    def test_simple_params(self):
        """Test parsing simple query params without brackets."""
        result = parse_query_string_with_brackets("locale=en&customPopulate=nested")
        assert result == {"locale": "en", "customPopulate": "nested"}

    def test_bracket_notation_filter(self):
        """Test parsing bracket notation filter."""
        result = parse_query_string_with_brackets("filters[roles][roleId][$containsi]=author&locale=en")
        assert result == {
            "filters": {"roles": {"roleId": {"$containsi": "author"}}},
            "locale": "en",
        }

    def test_multiple_bracket_params(self):
        """Test parsing multiple bracket notation params."""
        result = parse_query_string_with_brackets("filters[name][$eq]=test&filters[status][$eq]=active")
        assert result == {
            "filters": {
                "name": {"$eq": "test"},
                "status": {"$eq": "active"},
            }
        }

    def test_url_encoded_values(self):
        """Test parsing URL-encoded values."""
        result = parse_query_string_with_brackets("filters[name]=hello%20world")
        assert result == {"filters": {"name": "hello world"}}

    def test_special_characters_in_keys(self):
        """Test parsing special characters like $ in keys."""
        result = parse_query_string_with_brackets("filters[$and][0][title][$containsi]=test")
        assert result == {"filters": {"$and": {"0": {"title": {"$containsi": "test"}}}}}

    def test_multiple_values_for_same_key(self):
        """Test parsing multiple values for the same simple key (array)."""
        result = parse_query_string_with_brackets("tags=a&tags=b&tags=c")
        assert result == {"tags": ["a", "b", "c"]}

    def test_mixed_simple_and_bracket_params(self):
        """Test parsing mixed simple and bracket params."""
        result = parse_query_string_with_brackets(
            "locale=en&filters[roles][roleId][$containsi]=author&customPopulate=nested"
        )
        assert result == {
            "locale": "en",
            "filters": {"roles": {"roleId": {"$containsi": "author"}}},
            "customPopulate": "nested",
        }

    def test_pagination_params(self):
        """Test parsing pagination bracket params."""
        result = parse_query_string_with_brackets("pagination[page]=1&pagination[pageSize]=10")
        assert result == {"pagination": {"page": "1", "pageSize": "10"}}


@pytest.mark.unit
class TestFlattenNestedToQueryParams:
    """Test flatten_nested_to_query_params function."""

    def test_simple_dict(self):
        """Test flattening a simple dict."""
        result = flatten_nested_to_query_params({"locale": "en"})
        assert result == {"locale": "en"}

    def test_nested_dict(self):
        """Test flattening a nested dict."""
        result = flatten_nested_to_query_params({"filters": {"roles": {"roleId": {"$containsi": "author"}}}})
        assert result == {"filters[roles][roleId][$containsi]": "author"}

    def test_mixed_nested_and_simple(self):
        """Test flattening mixed nested and simple values."""
        result = flatten_nested_to_query_params(
            {
                "locale": "en",
                "filters": {"name": "test"},
            }
        )
        assert result == {"locale": "en", "filters[name]": "test"}

    def test_none_values_excluded(self):
        """Test that None values are excluded."""
        result = flatten_nested_to_query_params({"locale": "en", "filters": None})
        assert result == {"locale": "en"}

    def test_empty_dict(self):
        """Test flattening empty dict."""
        result = flatten_nested_to_query_params({})
        assert result == {}


@pytest.fixture
def app_with_query_parser_middleware():
    """Create a FastAPI app with query params parser middleware."""
    app = FastAPI()

    @app.get("/test")
    async def test_route(request: Request):
        """Test route that returns parsed query params."""
        parsed = getattr(request.state, "parsed_query_params", {})
        return {"parsed_params": parsed}

    @app.get("/contributors")
    async def contributors_route(request: Request):
        """Simulates contributors endpoint."""
        parsed = getattr(request.state, "parsed_query_params", {})
        return {"parsed_params": parsed}

    # Add middleware
    app.add_middleware(QueryParamsParserMiddleware)

    return app


@pytest.mark.unit
class TestQueryParamsParserMiddleware:
    """Test QueryParamsParserMiddleware integration."""

    def test_middleware_parses_simple_params(self, app_with_query_parser_middleware):
        """Test middleware parses simple query params."""
        client = TestClient(app_with_query_parser_middleware)

        response = client.get("/test?locale=en&customPopulate=nested")

        assert response.status_code == 200
        data = response.json()
        assert data["parsed_params"]["locale"] == "en"
        assert data["parsed_params"]["customPopulate"] == "nested"

    def test_middleware_parses_bracket_notation(self, app_with_query_parser_middleware):
        """Test middleware parses bracket notation filters."""
        client = TestClient(app_with_query_parser_middleware)

        response = client.get(
            "/contributors",
            params={"filters[roles][roleId][$containsi]": "author", "locale": "en"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["parsed_params"]["locale"] == "en"
        assert data["parsed_params"]["filters"]["roles"]["roleId"]["$containsi"] == "author"

    def test_middleware_handles_nested_strapi_filters(self, app_with_query_parser_middleware):
        """Test middleware handles complex Strapi filter syntax."""
        client = TestClient(app_with_query_parser_middleware)

        response = client.get(
            "/test",
            params={
                "filters[$or][0][name][$containsi]": "test",
                "filters[$or][1][status][$eq]": "active",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "filters" in data["parsed_params"]
        filters = data["parsed_params"]["filters"]
        assert "$or" in filters
        assert filters["$or"]["0"]["name"]["$containsi"] == "test"
        assert filters["$or"]["1"]["status"]["$eq"] == "active"

    def test_middleware_handles_no_query_string(self, app_with_query_parser_middleware):
        """Test middleware handles requests without query string."""
        client = TestClient(app_with_query_parser_middleware)

        response = client.get("/test")

        assert response.status_code == 200
        data = response.json()
        assert data["parsed_params"] == {}

    def test_middleware_handles_pagination_params(self, app_with_query_parser_middleware):
        """Test middleware parses pagination bracket params."""
        client = TestClient(app_with_query_parser_middleware)

        response = client.get(
            "/test",
            params={"pagination[page]": "1", "pagination[pageSize]": "10"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["parsed_params"]["pagination"]["page"] == "1"
        assert data["parsed_params"]["pagination"]["pageSize"] == "10"

    def test_middleware_preserves_simple_params_in_request(self, app_with_query_parser_middleware):
        """Test middleware keeps simple params accessible."""
        client = TestClient(app_with_query_parser_middleware)

        response = client.get("/test?locale=en")

        assert response.status_code == 200
        data = response.json()
        assert data["parsed_params"]["locale"] == "en"


@pytest.mark.unit
class TestQueryParamsParserMiddlewareEdgeCases:
    """Test edge cases for QueryParamsParserMiddleware."""

    def test_empty_bracket_value(self, app_with_query_parser_middleware):
        """Test middleware handles empty bracket values."""
        client = TestClient(app_with_query_parser_middleware)

        response = client.get("/test?filters[name]=")

        assert response.status_code == 200
        data = response.json()
        assert data["parsed_params"]["filters"]["name"] == ""

    def test_special_characters_in_values(self, app_with_query_parser_middleware):
        """Test middleware handles special characters in values."""
        client = TestClient(app_with_query_parser_middleware)

        response = client.get("/test?filters[name]=hello%20world")

        assert response.status_code == 200
        data = response.json()
        assert data["parsed_params"]["filters"]["name"] == "hello world"

    def test_deeply_nested_filters(self, app_with_query_parser_middleware):
        """Test middleware handles deeply nested filter structures."""
        client = TestClient(app_with_query_parser_middleware)

        response = client.get(
            "/test",
            params={"filters[a][b][c][d][e]": "deep"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["parsed_params"]["filters"]["a"]["b"]["c"]["d"]["e"] == "deep"

    def test_multiple_filters_same_level(self, app_with_query_parser_middleware):
        """Test middleware handles multiple filters at the same nesting level."""
        client = TestClient(app_with_query_parser_middleware)

        response = client.get(
            "/test",
            params={
                "filters[name][$eq]": "test",
                "filters[status][$eq]": "active",
                "filters[type][$eq]": "user",
            },
        )

        assert response.status_code == 200
        data = response.json()
        filters = data["parsed_params"]["filters"]
        assert filters["name"]["$eq"] == "test"
        assert filters["status"]["$eq"] == "active"
        assert filters["type"]["$eq"] == "user"
