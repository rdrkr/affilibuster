# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for ContentVersion domain entity.

Covers:
- Valid content version creation
- Validation rules (publishedAt required when published, no self-reference in translations)
- publish/unpublish methods
- add_translation method
- Default value initialization
"""

from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from domain.entities.content_version import ContentVersion


class TestContentVersionCreation:
    """Test valid ContentVersion entity creation."""

    def test_create_content_version_minimal(self):
        """Test creating content version with minimal required fields."""
        content_id = uuid4()
        version = ContentVersion(
            content_id=content_id,
            language_code="en",
            title="Eco Water Bottle",
            slug="eco-water-bottle",
            body="<p>Eco-friendly water bottle.</p>",
        )

        assert version.content_id == content_id
        assert version.language_code == "en"
        assert version.title == "Eco Water Bottle"
        assert version.slug == "eco-water-bottle"
        assert version.body == "<p>Eco-friendly water bottle.</p>"
        assert version.is_published is False
        assert version.published_at is None

    def test_create_content_version_with_all_fields(self):
        """Test creating content version with all fields."""
        content_id = uuid4()
        version_id = uuid4()
        created = datetime.now(UTC)
        updated = datetime.now(UTC)

        version = ContentVersion(
            id=version_id,
            content_id=content_id,
            language_code="en",
            title="Eco Water Bottle",
            slug="eco-water-bottle",
            body="<p>Eco-friendly water bottle.</p>",
            excerpt="Sustainable water bottle",
            meta_title="Eco Water Bottle - Best Sustainable Option",
            meta_description="Buy the best eco-friendly water bottle",
            meta_keywords=["eco", "sustainable", "water bottle"],
            custom_schema={"@type": "Product"},
            is_published=False,
            published_at=None,
            translations={"it": "italian-version-id"},
            created_at=created,
            updated_at=updated,
        )

        assert version.id == version_id
        assert version.excerpt == "Sustainable water bottle"
        assert version.meta_title == "Eco Water Bottle - Best Sustainable Option"
        assert version.meta_description == "Buy the best eco-friendly water bottle"
        assert version.meta_keywords == ["eco", "sustainable", "water bottle"]
        assert version.custom_schema == {"@type": "Product"}
        assert version.translations == {"it": "italian-version-id"}

    def test_create_published_content_version(self):
        """Test creating already published content version."""
        content_id = uuid4()
        published_at = datetime.now(UTC)

        version = ContentVersion(
            content_id=content_id,
            language_code="en",
            title="Eco Water Bottle",
            slug="eco-water-bottle",
            body="<p>Eco-friendly water bottle.</p>",
            is_published=True,
            published_at=published_at,
        )

        assert version.is_published is True
        assert version.published_at == published_at

    def test_auto_generated_id(self):
        """Test that ID is auto-generated if not provided."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        assert version.id is not None
        assert isinstance(version.id, UUID)

    def test_auto_generated_timestamps(self):
        """Test that timestamps are auto-generated if not provided."""
        before = datetime.now(UTC)

        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        after = datetime.now(UTC)

        assert version.created_at is not None
        assert version.updated_at is not None
        assert before <= version.created_at <= after
        assert before <= version.updated_at <= after


class TestContentVersionValidation:
    """Test ContentVersion validation rules."""

    def test_error_when_published_without_published_at(self):
        """Test validation fails when is_published=True but publishedAt is None."""
        with pytest.raises(ValueError, match="publishedAt must be set when isPublished=true"):
            ContentVersion(
                content_id=uuid4(),
                language_code="en",
                title="Test",
                slug="test",
                body="body",
                is_published=True,
                published_at=None,  # Invalid: must be set when published
            )

    def test_error_when_translations_contain_self_reference(self):
        """Test validation fails when translations include self-reference."""
        with pytest.raises(ValueError, match="translations cannot contain self-reference"):
            ContentVersion(
                content_id=uuid4(),
                language_code="en",
                title="Test",
                slug="test",
                body="body",
                translations={"en": "some-id", "it": "italian-id"},  # 'en' is self-reference
            )

    def test_valid_when_published_with_published_at(self):
        """Test validation passes when is_published=True and publishedAt is set."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="body",
            is_published=True,
            published_at=datetime.now(UTC),  # Valid
        )

        assert version.is_published is True
        assert version.published_at is not None

    def test_valid_when_not_published_without_published_at(self):
        """Test validation passes when is_published=False and publishedAt is None."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="body",
            is_published=False,
            published_at=None,
        )

        assert version.is_published is False
        assert version.published_at is None

    def test_valid_translations_without_self_reference(self):
        """Test validation passes when translations don't include self-reference."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="body",
            translations={"it": "italian-id", "fr": "french-id"},  # No 'en'
        )

        assert "en" not in version.translations
        assert version.translations == {"it": "italian-id", "fr": "french-id"}


class TestContentVersionPublish:
    """Test ContentVersion publish method."""

    def test_publish_draft_content_version(self):
        """Test publishing a draft content version."""
        before = datetime.now(UTC)

        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="body",
            is_published=False,
        )

        version.publish()
        after = datetime.now(UTC)

        assert version.is_published is True
        assert version.published_at is not None
        assert before <= version.published_at <= after
        assert before <= version.updated_at <= after

    def test_publish_sets_published_at(self):
        """Test that publish() sets published_at timestamp."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="body",
            is_published=False,
        )

        assert version.published_at is None
        version.publish()
        assert version.published_at is not None

    def test_publish_updates_updated_at(self):
        """Test that publish() updates updated_at timestamp."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="body",
            is_published=False,
        )

        old_updated_at = version.updated_at
        version.publish()

        assert version.updated_at > old_updated_at

    def test_error_when_publishing_already_published(self):
        """Test error when trying to publish already published content."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="body",
            is_published=True,
            published_at=datetime.now(UTC),
        )

        with pytest.raises(ValueError, match="Content version is already published"):
            version.publish()


