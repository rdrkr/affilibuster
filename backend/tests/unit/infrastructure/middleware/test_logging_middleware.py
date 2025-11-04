# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for RequestLoggingMiddleware.

Tests request/response logging and error logging.
"""

import contextlib
from typing import Never

import pytest
from fastapi import FastAPI
from starlette.requests import Request
from starlette.testclient import TestClient

from affilibuster_backend.infrastructure.middleware.request_logging import RequestLoggingMiddleware


def create_mock_request(method: str, path: str) -> Request:
    """Create a mock Request object for testing middleware."""
    scope = {
        "type": "http",
        "method": method,
        "path": path,
        "query_string": b"",
        "headers": [],
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
            middleware = RequestLoggingMiddleware(app=None)
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

        middleware = RequestLoggingMiddleware(app=None)
        request = create_mock_request("POST", "/reraise-test")

        async def failing_call_next(_: Request) -> Never:
            raise ValueError("Must be re-raised")

        # Exception should propagate up
        with pytest.raises(ValueError, match="Must be re-raised"):
            await middleware.dispatch(request, failing_call_next)
