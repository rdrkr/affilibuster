# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Unit tests for OpenAPI contract loader."""

from pathlib import Path

import pytest
import yaml

from infrastructure.api.openapi_loader import OpenAPIContractLoader


class TestOpenAPIContractLoaderInitialization:
    """Tests for OpenAPIContractLoader initialization."""

    def test_initialization_with_default_path(self):
        """Test that loader initializes with default contract path."""
        loader = OpenAPIContractLoader()
        assert loader.contract_path == Path("/contracts/affilibuster.openapi.yaml")
        assert loader._cached_spec is None

    def test_initialization_with_custom_path_as_string(self):
        """Test that loader accepts custom path as string."""
        custom_path = "/custom/path/contract.yaml"
        loader = OpenAPIContractLoader(custom_path)
        assert loader.contract_path == Path(custom_path)

    def test_initialization_with_custom_path_as_path_object(self):
        """Test that loader accepts custom path as Path object."""
        custom_path = Path("/custom/path/contract.yaml")
        loader = OpenAPIContractLoader(custom_path)
        assert loader.contract_path == custom_path


class TestLoadContract:
    """Tests for load_contract method."""

    def test_load_contract_successfully(self, tmp_path):
        """Test successful loading of a valid OpenAPI contract."""
        # Create a valid OpenAPI contract
        contract_data = {
            "openapi": "3.1.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {
                "/test": {
                    "get": {
                        "summary": "Test endpoint",
                        "responses": {"200": {"description": "Success"}},
                    },
                },
            },
            "components": {"schemas": {"TestModel": {"type": "object"}}},
        }

        contract_file = tmp_path / "contract.yaml"
        with open(contract_file, "w") as f:
            yaml.dump(contract_data, f)

        loader = OpenAPIContractLoader(contract_file)
        spec = loader.load_contract()

        assert spec == contract_data
        assert spec["openapi"] == "3.1.0"
        assert spec["info"]["title"] == "Test API"
        assert "/test" in spec["paths"]

    def test_load_contract_caches_result(self, tmp_path):
        """Test that contract is cached after first load."""
        contract_data = {
            "openapi": "3.1.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {},
        }

        contract_file = tmp_path / "contract.yaml"
        with open(contract_file, "w") as f:
            yaml.dump(contract_data, f)

        loader = OpenAPIContractLoader(contract_file)

        # First load
        spec1 = loader.load_contract()
        assert loader._cached_spec is not None

        # Second load should return cached version
        spec2 = loader.load_contract()
        assert spec1 is spec2  # Same object reference
        assert loader._cached_spec is spec1

    def test_load_contract_file_not_found(self):
        """Test that FileNotFoundError is raised when contract file doesn't exist."""
        non_existent_path = "/this/path/does/not/exist/contract.yaml"
        loader = OpenAPIContractLoader(non_existent_path)

        with pytest.raises(FileNotFoundError) as exc_info:
            loader.load_contract()

        assert "OpenAPI contract not found" in str(exc_info.value)
        assert non_existent_path in str(exc_info.value)

    def test_load_contract_invalid_yaml(self, tmp_path):
        """Test that yaml.YAMLError is raised for invalid YAML."""
        contract_file = tmp_path / "invalid.yaml"
        with open(contract_file, "w") as f:
            f.write("invalid: yaml: content:\n  - unclosed: [bracket")

        loader = OpenAPIContractLoader(contract_file)

        with pytest.raises(yaml.YAMLError) as exc_info:
            loader.load_contract()

        assert "Failed to parse OpenAPI contract" in str(exc_info.value)

    def test_load_contract_not_a_dictionary(self, tmp_path):
        """Test that ValueError is raised when contract is not a dict."""
        contract_file = tmp_path / "not_dict.yaml"
        with open(contract_file, "w") as f:
            yaml.dump(["this", "is", "a", "list"], f)

        loader = OpenAPIContractLoader(contract_file)

        with pytest.raises(ValueError) as exc_info:
            loader.load_contract()

        assert "must be a dictionary" in str(exc_info.value)

    def test_load_contract_missing_openapi_field(self, tmp_path):
        """Test that ValueError is raised when 'openapi' field is missing."""
        contract_data = {
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {},
        }

        contract_file = tmp_path / "missing_openapi.yaml"
        with open(contract_file, "w") as f:
            yaml.dump(contract_data, f)

        loader = OpenAPIContractLoader(contract_file)

        with pytest.raises(ValueError) as exc_info:
            loader.load_contract()

        assert "missing 'openapi' version field" in str(exc_info.value)

    def test_load_contract_missing_paths_section(self, tmp_path):
        """Test that ValueError is raised when 'paths' section is missing."""
        contract_data = {
            "openapi": "3.1.0",
            "info": {"title": "Test API", "version": "1.0.0"},
        }

        contract_file = tmp_path / "missing_paths.yaml"
        with open(contract_file, "w") as f:
            yaml.dump(contract_data, f)

        loader = OpenAPIContractLoader(contract_file)

        with pytest.raises(ValueError) as exc_info:
            loader.load_contract()

        assert "missing 'paths' section" in str(exc_info.value)

    def test_load_contract_logs_info(self, tmp_path, caplog):
        """Test that loading logs appropriate info messages."""
        import logging

        caplog.set_level(logging.INFO)

        contract_data = {
            "openapi": "3.1.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {"/test": {}},
            "components": {"schemas": {"Model1": {}, "Model2": {}}},
        }

        contract_file = tmp_path / "contract.yaml"
        with open(contract_file, "w") as f:
            yaml.dump(contract_data, f)

        loader = OpenAPIContractLoader(contract_file)
        loader.load_contract()

        # Check that info messages were logged
        assert "Loading OpenAPI contract from" in caplog.text
        assert "Loaded OpenAPI contract: Test API v1.0.0" in caplog.text
        assert "Paths: 1" in caplog.text
        assert "Schemas: 2" in caplog.text


