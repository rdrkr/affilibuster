# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
OpenAPI Contract Loader.

This module loads the affilibuster.openapi.yaml contract file and provides it
to FastAPI to ensure /docs and /redoc display the exact contract specification
rather than FastAPI's auto-generated schema.

Architecture:
- Design-first: OpenAPI contract is the single source of truth
- Pydantic models are generated from the contract for validation
- FastAPI serves the original contract in /docs and /redoc
- Runtime validation still uses generated Pydantic models (type safety preserved)
"""

import logging
from pathlib import Path
from typing import Any

import yaml

logger = logging.getLogger(__name__)


class OpenAPIContractLoader:
    """
    Loads and caches the OpenAPI contract from affilibuster.openapi.yaml.

    The contract is loaded once at startup and cached for the application lifecycle.
    """

    def __init__(self, contract_path: str | Path = "/contracts/affilibuster.openapi.yaml") -> None:
        """
        Initialize the OpenAPI contract loader.

        Args:
            contract_path: Path to the OpenAPI contract YAML file.
                          Defaults to /contracts/affilibuster.openapi.yaml (Docker volume mount).

        """
        self.contract_path = Path(contract_path)
        self._cached_spec: dict[str, Any] | None = None

    def load_contract(self) -> dict[str, Any]:
        """
        Load the OpenAPI contract from YAML file.

        Returns:
            Parsed OpenAPI specification as a dictionary.

        Raises:
            FileNotFoundError: If contract file doesn't exist.
            yaml.YAMLError: If contract file is invalid YAML.

        """
        if self._cached_spec is not None:
            logger.debug("Returning cached OpenAPI contract")
            return self._cached_spec

        if not self.contract_path.exists():
            error_msg = f"OpenAPI contract not found at {self.contract_path}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)

        try:
            logger.info("Loading OpenAPI contract from %s", self.contract_path)
            with self.contract_path.open() as f:
                spec = yaml.safe_load(f)
        except yaml.YAMLError as e:
            error_msg = f"Failed to parse OpenAPI contract: {e}"
            logger.exception("Failed to parse OpenAPI contract")
            raise yaml.YAMLError(error_msg) from e
        else:
            if not isinstance(spec, dict):
                raise TypeError("OpenAPI contract must be a dictionary")

            if "openapi" not in spec:
                raise ValueError("OpenAPI contract missing 'openapi' version field")

            if "paths" not in spec:
                raise ValueError("OpenAPI contract missing 'paths' section")

            self._cached_spec = spec
            title = spec.get("info", {}).get("title", "Unknown")
            version = spec.get("info", {}).get("version", "Unknown")
            paths_count = len(spec.get("paths", {}))
            schemas_count = len(spec.get("components", {}).get("schemas", {}))

            logger.info(
                "✅ Loaded OpenAPI contract: %s v%s",
                title,
                version,
            )
            logger.info("   Paths: %d", paths_count)
            logger.info("   Schemas: %d", schemas_count)

            return self._cached_spec

    def get_spec(self) -> dict[str, Any] | None:
        """
        Get the cached OpenAPI spec without raising exceptions.

        Returns:
            Cached OpenAPI specification, or None if not loaded or failed to load.

        """
        try:
            return self.load_contract()
        except FileNotFoundError as e:
            logger.warning("Could not load OpenAPI contract: %s", e)
            return None
        except (yaml.YAMLError, ValueError, TypeError) as e:
            logger.warning("Could not load OpenAPI contract: %s", e)
            return None


# Global instance for use in main.py
openapi_contract_loader = OpenAPIContractLoader()
