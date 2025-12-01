# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Unit tests for environment file path resolution."""

import os
from unittest.mock import patch

from affilibuster_backend.config.settings import _get_env_file_path


class TestGetEnvFilePath:
    """Test suite for _get_env_file_path function."""

    def test_env_file_override(self):
        """Test that ENV_FILE environment variable overrides everything."""
        # Arrange
        expected_path = "/custom/path/.env"
        with patch.dict(os.environ, {"ENV_FILE": expected_path}):
            # Act
            result = _get_env_file_path()

            # Assert
            assert result == expected_path

    def test_docker_env_path(self):
        """Test that Docker environment path is returned when running in Docker."""
        # Arrange
        with patch.dict(os.environ, {}, clear=True):
            with patch("pathlib.Path.exists", return_value=True):
                # Mock Path("/.dockerenv").exists() to return True
                # We need to be careful not to mock all Path.exists calls if possible,
                # or ensure the logic checks /.dockerenv specifically.
                # The code uses: Path("/.dockerenv").exists()

                # A safer way is to mock os.environ to set DOCKER_ENV="true"
                # which is the second condition in the check.
                with patch.dict(os.environ, {"DOCKER_ENV": "true"}):
                    # Act
                    result = _get_env_file_path()

                    # Assert
                    assert result == "/app/.env"

    def test_local_env_path_found(self):
        """Test that local .env path is returned when found."""
        # Arrange
        with patch.dict(os.environ, {}, clear=True):
            # Ensure not in Docker
            with patch("pathlib.Path.exists") as mock_exists:
                # First call is /.dockerenv -> False
                # Second call is env_file.exists() -> True
                mock_exists.side_effect = [False, True]

                # Act
                result = _get_env_file_path()

                # Assert
                # The result should be the absolute path to the .env file
                # We can't assert the exact path easily without mocking __file__,
                # but we can check it ends with .env and is not /app/.env
                assert result.endswith(".env")
                assert result != "/app/.env"

    def test_fallback_path(self):
        """Test fallback to /app/.env when no other condition matches."""
        # Arrange
        with patch.dict(os.environ, {}, clear=True):
            # Ensure not in Docker and local .env not found
            with patch("pathlib.Path.exists") as mock_exists:
                # First call is /.dockerenv -> False
                # Second call is env_file.exists() -> False
                mock_exists.side_effect = [False, False]

                # Act
                result = _get_env_file_path()

                # Assert
                assert result == "/app/.env"