class TestGetSpec:
    """Tests for get_spec method."""

    def test_get_spec_returns_spec_when_valid(self, tmp_path):
        """Test that get_spec returns the loaded spec for valid contract."""
        contract_data = {
            "openapi": "3.1.0",
            "info": {"title": "Test API", "version": "1.0.0"},
            "paths": {},
        }

        contract_file = tmp_path / "contract.yaml"
        with open(contract_file, "w") as f:
            yaml.dump(contract_data, f)

        loader = OpenAPIContractLoader(contract_file)
        spec = loader.get_spec()

        assert spec is not None
        assert spec == contract_data

    def test_get_spec_returns_none_when_file_not_found(self):
        """Test that get_spec returns None instead of raising FileNotFoundError."""
        non_existent_path = "/this/path/does/not/exist/contract.yaml"
        loader = OpenAPIContractLoader(non_existent_path)

        spec = loader.get_spec()

        assert spec is None

    def test_get_spec_returns_none_for_invalid_yaml(self, tmp_path):
        """Test that get_spec returns None for invalid YAML instead of raising."""
        contract_file = tmp_path / "invalid.yaml"
        with open(contract_file, "w") as f:
            f.write("invalid: yaml: content:\n  - unclosed: [bracket")

        loader = OpenAPIContractLoader(contract_file)

        spec = loader.get_spec()

        assert spec is None

    def test_get_spec_returns_none_for_invalid_contract(self, tmp_path):
        """Test that get_spec returns None for invalid contract structure."""
        contract_data = {
            "info": {"title": "Test API"},
            # Missing 'openapi' and 'paths' fields
        }

        contract_file = tmp_path / "invalid_contract.yaml"
        with open(contract_file, "w") as f:
            yaml.dump(contract_data, f)

        loader = OpenAPIContractLoader(contract_file)

        spec = loader.get_spec()

        assert spec is None

    def test_get_spec_logs_warning_on_error(self, tmp_path, caplog):
        """Test that get_spec logs a warning when loading fails."""
        import logging

        caplog.set_level(logging.WARNING)

        non_existent_path = "/this/path/does/not/exist/contract.yaml"
        loader = OpenAPIContractLoader(non_existent_path)

        loader.get_spec()

        assert "Could not load OpenAPI contract" in caplog.text


class TestGlobalInstance:
    """Tests for the global openapi_contract_loader instance."""

    def test_global_instance_exists(self):
        """Test that the global instance is created."""
        from infrastructure.api.openapi_loader import openapi_contract_loader

        assert isinstance(openapi_contract_loader, OpenAPIContractLoader)
        assert openapi_contract_loader.contract_path == Path("/contracts/affilibuster.openapi.yaml")
