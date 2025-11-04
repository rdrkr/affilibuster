# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Domain entities for the Affilibuster platform.

These entities represent the core business objects and contain business logic.
They are framework-agnostic and do not depend on infrastructure concerns.

Models auto-generated from the OpenAPI contract at contracts/template.openapi.yaml.
This ensures single source of truth and type safety across frontend and backend.

Generator: datamodel-code-generator (Pydantic v2)
Source: contracts/template.openapi.yaml

To regenerate models after spec changes:
  - Via Docker: models are regenerated automatically in docker-entrypoint.sh
  - Locally: Use datamodel-codegen CLI tool
"""

# Re-export union types for CMS repository type safety
from .cms_entities import CMSAPIError, CMSRequest, CMSResponse  # noqa: F401

# Re-export all auto-generated models from OpenAPI spec
# noinspection PyUnusedImports
from .generated.models import *  # noqa: F403

# Note: __all__ is intentionally not defined to allow wildcard imports to export all models
