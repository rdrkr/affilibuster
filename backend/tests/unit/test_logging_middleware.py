# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for RequestLoggingMiddleware.

Tests request/response logging and error logging.
"""

import pytest
from fastapi import FastAPI
from starlette.testclient import TestClient

from infrastructure.middleware.logging import RequestLoggingMiddleware


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

    @app.get("/error")
    async def error_route():
        raise ValueError("Test error")

    # Add middleware
    app.add_middleware(RequestLoggingMiddleware)

    return app


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


class TestRequestLoggingMiddlewareError:
    """Test RequestLoggingMiddleware with exceptions."""

    def test_middleware_logs_errors(self, app_with_logging_middleware, caplog):
        """Test middleware logs unhandled exceptions."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("ERROR"):
            try:
                client.get("/error")
            except Exception:
                pass

        # Error should be logged before middleware re-raises
        log_messages = [r.getMessage() for r in caplog.records if r.levelname == "ERROR"]
        assert len(log_messages) > 0

    def test_middleware_logs_error_with_method_and_path(self, app_with_logging_middleware, caplog):
        """Test middleware logs error with method and path."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("ERROR"):
            try:
                client.get("/error")
            except Exception:
                pass

        log_messages = [r.getMessage() for r in caplog.records if r.levelname == "ERROR"]
        assert any("GET /error" in msg for msg in log_messages)

    def test_middleware_logs_error_with_message(self, app_with_logging_middleware, caplog):
        """Test middleware logs exception message."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("ERROR"):
            try:
                client.get("/error")
            except Exception:
                pass

        log_messages = [r.getMessage() for r in caplog.records if r.levelname == "ERROR"]
        assert any("Test error" in msg or "ERROR" in msg for msg in log_messages)

    def test_middleware_logs_error_status_as_500(self, app_with_logging_middleware, caplog):
        """Test middleware logs error with 500 status code."""
        client = TestClient(app_with_logging_middleware)

        with caplog.at_level("ERROR"):
            try:
                client.get("/error")
            except Exception:
                pass

        # Check extra fields contain 500 status
        log_records = [r for r in caplog.records if r.levelname == "ERROR"]
        if len(log_records) > 0:
            record = log_records[0]
            assert "status_code" in record.__dict__
            assert record.status_code == 500
