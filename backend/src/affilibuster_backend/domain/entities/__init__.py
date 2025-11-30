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
# Re-export authentication domain entities
from .email_verification_token import EmailVerificationToken
from .generated.cms_entities import CMSAPIError, CMSRequest, CMSResponse

# Re-export all auto-generated models from OpenAPI spec
# noinspection PyUnusedImports
from .generated.models import *  # noqa: F403
from .password_reset_token import PasswordResetToken
from .user import Email, HashedPassword, UserEntity, UserStatus
from .user_session import UserSession

__all__ = [
    "CMSAPIError",
    "CMSRequest",
    "CMSResponse",
    "Email",
    "EmailVerificationToken",
    "HashedPassword",
    "PasswordResetToken",
    "UserEntity",
    "UserSession",
    "UserStatus",
]

# Note: Domain UserEntity is used for business logic, repositories, and use cases.
# The OpenAPI-generated User model from .generated.models is used for API responses.
# No naming conflict - UserEntity is the internal domain model.