class TestContentVersionUnpublish:
    """Test ContentVersion unpublish method."""

    def test_unpublish_published_content_version(self):
        """Test unpublishing a published content version."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="body",
            is_published=True,
            published_at=datetime.now(UTC),
        )

        version.unpublish()

        assert version.is_published is False

    def test_unpublish_updates_updated_at(self):
        """Test that unpublish() updates updated_at timestamp."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="body",
            is_published=True,
            published_at=datetime.now(UTC),
        )

        old_updated_at = version.updated_at
        version.unpublish()

        assert version.updated_at > old_updated_at

    def test_unpublish_already_unpublished_content(self):
        """Test unpublishing already unpublished content (should not raise error)."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="body",
            is_published=False,
        )

        # Should not raise error
        version.unpublish()
        assert version.is_published is False


class TestContentVersionAddTranslation:
    """Test ContentVersion add_translation method."""

    def test_add_translation(self):
        """Test adding a translation link."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        version.add_translation("it", "italian-version-id")

        assert "it" in version.translations
        assert version.translations["it"] == "italian-version-id"

    def test_add_multiple_translations(self):
        """Test adding multiple translation links."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        version.add_translation("it", "italian-version-id")
        version.add_translation("fr", "french-version-id")
        version.add_translation("es", "spanish-version-id")

        assert len(version.translations) == 3
        assert version.translations["it"] == "italian-version-id"
        assert version.translations["fr"] == "french-version-id"
        assert version.translations["es"] == "spanish-version-id"

    def test_add_translation_updates_updated_at(self):
        """Test that add_translation() updates updated_at timestamp."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        old_updated_at = version.updated_at
        version.add_translation("it", "italian-version-id")

        assert version.updated_at > old_updated_at

    def test_error_when_adding_self_reference_translation(self):
        """Test error when trying to add self-reference translation."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        with pytest.raises(ValueError, match="Cannot add self-reference translation"):
            version.add_translation("en", "some-version-id")

    def test_overwrite_existing_translation(self):
        """Test that adding translation for existing language overwrites it."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        version.add_translation("it", "old-italian-version-id")
        version.add_translation("it", "new-italian-version-id")

        assert version.translations["it"] == "new-italian-version-id"


class TestContentVersionDefaults:
    """Test ContentVersion default value initialization."""

    def test_default_meta_keywords_is_empty_list(self):
        """Test that meta_keywords defaults to empty list."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        assert version.meta_keywords == []

    def test_default_custom_schema_is_empty_dict(self):
        """Test that custom_schema defaults to empty dict."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        assert version.custom_schema == {}

    def test_default_translations_is_empty_dict(self):
        """Test that translations defaults to empty dict."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        assert version.translations == {}

    def test_default_is_published_is_false(self):
        """Test that is_published defaults to False."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        assert version.is_published is False

    def test_default_published_at_is_none(self):
        """Test that published_at defaults to None."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        assert version.published_at is None


class TestContentVersionEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_content_version_with_empty_body(self):
        """Test creating content version with empty body."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="",  # Empty body
        )

        assert version.body == ""

    def test_content_version_with_long_title(self):
        """Test creating content version with very long title."""
        long_title = "A" * 500

        version = ContentVersion(content_id=uuid4(), language_code="en", title=long_title, slug="test", body="body")

        assert len(version.title) == 500

    def test_content_version_with_special_characters_in_slug(self):
        """Test creating content version with hyphens and numbers in slug."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="eco-bottle-2024-v2",
            body="body",
        )

        assert version.slug == "eco-bottle-2024-v2"

    def test_content_version_with_different_language_codes(self):
        """Test creating content versions with different language codes."""
        content_id = uuid4()

        en_version = ContentVersion(
            content_id=content_id,
            language_code="en",
            title="English Title",
            slug="english-title",
            body="body",
        )

        it_version = ContentVersion(
            content_id=content_id,
            language_code="it",
            title="Titolo Italiano",
            slug="titolo-italiano",
            body="corpo",
        )

        assert en_version.language_code == "en"
        assert it_version.language_code == "it"

    def test_multiple_validate_calls(self):
        """Test that validate() can be called multiple times."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        # Should not raise error on multiple calls
        version.validate()
        version.validate()
        version.validate()

    def test_publish_unpublish_cycle(self):
        """Test publishing and unpublishing content multiple times."""
        version = ContentVersion(content_id=uuid4(), language_code="en", title="Test", slug="test", body="body")

        # Publish
        version.publish()
        assert version.is_published is True

        # Unpublish
        version.unpublish()
        assert version.is_published is False

        # Publish again
        version.publish()
        assert version.is_published is True

    def test_provided_none_values_get_defaults(self):
        """Test that explicitly provided None values get replaced with defaults."""
        version = ContentVersion(
            content_id=uuid4(),
            language_code="en",
            title="Test",
            slug="test",
            body="body",
            meta_keywords=None,
            custom_schema=None,
            translations=None,
        )

        assert version.meta_keywords == []
        assert version.custom_schema == {}
        assert version.translations == {}
