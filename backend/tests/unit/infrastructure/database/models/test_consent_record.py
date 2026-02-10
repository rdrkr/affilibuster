# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for ConsentRecordModel.

Tests the SQLAlchemy model for GDPR consent records.
"""

from uuid import uuid4

import pytest

from affilibuster_backend.infrastructure.database.models.consent_record import ConsentRecordModel


@pytest.mark.unit
class TestConsentRecordModel:
    """Test suite for ConsentRecordModel."""

    def test_model_creation_with_all_fields(self) -> None:
        """Test creating a ConsentRecordModel with all fields populated."""
        # Arrange
        record_id = uuid4()
        user_id = uuid4()

        # Act
        model = ConsentRecordModel(
            id=record_id,
            user_id=user_id,
            session_id="sess-abc123",
            consent_type="cookie",
            categories={"necessary": True, "analytics": True, "marketing": False},
            action="custom",
            ip_address="192.168.1.1",
            user_agent="TestAgent/1.0",
            consent_version="1.0",
        )

        # Assert
        assert model.id == record_id
        assert model.user_id == user_id
        assert model.session_id == "sess-abc123"
        assert model.consent_type == "cookie"
        assert model.categories == {"necessary": True, "analytics": True, "marketing": False}
        assert model.action == "custom"
        assert model.ip_address == "192.168.1.1"
        assert model.user_agent == "TestAgent/1.0"
        assert model.consent_version == "1.0"

    def test_model_creation_with_minimal_fields(self) -> None:
        """Test creating a ConsentRecordModel with only required fields."""
        # Act
        model = ConsentRecordModel(
            id=uuid4(),
            consent_type="cookie",
            categories={"necessary": True},
            action="accept_all",
        )

        # Assert
        assert model.user_id is None
        assert model.session_id is None
        assert model.ip_address is None
        assert model.user_agent is None
        assert model.consent_version is None

    def test_model_repr(self) -> None:
        """Test string representation of ConsentRecordModel."""
        # Arrange
        record_id = uuid4()
        model = ConsentRecordModel(
            id=record_id,
            consent_type="cookie",
            categories={"necessary": True},
            action="accept_all",
        )

        # Act
        repr_string = repr(model)

        # Assert
        assert repr_string == f"<ConsentRecordModel(id='{record_id}', consent_type='cookie', action='accept_all')>"

    def test_model_has_correct_tablename(self) -> None:
        """Test that model maps to correct table."""
        assert ConsentRecordModel.__tablename__ == "consent_records"

    def test_model_default_created_at_exists(self) -> None:
        """Test that created_at attribute exists on the model."""
        # Act
        model = ConsentRecordModel(
            id=uuid4(),
            consent_type="cookie",
            categories={"necessary": True},
            action="reject_all",
        )

        # Assert
        assert hasattr(model, "created_at")

    def test_model_supports_all_consent_types(self) -> None:
        """Test that the model accepts all valid consent type strings."""
        for consent_type in ["cookie", "terms", "privacy"]:
            model = ConsentRecordModel(
                id=uuid4(),
                consent_type=consent_type,
                categories={"necessary": True},
                action="accept_all",
            )
            assert model.consent_type == consent_type

    def test_model_supports_all_action_types(self) -> None:
        """Test that the model accepts all valid action strings."""
        for action in ["accept_all", "reject_all", "custom", "revoke"]:
            model = ConsentRecordModel(
                id=uuid4(),
                consent_type="cookie",
                categories={"necessary": True},
                action=action,
            )
            assert model.action == action
