# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
API Models for Affilibuster Backend.

This module re-exports Pydantic models generated from OpenAPI specifications.

All models are auto-generated from the OpenAPI contract at contracts/template.openapi.yaml.
This ensures single source of truth and type safety across frontend and backend.

Generator: datamodel-code-generator (Pydantic v2)
Source: contracts/template.openapi.yaml

To regenerate models after spec changes:
  - Via Docker: models are regenerated automatically in docker-entrypoint.sh
  - Locally: Use datamodel-codegen CLI tool
"""

# Re-export all auto-generated models from OpenAPI spec
from .generated.models import *  # noqa: F401, F403

__all__ = [
    # Auto-generated from OpenAPI spec - all models available via wildcard import
]
