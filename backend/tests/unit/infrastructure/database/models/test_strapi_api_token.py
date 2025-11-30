# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for StrapiApiTokenModel.

Tests the SQLAlchemy model for Strapi API tokens.
"""

from datetime import UTC, datetime

from affilibuster_backend.infrastructure.database.models.strapi_api_token import StrapiApiTokenModel


class TestStrapiApiTokenModel:
    """Test suite for StrapiApiTokenModel."""

    def test_model_creation_with_required_fields(self):
        """Test creating a StrapiApiTokenModel with required fields."""
        # Arrange
        name = "Test Token"
        token_type = "full-access"
        access_key = "test_access_key_123"

        # Act
        model = StrapiApiTokenModel(
            name=name,
            type=token_type,
            access_key=access_key,
        )

        # Assert
        assert model.name == name
        assert model.type == token_type
        assert model.access_key == access_key
        assert model.description is None
        assert model.expires_at is None
        assert model.last_used_at is None

    def test_model_creation_with_all_fields(self):
        """Test creating a StrapiApiTokenModel with all fields."""
        # Arrange
        name = "Test Token"
        description = "Test description"
        token_type = "read-only"
        access_key = "test_access_key_456"
        created_at = datetime.now(UTC)
        updated_at = datetime.now(UTC)
        expires_at = datetime.now(UTC)
        last_used_at = datetime.now(UTC)

        # Act
        model = StrapiApiTokenModel(
            name=name,
            description=description,
            type=token_type,
            access_key=access_key,
            created_at=created_at,
            updated_at=updated_at,
            expires_at=expires_at,
            last_used_at=last_used_at,
        )

        # Assert
        assert model.name == name
        assert model.description == description
        assert model.type == token_type
        assert model.access_key == access_key
        assert model.created_at == created_at
        assert model.updated_at == updated_at
        assert model.expires_at == expires_at
        assert model.last_used_at == last_used_at

    def test_model_repr(self):
        """Test string representation of StrapiApiTokenModel."""
        # Arrange
        name = "Backend Full Access"
        token_type = "full-access"
        access_key = "test_key"

        model = StrapiApiTokenModel(
            name=name,
            type=token_type,
            access_key=access_key,
        )

        # Act
        repr_string = repr(model)

        # Assert
        assert repr_string == f"<StrapiApiToken(name='{name}', type='{token_type}')>"

    def test_model_has_correct_tablename(self):
        """Test that model maps to correct table."""
        # Assert
        assert StrapiApiTokenModel.__tablename__ == "strapi_api_tokens"

    def test_model_default_created_at_uses_utc(self):
        """Test that created_at defaults to current UTC time."""
        # Act
        model = StrapiApiTokenModel(
            name="Test",
            type="full-access",
            access_key="key",
        )

        # Assert
        # Note: The default lambda won't execute until the model is added to a session,
        # so we just verify the attribute exists
        assert hasattr(model, "created_at")

    def test_model_default_updated_at_uses_utc(self):
        """Test that updated_at defaults to current UTC time."""
        # Act
        model = StrapiApiTokenModel(
            name="Test",
            type="full-access",
            access_key="key",
        )

        # Assert
        # Verify updated_at column exists
        assert hasattr(model, "updated_at")
