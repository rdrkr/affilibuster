# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for INewsletterService interface.

Tests that the abstract interface cannot be instantiated directly
and that error classes are proper Exception subclasses.
"""

import pytest

from affilibuster_backend.domain.services.newsletter_service import (
    INewsletterService,
    NewsletterSubscribeError,
    NewsletterUnsubscribeError,
)


@pytest.mark.unit
class TestINewsletterService:
    """Test INewsletterService abstract interface."""

    def test_cannot_instantiate_abstract_class(self) -> None:
        """Test that INewsletterService cannot be instantiated directly."""
        with pytest.raises(TypeError):
            INewsletterService()  # type: ignore[abstract]

    def test_newsletter_subscribe_error_is_exception(self) -> None:
        """Test that NewsletterSubscribeError is an Exception subclass."""
        error = NewsletterSubscribeError("test error")
        assert isinstance(error, Exception)
        assert str(error) == "test error"

    def test_newsletter_unsubscribe_error_is_exception(self) -> None:
        """Test that NewsletterUnsubscribeError is an Exception subclass."""
        error = NewsletterUnsubscribeError("unsubscribe failed")
        assert isinstance(error, Exception)
        assert str(error) == "unsubscribe failed"
