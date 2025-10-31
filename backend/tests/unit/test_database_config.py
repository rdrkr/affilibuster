# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""Unit tests for database configuration."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from infrastructure.database import config


class TestGetEngine:
    """Tests for get_engine function."""

    def setup_method(self):
        """Reset global engine before each test."""
        config._async_engine = None

    def test_get_engine_creates_engine_on_first_call(self):
        """Test that get_engine creates a new engine on first call."""
        with patch("infrastructure.database.config.settings") as mock_settings:
            mock_settings.database_url = "postgresql://user:pass@localhost/db"

            with patch("infrastructure.database.config.create_async_engine") as mock_create_engine:
                mock_engine = MagicMock()
                mock_create_engine.return_value = mock_engine

                engine = config.get_engine()

                assert engine == mock_engine
                mock_create_engine.assert_called_once_with(
                    "postgresql+asyncpg://user:pass@localhost/db",
                    echo=False,
                    pool_pre_ping=True,
                )

    def test_get_engine_returns_cached_engine_on_subsequent_calls(self):
        """Test that get_engine returns cached engine on subsequent calls."""
        with patch("infrastructure.database.config.settings") as mock_settings:
            mock_settings.database_url = "postgresql://user:pass@localhost/db"

            with patch("infrastructure.database.config.create_async_engine") as mock_create_engine:
                mock_engine = MagicMock()
                mock_create_engine.return_value = mock_engine

                engine1 = config.get_engine()
                engine2 = config.get_engine()

                assert engine1 == engine2
                # create_async_engine should only be called once
                mock_create_engine.assert_called_once()

    def test_get_engine_with_sql_echo_enabled(self):
        """Test that get_engine respects SQL_ECHO environment variable."""
        with patch("infrastructure.database.config.settings") as mock_settings:
            mock_settings.database_url = "postgresql://user:pass@localhost/db"

            with patch("infrastructure.database.config.os.getenv", return_value="true"):
                with patch("infrastructure.database.config.create_async_engine") as mock_create_engine:
                    mock_engine = MagicMock()
                    mock_create_engine.return_value = mock_engine

                    _engine = config.get_engine()

                    mock_create_engine.assert_called_once_with(
                        "postgresql+asyncpg://user:pass@localhost/db",
                        echo=True,  # SQL_ECHO is enabled
                        pool_pre_ping=True,
                    )


class TestGetSessionFactory:
    """Tests for get_session_factory function."""

    def setup_method(self):
        """Reset global session factory before each test."""
        config._async_session_local = None
        config._async_engine = None

    def test_get_session_factory_creates_factory_on_first_call(self):
        """Test that get_session_factory creates a new factory on first call."""
        with patch("infrastructure.database.config.settings") as mock_settings:
            mock_settings.database_url = "postgresql://user:pass@localhost/db"

            with patch("infrastructure.database.config.create_async_engine") as mock_create_engine:
                mock_engine = MagicMock()
                mock_create_engine.return_value = mock_engine

                with patch("infrastructure.database.config.async_sessionmaker") as mock_sessionmaker:
                    mock_factory = MagicMock()
                    mock_sessionmaker.return_value = mock_factory

                    factory = config.get_session_factory()

                    assert factory == mock_factory
                    mock_sessionmaker.assert_called_once()
                    # Verify async_sessionmaker was called with correct arguments
                    call_kwargs = mock_sessionmaker.call_args[1]
                    assert call_kwargs["expire_on_commit"] is False

    def test_get_session_factory_returns_cached_factory_on_subsequent_calls(self):
        """Test that get_session_factory returns cached factory."""
        with patch("infrastructure.database.config.settings") as mock_settings:
            mock_settings.database_url = "postgresql://user:pass@localhost/db"

            with patch("infrastructure.database.config.create_async_engine") as mock_create_engine:
                mock_engine = MagicMock()
                mock_create_engine.return_value = mock_engine

                with patch("infrastructure.database.config.async_sessionmaker") as mock_sessionmaker:
                    mock_factory = MagicMock()
                    mock_sessionmaker.return_value = mock_factory

                    factory1 = config.get_session_factory()
                    factory2 = config.get_session_factory()

                    assert factory1 == factory2
                    # async_sessionmaker should only be called once
                    mock_sessionmaker.assert_called_once()


class TestGetDbSession:
    """Tests for get_db_session context manager."""

    def setup_method(self):
        """Reset global state before each test."""
        config._async_session_local = None
        config._async_engine = None

    @pytest.mark.asyncio
    async def test_get_db_session_yields_session_and_commits(self):
        """Test that get_db_session yields session and commits on success."""
        mock_session = AsyncMock()
        mock_session.commit = AsyncMock()
        mock_session.close = AsyncMock()

        mock_factory = MagicMock()
        mock_factory.return_value.__aenter__.return_value = mock_session
        mock_factory.return_value.__aexit__.return_value = None

        with patch(
            "infrastructure.database.config.get_session_factory",
            return_value=mock_factory,
        ):
            async with config.get_db_session() as session:
                assert session == mock_session
                # Inside the context, commit should not have been called yet
                mock_session.commit.assert_not_called()

            # After exiting context, commit and close should have been called
            mock_session.commit.assert_called_once()
            mock_session.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_db_session_rolls_back_on_exception(self):
        """Test that get_db_session rolls back transaction on exception."""
        mock_session = AsyncMock()
        mock_session.rollback = AsyncMock()
        mock_session.close = AsyncMock()

        mock_factory = MagicMock()
        mock_factory.return_value.__aenter__.return_value = mock_session
        mock_factory.return_value.__aexit__.return_value = None

        with patch(
            "infrastructure.database.config.get_session_factory",
            return_value=mock_factory,
        ):
            with pytest.raises(ValueError):
                async with config.get_db_session() as _session:
                    # Simulate an error during database operation
                    raise ValueError("Test error")

            # After exception, rollback and close should have been called
            mock_session.rollback.assert_called_once()
            mock_session.close.assert_called_once()
            # Commit should NOT have been called
            mock_session.commit.assert_not_called()


class TestGetDb:
    """Tests for get_db FastAPI dependency."""

    def setup_method(self):
        """Reset global state before each test."""
        config._async_session_local = None
        config._async_engine = None

    @pytest.mark.asyncio
    async def test_get_db_yields_session(self):
        """Test that get_db yields a database session."""
        mock_session = AsyncMock()
        mock_session.commit = AsyncMock()
        mock_session.close = AsyncMock()

        mock_factory = MagicMock()
        mock_factory.return_value.__aenter__.return_value = mock_session
        mock_factory.return_value.__aexit__.return_value = None

        with patch(
            "infrastructure.database.config.get_session_factory",
            return_value=mock_factory,
        ):
            # Use get_db as an async generator - need to properly consume it
            gen = config.get_db()
            session = await gen.__anext__()
            assert session == mock_session

            # Properly close the generator to trigger cleanup
            try:
                await gen.__anext__()
            except StopAsyncIteration:
                pass  # Expected - generator only yields once

            # After using the session, commit and close should have been called
            mock_session.commit.assert_called_once()
            mock_session.close.assert_called_once()
