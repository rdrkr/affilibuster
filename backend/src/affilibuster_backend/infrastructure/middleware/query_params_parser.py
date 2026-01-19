# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""
Query Parameters Parser Middleware.

Parses bracket notation query parameters (e.g., filters[roles][roleId][$containsi]=author)
into nested dictionaries that can be properly processed by Pydantic models.

This middleware intercepts incoming requests and transforms bracket-notation query
parameters into a nested structure stored in request.state.parsed_query_params.
"""

import logging
import re
from collections.abc import Awaitable, Callable
from typing import Any
from urllib.parse import parse_qs, urlencode

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger(__name__)

# Regex to match bracket notation keys like "filters[roles][roleId][$containsi]"
# Uses .* instead of .+ to allow empty brackets like "items[]"
BRACKET_PATTERN = re.compile(r"^([^\[]+)(\[.*\].*)$")
# Regex to extract individual bracket segments
BRACKET_SEGMENT_PATTERN = re.compile(r"\[([^\]]*)\]")


def parse_bracket_notation(key: str, value: str | list[str], target: dict[str, Any]) -> None:
    """
    Parse a single bracket notation key-value pair into a nested dict structure.

    Converts "filters[roles][roleId][$containsi]" = "author" into:
    {"filters": {"roles": {"roleId": {"$containsi": "author"}}}}

    Array-style keys like "sort[]" or "fields[]" are kept as-is (not converted to nested dicts)
    because they represent Strapi array parameters.

    Args:
        key: The bracket notation key (e.g., "filters[roles][roleId][$containsi]")
        value: The value to set (string or list of strings from query params)
        target: The target dict to merge the result into

    """
    match = BRACKET_PATTERN.match(key)
    if not match:
        # Not bracket notation, store directly
        target[key] = value
        return

    # Extract base key and bracket segments
    base_key = match.group(1)
    brackets_part = match.group(2)

    # Extract all bracket segments
    segments = BRACKET_SEGMENT_PATTERN.findall(brackets_part)

    # Handle array-style params like "sort[]" or "fields[]" - single empty bracket
    # These should be kept as-is, not converted to nested dicts
    if segments == [""]:
        target[key] = value
        return

    # Build nested structure
    current: dict[str, Any] = target
    all_keys = [base_key, *segments]

    for segment in all_keys[:-1]:
        if segment not in current:
            current[segment] = {}
        elif not isinstance(current[segment], dict):
            # Key exists but is not a dict - convert to dict
            current[segment] = {}
        current = current[segment]

    # Set the final value
    final_key = all_keys[-1]
    current[final_key] = value


def parse_query_string_with_brackets(query_string: str) -> dict[str, Any]:
    """
    Parse a query string, converting bracket notation to nested dicts.

    Args:
        query_string: Raw query string (e.g., "filters[roles][roleId][$containsi]=author&locale=en")

    Returns:
        Dict with bracket notation converted to nested structure.
        Example: {"filters": {"roles": {"roleId": {"$containsi": "author"}}}, "locale": "en"}

    """
    if not query_string:
        return {}

    # Parse query string into key-value pairs
    # parse_qs returns lists for each value
    parsed = parse_qs(query_string, keep_blank_values=True)

    result: dict[str, Any] = {}
    for key, values in parsed.items():
        # Use first value if single, otherwise keep as list
        value = values[0] if len(values) == 1 else values
        parse_bracket_notation(key, value, result)

    return result


def flatten_nested_to_query_params(data: dict[str, Any], parent_key: str = "") -> dict[str, Any]:
    """
    Flatten a nested dict back to flat query params for httpx.

    This is used after parsing to create params compatible with the Strapi repository.

    Args:
        data: Nested dict structure
        parent_key: Parent key for recursion (internal use)

    Returns:
        Flat dict with bracket notation keys

    """
    result: dict[str, Any] = {}
    for key, value in data.items():
        new_key = f"{parent_key}[{key}]" if parent_key else key
        if isinstance(value, dict):
            result.update(flatten_nested_to_query_params(value, new_key))
        elif value is not None:
            result[new_key] = value
    return result


class QueryParamsParserMiddleware(BaseHTTPMiddleware):
    """
    Middleware that parses bracket notation query parameters.

    This middleware intercepts requests and:
    1. Parses the query string with bracket notation support
    2. Stores the parsed result in request.state.parsed_query_params
    3. Creates a modified scope with a new query string for simple params

    Routes can then access request.state.parsed_query_params to get
    properly nested filter parameters.
    """

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        """
        Dispatch the request, parsing bracket notation query params.

        Args:
            request: The incoming request
            call_next: The next middleware/handler in the chain

        Returns:
            The response from the handler

        """
        query_string = request.scope.get("query_string", b"").decode("utf-8")

        if query_string:
            # Parse the query string with bracket notation support
            parsed_params = parse_query_string_with_brackets(query_string)

            # Store parsed params in request state for route handlers
            request.state.parsed_query_params = parsed_params

            logger.debug(
                "Parsed query params: %s -> %s",
                query_string,
                parsed_params,
            )

            # Build a new query string with simple (non-bracket) params only
            # and nested params JSON-encoded
            simple_params: dict[str, Any] = {}
            for key, value in parsed_params.items():
                if isinstance(value, dict):
                    # Keep nested dicts as-is in state, don't add to query string
                    # The route handler will get them from request.state
                    pass
                else:
                    simple_params[key] = value

            # Create new scope with simple params only
            new_query_string = urlencode(simple_params, doseq=True)
            new_scope = dict(request.scope)
            new_scope["query_string"] = new_query_string.encode("utf-8")

            # Create new request with modified scope
            modified_request = Request(scope=new_scope, receive=request.receive)
            modified_request.state.parsed_query_params = parsed_params

            return await call_next(modified_request)

        # No query string, just pass through
        request.state.parsed_query_params = {}
        return await call_next(request)
