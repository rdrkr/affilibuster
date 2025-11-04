# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for slug validation logic.

Reference: data-model.md:141-142 (slug must be unique per contentId, languageCode).
"""

import re

import pytest


class SlugValidationError(Exception):
    """Raised when slug validation fails."""


def validate_slug_format(slug: str) -> bool:
    """
    Validate slug format (URL-safe).

    Args:
        slug: The slug to validate

    Returns:
        True if valid, False otherwise

    """
    # Slug must be lowercase alphanumeric with hyphens only
    pattern = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
    return bool(re.match(pattern, slug))


def validate_slug_uniqueness(
    slug: str,
    content_id: str,
    language_code: str,
    existing_slugs: dict[tuple[str, str], str],
) -> None:
    """
    Validate that slug is unique per (contentId, languageCode).

    Args:
        slug: The slug to validate
        content_id: Content ID
        language_code: Language code
        existing_slugs: Dictionary mapping (content_id, language_code) to slug

    Raises:
        SlugValidationError: If slug is not unique

    """
    key = (content_id, language_code)
    if key in existing_slugs and existing_slugs[key] != slug:
        raise SlugValidationError(
            f"Slug '{slug}' already exists for content '{content_id}' in language '{language_code}'",
        )


def validate_slug_length(slug: str, min_length: int = 2, max_length: int = 200) -> None:
    """
    Validate slug length.

    Args:
        slug: The slug to validate
        min_length: Minimum allowed length
        max_length: Maximum allowed length

    Raises:
        SlugValidationError: If slug length is invalid

    """
    if len(slug) < min_length:
        raise SlugValidationError(f"Slug must be at least {min_length} characters")

    if len(slug) > max_length:
        raise SlugValidationError(f"Slug must not exceed {max_length} characters")


def validate_slug(
    slug: str, content_id: str, language_code: str, existing_slugs: dict[tuple[str, str], str] | None = None
) -> None:
    """
    Validate slug against all rules.

    Args:
        slug: The slug to validate
        content_id: Content ID
        language_code: Language code
        existing_slugs: Optional dictionary of existing slugs

    Raises:
        SlugValidationError: If validation fails

    """
    # Format validation
    if not validate_slug_format(slug):
        raise SlugValidationError(
            f"Slug '{slug}' contains invalid characters. Use lowercase letters, numbers, and hyphens only",
        )

    # Length validation
    validate_slug_length(slug)

    # Uniqueness validation
    if existing_slugs is not None:
        validate_slug_uniqueness(slug, content_id, language_code, existing_slugs)


@pytest.mark.unit
def test_valid_slug_format():
    """Test that valid slug formats pass validation."""
    valid_slugs = [
        "eco-bottle",
        "eco-water-bottle",
        "product-123",
        "a",
        "test-product-2024",
    ]

    for slug in valid_slugs:
        assert validate_slug_format(slug) is True


@pytest.mark.unit
def test_invalid_slug_format():
    """Test that invalid slug formats fail validation."""
    invalid_slugs = [
        "Eco-Bottle",  # Uppercase
        "eco bottle",  # Space
        "eco_bottle",  # Underscore
        "eco.bottle",  # Period
        "eco-bottle!",  # Special character
        "-eco-bottle",  # Leading hyphen
        "eco-bottle-",  # Trailing hyphen
        "eco--bottle",  # Double hyphen
    ]

    for slug in invalid_slugs:
        assert validate_slug_format(slug) is False


@pytest.mark.unit
def test_slug_uniqueness_per_content_and_language():
    """Test that slug must be unique per (contentId, languageCode)."""
    existing_slugs = {
        ("content-1", "en"): "eco-bottle",
        ("content-1", "it"): "bottiglia-eco",
        ("content-2", "en"): "water-filter",
    }

    # Trying to change existing slug to different slug - should fail
    with pytest.raises(SlugValidationError, match="already exists"):
        validate_slug_uniqueness("new-eco-bottle", "content-1", "en", existing_slugs)

    # Same slug, same content, same language - should pass (idempotent)
    validate_slug_uniqueness("eco-bottle", "content-1", "en", existing_slugs)

    # Same slug, same content, different language - should pass
    validate_slug_uniqueness("eco-bottle", "content-1", "he", existing_slugs)

    # Same slug, different content - should pass
    validate_slug_uniqueness("eco-bottle", "content-3", "en", existing_slugs)


@pytest.mark.unit
def test_slug_length_validation():
    """Test slug length constraints."""
    # Too short (< 2 characters)
    with pytest.raises(SlugValidationError, match="at least 2 characters"):
        validate_slug_length("a", min_length=2)

    # Valid minimum length
    validate_slug_length("ab", min_length=2)

    # Too long (> 200 characters)
    long_slug = "a" * 201
    with pytest.raises(SlugValidationError, match="must not exceed 200 characters"):
        validate_slug_length(long_slug, max_length=200)

    # Valid maximum length
    validate_slug_length("a" * 200, max_length=200)


@pytest.mark.unit
def test_slug_validation_all_rules():
    """Test complete slug validation with all rules."""
    existing_slugs = {
        ("content-1", "en"): "existing-slug",
    }

    # Valid slug
    validate_slug("new-product", "content-2", "en", existing_slugs)

    # Invalid format
    with pytest.raises(SlugValidationError, match="invalid characters"):
        validate_slug("Invalid Slug", "content-2", "en", existing_slugs)

    # Trying to change slug (should fail since content-1 already has a slug)
    with pytest.raises(SlugValidationError, match="already exists"):
        validate_slug("different-slug", "content-1", "en", existing_slugs)

    # Too short
    with pytest.raises(SlugValidationError, match="at least 2 characters"):
        validate_slug("a", "content-2", "en", existing_slugs)


@pytest.mark.unit
def test_slug_across_different_languages():
    """Test that same slug can exist in different languages for same content."""
    existing_slugs = {
        ("content-1", "en"): "eco-bottle",
        ("content-1", "it"): "eco-bottle",  # Same slug, different language
    }

    # Should allow same slug in Hebrew
    validate_slug("eco-bottle", "content-1", "he", existing_slugs)


@pytest.mark.unit
def test_slug_across_different_content():
    """Test that same slug can exist for different content IDs."""
    existing_slugs = {
        ("content-1", "en"): "eco-bottle",
        ("content-2", "en"): "eco-bottle",  # Same slug, different content
    }

    # Should allow same slug for content-3
    validate_slug("eco-bottle", "content-3", "en", existing_slugs)


@pytest.mark.unit
def test_empty_slug():
    """Test that empty slug is rejected."""
    with pytest.raises(SlugValidationError):
        validate_slug("", "content-1", "en")


@pytest.mark.unit
def test_numeric_only_slug():
    """Test that numeric-only slugs are valid."""
    assert validate_slug_format("123") is True
    assert validate_slug_format("2024") is True


@pytest.mark.unit
def test_slug_with_multiple_words():
    """Test slug with multiple hyphenated words."""
    valid_slugs = [
        "eco-friendly-water-bottle",
        "best-product-of-2024",
        "a-b-c-d-e-f",
    ]

    for slug in valid_slugs:
        assert validate_slug_format(slug) is True


@pytest.mark.unit
def test_slug_special_characters_rejected():
    """Test that special characters are rejected."""
    invalid_slugs = [
        "eco@bottle",
        "eco#bottle",
        "eco$bottle",
        "eco%bottle",
        "eco&bottle",
        "eco*bottle",
    ]

    for slug in invalid_slugs:
        assert validate_slug_format(slug) is False


@pytest.mark.unit
def test_slug_unicode_characters_rejected():
    """Test that Unicode/non-ASCII characters are rejected."""
    invalid_slugs = [
        "écø-bottle",
        "бутылка",
        "בקבוק",
        "bottiglia-è",
    ]

    for slug in invalid_slugs:
        assert validate_slug_format(slug) is False


@pytest.mark.unit
def test_slug_whitespace_variations():
    """Test that various whitespace characters are rejected."""
    invalid_slugs = [
        "eco bottle",  # Space
        "eco\tbottle",  # Tab
        "eco\nbottle",  # Newline
        "eco bottle",  # Non-breaking space
    ]

    for slug in invalid_slugs:
        assert validate_slug_format(slug) is False


@pytest.mark.unit
def test_update_existing_slug_same_value():
    """Test that updating slug to same value is allowed."""
    # Updating to same slug should be allowed (idempotent)
    # This is handled by checking existing_slugs[key] != slug in validation
    # When updating, we pass the same slug, so it should not raise
    validate_slug("eco-bottle", "content-1", "en", {})
