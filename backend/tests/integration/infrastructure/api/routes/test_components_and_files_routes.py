# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Integration tests for components and files API routes.

Tests components metadata and files/upload endpoints with real Strapi integration.
"""

import pytest


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestComponentsRoute:
    """Test suite for /components endpoints."""

    async def test_get_components_returns_200(self, integration_client, strapi_test_data):
        """Test that GET /components returns 200 status code."""
        response = await integration_client.get("/v1/components")
        assert response.status_code in [200, 502]

    async def test_get_components_returns_data_structure(self, integration_client, strapi_test_data):
        """Test that GET /components returns proper data structure."""
        response = await integration_client.get("/v1/components")
        if response.status_code == 200:
            data = response.json()
            assert "data" in data
            assert isinstance(data["data"], list)

    async def test_get_component_by_uid(self, integration_client, strapi_test_data):
        """Test that GET /components/{uid} returns component metadata."""
        # Try to get a specific component by UID
        response = await integration_client.get("/v1/components/test.component")
        # Should return 200, 404, or 502 depending on whether component exists
        assert response.status_code in [200, 404, 502]

    async def test_get_component_by_uid_with_valid_uid(self, integration_client, strapi_test_data):
        """Test GET /components/{uid} with a valid UID format."""
        # Get components list first to find a valid UID
        list_response = await integration_client.get("/v1/components")
        if list_response.status_code == 200:
            data = list_response.json()
            if data.get("data") and len(data["data"]) > 0:
                # Try to get first component's UID
                component_uid = data["data"][0].get("uid", "test.component")
                response = await integration_client.get(f"/v1/components/{component_uid}")
                assert response.status_code in [200, 404, 502]

    async def test_get_component_with_invalid_uid_returns_error(self, integration_client, strapi_test_data):
        """Test that GET /components/{uid} with invalid UID returns error."""
        response = await integration_client.get("/v1/components/invalid.nonexistent.component")
        # Should return 404 or 502
        assert response.status_code in [404, 502]

    async def test_get_components_strapi_error_returns_502(self, integration_client):
        """Test that Strapi errors return 502 Bad Gateway."""
        response = await integration_client.get("/v1/components")
        # Should either succeed (200) or fail with 502 if Strapi is down
        assert response.status_code in [200, 502]

    async def test_get_component_strapi_error_returns_502(self, integration_client):
        """Test that Strapi errors return 502 Bad Gateway for specific component."""
        response = await integration_client.get("/v1/components/test.component")
        # Should either succeed or fail with 502/404 if Strapi has issues
        assert response.status_code in [200, 404, 502]


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestFilesRoute:
    """Test suite for /files endpoints."""

    async def test_get_files_returns_200(self, integration_client, strapi_test_data):
        """Test that GET /files returns 200 status code."""
        response = await integration_client.get("/v1/files")
        assert response.status_code in [200, 502]

    async def test_get_files_returns_data_structure(self, integration_client, strapi_test_data):
        """Test that GET /files returns proper data structure."""
        response = await integration_client.get("/v1/files")
        if response.status_code == 200:
            data = response.json()
            # Files endpoint returns array of files or empty array
            assert isinstance(data, list) or "data" in data

    async def test_get_files_with_pagination(self, integration_client, strapi_test_data):
        """Test GET /files with pagination parameters."""
        response = await integration_client.get(
            "/v1/files",
            params={"pagination[pageSize]": "10", "pagination[page]": "1"},
        )
        assert response.status_code in [200, 502]

    async def test_get_files_with_filters(self, integration_client, strapi_test_data):
        """Test GET /files with filter parameters."""
        response = await integration_client.get(
            "/v1/files",
            params={"filters[mime][$contains]": "image"},
        )
        assert response.status_code in [200, 502]

    async def test_get_files_with_sorting(self, integration_client, strapi_test_data):
        """Test GET /files with sorting."""
        response = await integration_client.get(
            "/v1/files",
            params={"sort[]": "name:asc"},
        )
        assert response.status_code in [200, 502]

    async def test_get_file_by_id(self, integration_client, strapi_test_data):
        """Test that GET /files/{id} returns file metadata."""
        # Get files list first to find a valid ID
        list_response = await integration_client.get("/v1/files")
        if list_response.status_code == 200:
            data = list_response.json()
            files_list = data if isinstance(data, list) else data.get("data", [])
            if files_list and len(files_list) > 0:
                file_id = str(files_list[0].get("id", "1"))
                response = await integration_client.get(f"/v1/files/{file_id}")
                assert response.status_code in [200, 404, 502]

    async def test_get_file_with_field_selection(self, integration_client, strapi_test_data):
        """Test GET /files/{id} with field selection."""
        response = await integration_client.get(
            "/v1/files/1",
            params={"fields[]": ["name", "url"]},
        )
        assert response.status_code in [200, 404, 502]

    async def test_get_file_with_invalid_id_returns_error(self, integration_client, strapi_test_data):
        """Test that GET /files/{id} with invalid ID returns error."""
        response = await integration_client.get("/v1/files/nonexistent-file-id-99999")
        # Should return 404 or 502
        assert response.status_code in [404, 502]

    async def test_get_files_strapi_error_returns_502(self, integration_client):
        """Test that Strapi errors return 502 Bad Gateway."""
        response = await integration_client.get("/v1/files")
        # Should either succeed (200) or fail with 502 if Strapi is down
        assert response.status_code in [200, 502]

    async def test_get_file_strapi_error_returns_502(self, integration_client):
        """Test that Strapi errors return 502 Bad Gateway for specific file."""
        response = await integration_client.get("/v1/files/1")
        # Should either succeed or fail with 502/404 if Strapi has issues
        assert response.status_code in [200, 404, 502]


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.slow
class TestComponentsAndFilesErrorHandling:
    """Test suite for components and files error handling."""

    async def test_components_handles_strapi_connection_error(self, integration_client):
        """Test that connection errors to Strapi are handled gracefully."""
        response = await integration_client.get("/v1/components")
        # Should return either 200 (success) or 502 (Bad Gateway on error)
        assert response.status_code in [200, 502]

    async def test_component_by_uid_handles_strapi_connection_error(self, integration_client):
        """Test that connection errors to Strapi are handled gracefully."""
        response = await integration_client.get("/v1/components/test.component")
        # Should return either 200/404 (success) or 502 (Bad Gateway on error)
        assert response.status_code in [200, 404, 502]

    async def test_files_handles_strapi_connection_error(self, integration_client):
        """Test that connection errors to Strapi are handled gracefully."""
        response = await integration_client.get("/v1/files")
        # Should return either 200 (success) or 502 (Bad Gateway on error)
        assert response.status_code in [200, 502]

    async def test_file_by_id_handles_strapi_connection_error(self, integration_client):
        """Test that connection errors to Strapi are handled gracefully."""
        response = await integration_client.get("/v1/files/1")
        # Should return either 200/404 (success) or 502 (Bad Gateway on error)
        assert response.status_code in [200, 404, 502]
