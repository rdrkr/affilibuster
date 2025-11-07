# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for homepage route query parameter parsing.

Tests the parse_homepage_query_params function to ensure proper handling
of repeated query parameters (populate, fields) through different code paths.
"""

from collections.abc import Iterator
from unittest.mock import MagicMock

import pytest

from affilibuster_backend.domain.entities.generated.models import (
    Field7,
    PopulateEnum5,
)
from affilibuster_backend.infrastructure.api.routes.homepage import (
    parse_homepage_query_params,
)


class TestParseHomepageQueryParams:
    """Test query parameter parsing for homepage endpoint."""

    @pytest.mark.asyncio
    async def test_parse_with_getlist_method_returns_populated_lists(self):
        """Test that getlist() method returns non-empty lists for populate and fields.

        Test that when request.query_params has getlist() method and it returns non-empty lists,
        those lists are used directly (covering the FALSE branch of if not populate/if not fields).

        This covers branches: 38->42 (populate has value, skip fallback) and 43->46 (fields has value, skip fallback).
        """
        # Create mock request with query_params that has getlist method
        mock_request = MagicMock()
        mock_query_params = MagicMock()

        # Configure getlist to return non-empty lists
        def getlist_side_effect(key):
            if key == "populate":
                return ["trustCards", "featureCards"]
            if key == "fields":
                return ["entryTitle", "heroTitle"]
            return []

        mock_query_params.getlist.side_effect = getlist_side_effect

        # Support dict() conversion - make it behave like a mapping
        # When there are repeated params, dict() gets the last value for each key
        mock_query_params.keys = lambda: ["locale", "populate", "fields", "filters", "status"]
        mock_query_params.__getitem__ = lambda _self, key: {
            "locale": "en",
            "populate": "featureCards",  # Last value if repeated
            "fields": "heroTitle",  # Last value if repeated
            "filters": None,
            "status": None,
        }[key]
        mock_query_params.get = lambda key, default=None: {
            "locale": "en",
            "populate": "featureCards",
            "fields": "heroTitle",
            "filters": None,
            "status": None,
        }.get(key, default)

        mock_request.query_params = mock_query_params

        # Execute
        result = await parse_homepage_query_params(mock_request)

        # Assert that getlist results were used directly (not the fallback multi_items)
        # Pydantic converts strings to enums
        assert result.populate == [PopulateEnum5.TRUST_CARDS, PopulateEnum5.FEATURE_CARDS]
        assert result.fields == [Field7.ENTRY_TITLE, Field7.HERO_TITLE]
        assert result.locale == "en"

        # Verify getlist was called (covering the TRUE branch before the if not populate/fields checks)
        assert mock_query_params.getlist.call_count >= 2

    @pytest.mark.asyncio
    async def test_parse_with_getlist_method_returns_empty_lists(self):
        """Test that getlist() method returns empty lists and fallback is used.

        Test that when request.query_params has getlist() method but returns empty lists,
        fallback to multi_items is used (covering the TRUE branch of if not populate/if not fields).
        """
        # Create mock request
        mock_request = MagicMock()
        mock_query_params = MagicMock()

        # Configure getlist to return empty lists (falsy)
        mock_query_params.getlist.return_value = []

        # Configure multi_items to return populate/fields values
        mock_query_params.multi_items.return_value = [
            ("locale", "it"),
            ("populate", "trustCards"),
            ("populate", "featureCards"),
            ("fields", "entryTitle"),
        ]

        # Support dict() conversion - make it behave like a mapping
        mock_query_params.keys = lambda: ["locale", "populate", "fields", "filters", "status"]
        mock_query_params.__getitem__ = lambda _self, key: {
            "locale": "it",
            "populate": "featureCards",
            "fields": "entryTitle",
            "filters": None,
            "status": None,
        }[key]
        mock_query_params.get = lambda key, default=None: {
            "locale": "it",
            "populate": "featureCards",
            "fields": "entryTitle",
            "filters": None,
            "status": None,
        }.get(key, default)

        mock_request.query_params = mock_query_params

        # Execute
        result = await parse_homepage_query_params(mock_request)

        # Assert that multi_items fallback was used
        # Pydantic converts strings to enums
        assert result.populate == [PopulateEnum5.TRUST_CARDS, PopulateEnum5.FEATURE_CARDS]
        assert result.fields == [Field7.ENTRY_TITLE]
        assert result.locale == "it"

    @pytest.mark.asyncio
    async def test_parse_without_getlist_method_uses_multi_items(self):
        """Test that multi_items is used when getlist() method doesn't exist.

        Test that when request.query_params doesn't have getlist() method,
        multi_items is used (hasattr returns False, so populate/fields are None initially).
        """
        # Create mock request
        mock_request = MagicMock()

        # Remove getlist attribute to simulate QueryParams without it
        class SimpleQueryParams:
            def __init__(self) -> None:
                self._items = [
                    ("locale", "he"),
                    ("populate", "featureCards"),
                ]

            def __iter__(self) -> Iterator[tuple[str, str]]:
                """Make dict() conversion work."""
                return iter(self._items)

            def multi_items(self):
                return self._items

            def get(self, key, default=None):
                for k, v in self._items:
                    if k == key:
                        return v
                return default

        mock_request.query_params = SimpleQueryParams()

        # Execute
        result = await parse_homepage_query_params(mock_request)

        # Assert that multi_items was used for populate (since no getlist)
        # Pydantic converts strings to enums
        assert result.populate == [PopulateEnum5.FEATURE_CARDS]
        assert result.locale == "he"
        assert result.filters is None
