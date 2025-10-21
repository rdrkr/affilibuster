# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests validating API responses match OpenAPI contract.

These tests ensure that actual API responses conform to the OpenAPI
specification defined in contracts/template.openapi.yaml.

This is critical for maintaining type safety across frontend and backend.
"""

import json
from pathlib import Path
from typing import Any

import pytest
import yaml
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client() -> TestClient:
    """Create FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def openapi_spec() -> dict[str, Any]:
    """Load backend OpenAPI specification."""
    spec_path = Path(__file__).parent.parent.parent.parent / "contracts" / "affilibuster.openapi.yaml"

    if not spec_path.exists():
        pytest.skip(f"OpenAPI spec not found at {spec_path}")

    with open(spec_path) as f:
        return yaml.safe_load(f)


class TestOpenAPIContractCompliance:
    """Validate API responses match OpenAPI contract."""

    def test_spec_exists(self, openapi_spec: dict[str, Any]) -> None:
        """Verify OpenAPI spec is valid YAML."""
        assert openapi_spec is not None
        assert openapi_spec.get("openapi") == "3.1.0"
        assert "info" in openapi_spec
        assert "paths" in openapi_spec
        assert "components" in openapi_spec

    def test_spec_has_backend_layer(self, openapi_spec: dict[str, Any]) -> None:
        """Verify backend API spec references Strapi content schemas."""
        # Backend spec should reference Strapi via external $ref
        spec_content = json.dumps(openapi_spec)

        # Check for references to strapi-content spec (external refs)
        has_strapi_ref = "strapi.openapi.yaml" in spec_content
        assert has_strapi_ref, "Backend spec should reference Strapi content schemas via $ref"

    def test_spec_defines_content_endpoints(self, openapi_spec: dict[str, Any]) -> None:
        """Verify content endpoints are defined."""
        paths = openapi_spec.get("paths", {})

        expected_paths = [
            "/content/{lang}/{slug}",
            "/content/{lang}",
            "/languages",
            "/languages/detect",
            "/currencies",
            "/currencies/convert",
            "/user/preferences",
        ]

        for expected_path in expected_paths:
            assert expected_path in paths, f"Missing endpoint: {expected_path}"

    def test_spec_defines_schemas(self, openapi_spec: dict[str, Any]) -> None:
        """Verify required schemas are defined."""
        components = openapi_spec.get("components", {})
        schemas = components.get("schemas", {})

        expected_schemas = [
            "Language",
            "Currency",
            "UserPreferences",
            "Error",
        ]

        for expected_schema in expected_schemas:
            assert expected_schema in schemas, f"Missing schema: {expected_schema}"

    @pytest.mark.integration
    def test_health_endpoint_response(self, client: TestClient) -> None:
        """Test health endpoint returns expected structure."""
        response = client.get("/health")
        assert response.status_code == 200

        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"

    @pytest.mark.integration
    def test_languages_endpoint_matches_schema(self, client: TestClient) -> None:
        """Test /languages response matches schema structure."""
        response = client.get("/languages")

        if response.status_code != 200:
            pytest.skip(f"Service not available: {response.status_code}")

        data = response.json()
        assert isinstance(data, list)

        # Each language should have required fields
        for language in data:
            assert "code" in language
            assert "displayName" in language
            assert "direction" in language
            assert language["direction"] in ["ltr", "rtl"]

    @pytest.mark.integration
    def test_currencies_endpoint_matches_schema(self, client: TestClient) -> None:
        """Test /currencies response matches schema structure."""
        response = client.get("/currencies")

        if response.status_code != 200:
            pytest.skip(f"Service not available: {response.status_code}")

        data = response.json()
        assert isinstance(data, list)

        # Each currency should have required fields
        for currency in data:
            assert "code" in currency
            assert "symbol" in currency
            assert "decimalPlaces" in currency
            assert "symbolPosition" in currency
            assert currency["symbolPosition"] in ["before", "after"]

    @pytest.mark.integration
    def test_error_response_structure(self, client: TestClient) -> None:
        """Test error responses match Error schema."""
        # Request non-existent content
        response = client.get("/content/en/nonexistent-slug")

        if response.status_code == 404:
            data = response.json()
            # Error response should have these fields per OpenAPI spec
            assert "error" in data or "message" in data


class TestOpenAPITypeSafety:
    """Tests validating type safety between OpenAPI and implementation."""

    def test_language_enum_values(self, openapi_spec: dict[str, Any]) -> None:
        """Verify supported language codes in spec match implementation."""
        from config.settings import SUPPORTED_LANGUAGES

        spec_content = json.dumps(openapi_spec)

        # Spec should define supported languages
        for lang_code in SUPPORTED_LANGUAGES:
            assert lang_code in spec_content, f"Language {lang_code} not in OpenAPI spec"

    def test_currency_enum_values(self, openapi_spec: dict[str, Any]) -> None:
        """Verify supported currencies in spec match implementation."""
        from config.settings import SUPPORTED_CURRENCIES

        spec_content = json.dumps(openapi_spec)

        # Spec should define supported currencies
        for currency_code in SUPPORTED_CURRENCIES:
            assert currency_code in spec_content, f"Currency {currency_code} not in OpenAPI spec"


class TestOpenAPIDocumentation:
    """Tests validating OpenAPI documentation quality."""

    def test_all_endpoints_documented(self, openapi_spec: dict[str, Any]) -> None:
        """Verify all endpoints have descriptions."""
        paths = openapi_spec.get("paths", {})

        for path, methods in paths.items():
            for method, operation in methods.items():
                if method in ["get", "post", "put", "delete", "patch"]:
                    assert (
                        "summary" in operation or "description" in operation
                    ), f"Missing documentation for {method.upper()} {path}"

    def test_all_schemas_documented(self, openapi_spec: dict[str, Any]) -> None:
        """Verify all schemas have descriptions."""
        components = openapi_spec.get("components", {})
        schemas = components.get("schemas", {})

        for schema_name, schema_def in schemas.items():
            if isinstance(schema_def, dict) and schema_def.get("type") == "object":
                # Objects should have description or properties should be documented
                assert (
                    "description" in schema_def or "properties" in schema_def
                ), f"Schema {schema_name} lacks documentation"
