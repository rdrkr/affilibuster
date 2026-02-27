# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for RequestLoggingMiddleware.

Tests request/response logging and error logging.
"""

import contextlib
from typing import Any, Never

import pytest
from fastapi import FastAPI
from starlette.requests import Request
from starlette.responses import Response
from starlette.testclient import TestClient
from starlette.types import Receive, Scope, Send

from affilibuster_backend.infrastructure.middleware.request_logging import (
    SENSITIVE_HEADERS,
    RequestLoggingMiddleware,
)


async def noop_app(scope: Scope, receive: Receive, send: Send) -> None:
    """No-op ASGI app for testing middleware in isolation."""


def create_mock_request(method: str, path: str, headers: list[tuple[bytes, bytes]] | None = None) -> Request:
    """Create a mock Request object for testing middleware."""
    scope = {
        "type": "http",
        "method": method,
        "path": path,
        "query_string": b"",
        "headers": headers or [],
        "server": ("testserver", 80),
        "client": ("127.0.0.1", 8000),
        "scheme": "http",
    }
    return Request(scope)


@pytest.fixture
def app_with_logging_middleware():
    """Create a FastAPI app with logging middleware."""
    app = FastAPI()

    @app.get("/success")
    async def success():
        return {"status": "ok"}

    @app.post("/data")
    async def post_data():
        return {"id": 123}

    @app.get("/error", response_model=None)
    async def error_route() -> Never:
        raise ValueError("Test error")

    # Add middleware
    app.add_middleware(RequestLoggingMiddleware)

    return app


@pytest.mark.unit
class TestRequestLoggingMiddlewareSuccess:
    """Test RequestLoggingMiddleware with successful requests."""

    def test_middleware_logs_successful_request(self, app_with_logging_middleware, caplog):
        """Test middleware logs successful requests."""
        client = TestClient(app_with_logging_middleware)

        client.get("/success")

        # Check that logging happened (caplog captures logs)
        log_records = [r for r in caplog.records if "GET /success" in r.getMessage()]
        assert len(log_records) > 0

    def test_middleware_logs_method_and_path(self, app_with_logging_middleware, caplog):
        """Test middleware logs request method and path."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("INFO"):
            client.get("/success")

        log_messages = [r.getMessage() for r in caplog.records]
        assert any("GET /success" in msg for msg in log_messages)

    def test_middleware_logs_status_code(self, app_with_logging_middleware, caplog):
        """Test middleware logs response status code."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("INFO"):
            client.get("/success")

        log_messages = [r.getMessage() for r in caplog.records]
        assert any("200" in msg for msg in log_messages)

    def test_middleware_logs_response_time(self, app_with_logging_middleware, caplog):
        """Test middleware logs response duration."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("INFO"):
            client.get("/success")

        log_messages = [r.getMessage() for r in caplog.records]
        # Should contain 'ms' in the message
        assert any("ms" in msg for msg in log_messages)

    def test_middleware_logs_different_methods(self, app_with_logging_middleware, caplog):
        """Test middleware logs different HTTP methods."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("INFO"):
            client.get("/success")
            client.post("/data")

        log_messages = [r.getMessage() for r in caplog.records]
        assert any("GET" in msg for msg in log_messages)
        assert any("POST" in msg for msg in log_messages)

    def test_middleware_logs_extra_fields(self, app_with_logging_middleware, caplog):
        """Test middleware logs extra structured fields."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("INFO"):
            client.get("/success")

        # Check that extra fields are present in log records
        log_records = [r for r in caplog.records if "GET /success" in r.getMessage()]
        assert len(log_records) > 0

        record = log_records[0]
        assert "method" in record.__dict__
        assert "path" in record.__dict__
        assert "status_code" in record.__dict__
        assert "duration_ms" in record.__dict__


@pytest.mark.unit
class TestRequestLoggingMiddlewareError:
    """Test RequestLoggingMiddleware with exceptions."""

    def test_middleware_logs_errors(self, app_with_logging_middleware, caplog):
        """Test middleware logs unhandled exceptions."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("ERROR"), contextlib.suppress(Exception):
            client.get("/error")

        # Error should be logged before middleware re-raises
        log_messages = [r.getMessage() for r in caplog.records if r.levelname == "ERROR"]
        assert len(log_messages) > 0

    def test_middleware_logs_error_with_method_and_path(self, app_with_logging_middleware, caplog):
        """Test middleware logs error with method and path."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("ERROR"), contextlib.suppress(Exception):
            client.get("/error")

        log_messages = [r.getMessage() for r in caplog.records if r.levelname == "ERROR"]
        assert any("GET /error" in msg for msg in log_messages)

    def test_middleware_logs_error_with_message(self, app_with_logging_middleware, caplog):
        """Test middleware logs exception message."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("ERROR"), contextlib.suppress(Exception):
            client.get("/error")

        log_messages = [r.getMessage() for r in caplog.records if r.levelname == "ERROR"]
        assert any("Test error" in msg or "ERROR" in msg for msg in log_messages)

    def test_middleware_logs_error_status_as_500(self, app_with_logging_middleware, caplog):
        """Test middleware logs error with 500 status code."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("ERROR"), contextlib.suppress(Exception):
            client.get("/error")

        # Check extra fields contain 500 status
        log_records = [r for r in caplog.records if r.levelname == "ERROR"]
        if len(log_records) > 0:
            record = log_records[0]
            assert "status_code" in record.__dict__
            assert record.status_code == 500


@pytest.mark.unit
class TestRequestLoggingMiddlewareDirectDispatch:
    """Test RequestLoggingMiddleware using direct dispatch to cover exception paths."""

    @pytest.mark.asyncio
    async def test_logging_middleware_dispatch_logs_exception(self, caplog):
        """Test middleware dispatch logs exception with all fields before re-raising."""
        import logging

        from affilibuster_backend.infrastructure.middleware.request_logging import RequestLoggingMiddleware

        with caplog.at_level(logging.ERROR):
            middleware = RequestLoggingMiddleware(app=noop_app)
            request = create_mock_request("GET", "/test-error")

            async def failing_call_next(_: Request) -> Never:
                raise RuntimeError("Direct dispatch error")

            # Exception should be re-raised
            with pytest.raises(RuntimeError, match="Direct dispatch error"):
                await middleware.dispatch(request, failing_call_next)

        # Verify error was logged with all fields
        error_records = [r for r in caplog.records if r.levelname == "ERROR"]
        assert len(error_records) > 0

        record = error_records[0]
        assert "method" in record.__dict__
        assert record.method == "GET"
        assert "path" in record.__dict__
        assert record.path == "/test-error"
        assert "status_code" in record.__dict__
        assert record.status_code == 500
        assert "duration_ms" in record.__dict__
        assert record.duration_ms >= 0
        assert "error" in record.__dict__
        assert "Direct dispatch error" in record.error

    @pytest.mark.asyncio
    async def test_logging_middleware_dispatch_reraises_exception(self):
        """Test middleware dispatch re-raises exception after logging."""
        from affilibuster_backend.infrastructure.middleware.request_logging import RequestLoggingMiddleware

        middleware = RequestLoggingMiddleware(app=noop_app)
        request = create_mock_request("POST", "/reraise-test")

        async def failing_call_next(_: Request) -> Never:
            raise ValueError("Must be re-raised")

        # Exception should propagate up
        with pytest.raises(ValueError, match="Must be re-raised"):
            await middleware.dispatch(request, failing_call_next)


@pytest.mark.unit
class TestRequestLoggingMiddlewareHeaderSanitization:
    """Test that sensitive headers are sanitized in log output."""

    @pytest.mark.asyncio
    async def test_sensitive_headers_are_redacted(self, caplog):
        """Test that authorization, cookie, and session headers are masked."""
        import logging

        middleware = RequestLoggingMiddleware(app=noop_app)
        request = create_mock_request(
            "GET",
            "/test-sanitize",
            headers=[
                (b"authorization", b"Bearer secret-token-123"),
                (b"cookie", b"access_token=jwt-secret"),
                (b"x-session-id", b"sess-abc123"),
                (b"x-api-key", b"api-key-secret"),
                (b"x-csrf-token", b"csrf-token-secret"),
                (b"user-agent", b"TestAgent/1.0"),
                (b"accept", b"application/json"),
            ],
        )

        async def success_call_next(_: Request) -> Response:
            return Response(status_code=200)

        with caplog.at_level(logging.DEBUG):
            await middleware.dispatch(request, success_call_next)

        # Find the debug log record that contains headers
        debug_records = [r for r in caplog.records if r.levelname == "DEBUG" and hasattr(r, "headers")]
        assert len(debug_records) > 0

        logged_headers = debug_records[0].headers

        # Sensitive headers should be masked
        assert logged_headers["authorization"] == "***"
        assert logged_headers["cookie"] == "***"
        assert logged_headers["x-session-id"] == "***"
        assert logged_headers["x-api-key"] == "***"
        assert logged_headers["x-csrf-token"] == "***"

        # Non-sensitive headers should be preserved
        assert logged_headers["user-agent"] == "TestAgent/1.0"
        assert logged_headers["accept"] == "application/json"

    @pytest.mark.asyncio
    async def test_non_sensitive_headers_are_not_redacted(self, caplog):
        """Test that regular headers like content-type are logged as-is."""
        import logging

        middleware = RequestLoggingMiddleware(app=noop_app)
        request = create_mock_request(
            "GET",
            "/test-pass-through",
            headers=[
                (b"content-type", b"application/json"),
                (b"accept-language", b"en-US"),
            ],
        )

        async def success_call_next(_: Request) -> Response:
            return Response(status_code=200)

        with caplog.at_level(logging.DEBUG):
            await middleware.dispatch(request, success_call_next)

        debug_records = [r for r in caplog.records if r.levelname == "DEBUG" and hasattr(r, "headers")]
        assert len(debug_records) > 0

        logged_headers = debug_records[0].headers
        assert logged_headers["content-type"] == "application/json"
        assert logged_headers["accept-language"] == "en-US"

    def test_sensitive_headers_constant_is_frozen_set(self):
        """Test that SENSITIVE_HEADERS is an immutable frozenset."""
        assert isinstance(SENSITIVE_HEADERS, frozenset)
        assert "authorization" in SENSITIVE_HEADERS
        assert "cookie" in SENSITIVE_HEADERS
        assert "x-session-id" in SENSITIVE_HEADERS
        assert "x-api-key" in SENSITIVE_HEADERS
        assert "x-csrf-token" in SENSITIVE_HEADERS


@pytest.mark.unit
class TestRequestLoggingMiddlewareIPAnonymization:
    """Test IP anonymization in request logging (GDPR Art. 5(1)(c))."""

    @pytest.mark.asyncio
    async def test_ip_address_is_anonymized_in_logs(self, caplog, monkeypatch):
        """Test that client IPs are anonymized when setting is enabled."""
        import logging

        from affilibuster_backend.infrastructure.middleware import request_logging

        monkeypatch.setattr(request_logging.settings, "anonymize_request_ips", True)

        middleware = RequestLoggingMiddleware(app=noop_app)
        request = create_mock_request("GET", "/test-anon")

        async def success_call_next(_: Request) -> Response:
            return Response(status_code=200)

        with caplog.at_level(logging.INFO):
            await middleware.dispatch(request, success_call_next)

        # Client host is 127.0.0.1 in mock request, should be anonymized to 127.0.0.0
        info_records = [r for r in caplog.records if r.levelname == "INFO" and hasattr(r, "client_host")]
        assert len(info_records) > 0
        assert info_records[0].client_host == "127.0.0.0"

    @pytest.mark.asyncio
    async def test_ip_not_anonymized_when_setting_disabled(self, caplog, monkeypatch):
        """Test that client IPs are NOT anonymized when setting is disabled."""
        import logging

        from affilibuster_backend.infrastructure.middleware import request_logging

        monkeypatch.setattr(request_logging.settings, "anonymize_request_ips", False)

        middleware = RequestLoggingMiddleware(app=noop_app)
        request = create_mock_request("GET", "/test-raw")

        async def success_call_next(_: Request) -> Response:
            return Response(status_code=200)

        with caplog.at_level(logging.INFO):
            await middleware.dispatch(request, success_call_next)

        info_records = [r for r in caplog.records if r.levelname == "INFO" and hasattr(r, "client_host")]
        assert len(info_records) > 0
        assert info_records[0].client_host == "127.0.0.1"

    @pytest.mark.asyncio
    async def test_user_agent_not_in_info_logs(self, caplog, monkeypatch):
        """Test that user-agent is excluded from INFO-level access logs for GDPR."""
        import logging

        from affilibuster_backend.infrastructure.middleware import request_logging

        monkeypatch.setattr(request_logging.settings, "anonymize_request_ips", False)

        middleware = RequestLoggingMiddleware(app=noop_app)
        request = create_mock_request("GET", "/test-ua", headers=[(b"user-agent", b"TestBot/1.0")])

        async def success_call_next(_: Request) -> Response:
            return Response(status_code=200)

        with caplog.at_level(logging.INFO):
            await middleware.dispatch(request, success_call_next)

        info_records = [r for r in caplog.records if r.levelname == "INFO" and hasattr(r, "method")]
        assert len(info_records) > 0
        # INFO-level access logs should NOT contain user_agent
        assert not hasattr(info_records[0], "user_agent")

    @pytest.mark.asyncio
    async def test_unknown_client_host_skips_anonymization(self, caplog, monkeypatch):
        """Test that 'unknown' client host is not anonymized."""
        import logging

        from affilibuster_backend.infrastructure.middleware import request_logging

        monkeypatch.setattr(request_logging.settings, "anonymize_request_ips", True)

        middleware = RequestLoggingMiddleware(app=noop_app)
        # Create request with no client
        scope: dict[str, Any] = {
            "type": "http",
            "method": "GET",
            "path": "/test-no-client",
            "query_string": b"",
            "headers": [],
            "server": ("testserver", 80),
            "client": None,
            "scheme": "http",
        }
        request = Request(scope)

        async def success_call_next(_: Request) -> Response:
            return Response(status_code=200)

        with caplog.at_level(logging.INFO):
            await middleware.dispatch(request, success_call_next)

        info_records = [r for r in caplog.records if r.levelname == "INFO" and hasattr(r, "client_host")]
        assert len(info_records) > 0
        assert info_records[0].client_host == "unknown"

    @pytest.mark.asyncio
    async def test_error_response_excludes_user_agent(self, caplog, monkeypatch):
        """Test that error logs also exclude user-agent from extra fields."""
        import logging

        from affilibuster_backend.infrastructure.middleware import request_logging

        monkeypatch.setattr(request_logging.settings, "anonymize_request_ips", False)

        middleware = RequestLoggingMiddleware(app=noop_app)
        request = create_mock_request("GET", "/test-error-ua")

        async def failing_call_next(_: Request):
            raise RuntimeError("Error test")

        with caplog.at_level(logging.ERROR), pytest.raises(RuntimeError):
            await middleware.dispatch(request, failing_call_next)

        error_records = [r for r in caplog.records if r.levelname == "ERROR"]
        assert len(error_records) > 0
        # Error logs should NOT contain user_agent
        assert not hasattr(error_records[0], "user_agent")
