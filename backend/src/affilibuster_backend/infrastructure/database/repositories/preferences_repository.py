# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
User preferences repository implementation using SQLAlchemy.

Reference: T075 (IUserPreferencesRepository interface), T070 (UserPreferences model)
"""

from datetime import UTC, datetime

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from affilibuster_backend.domain.entities.user_preferences import UserPreferences
from affilibuster_backend.domain.repositories.preferences_repository import IUserPreferencesRepository
from affilibuster_backend.infrastructure.database.models.user_preferences import UserPreferencesModel


class UserPreferencesRepository(IUserPreferencesRepository):  # type: ignore[misc]
    """PostgreSQL implementation of IUserPreferencesRepository."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize repository with SQLAlchemy session."""
        self.session = session

    async def get_by_session(self, session_id: str) -> UserPreferences | None:
        """Get user preferences by session ID."""
        stmt = select(UserPreferencesModel).where(
            UserPreferencesModel.session_id == session_id,
            UserPreferencesModel.expires_at > datetime.now(UTC).replace(tzinfo=None),
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_user(self, user_id: str) -> UserPreferences | None:
        """Get user preferences by user ID."""
        stmt = select(UserPreferencesModel).where(
            UserPreferencesModel.user_id == user_id,
            UserPreferencesModel.expires_at > datetime.now(UTC).replace(tzinfo=None),
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def upsert(self, preferences: UserPreferences) -> UserPreferences:
        """
        Create or update user preferences.

        Uses a select-then-update/insert pattern to properly preserve IDs.
        """
        # Check if record with this session_id already exists
        stmt = select(UserPreferencesModel).where(UserPreferencesModel.session_id == preferences.session_id)
        result = await self.session.execute(stmt)
        existing_model = result.scalar_one_or_none()

        if existing_model:
            # Update existing record, preserving its ID and created_at
            existing_model.user_id = preferences.user_id
            existing_model.selected_currency = preferences.selected_currency
            existing_model.dismissed_language_prompt = preferences.dismissed_language_prompt
            existing_model.detected_language = preferences.detected_language
            existing_model.updated_at = preferences.updated_at
            existing_model.expires_at = preferences.expires_at
            await self.session.commit()
            return self._to_entity(existing_model)
        # Insert new record
        new_model = UserPreferencesModel(
            id=preferences.id,
            session_id=preferences.session_id,
            user_id=preferences.user_id,
            selected_currency=preferences.selected_currency,
            dismissed_language_prompt=preferences.dismissed_language_prompt,
            detected_language=preferences.detected_language,
            created_at=preferences.created_at,
            updated_at=preferences.updated_at,
            expires_at=preferences.expires_at,
        )
        self.session.add(new_model)
        await self.session.commit()
        return self._to_entity(new_model)

    async def delete_expired(self) -> int:
        """Delete all expired preferences."""
        stmt = delete(UserPreferencesModel).where(
            UserPreferencesModel.expires_at <= datetime.now(UTC).replace(tzinfo=None),
        )
        result = await self.session.execute(stmt)
        await self.session.flush()
        # rowcount is an attribute of CursorResult returned by execute
        return result.rowcount or 0  # type: ignore[attr-defined]

    async def delete_by_session(self, session_id: str) -> bool:
        """Delete preferences by session ID."""
        stmt = delete(UserPreferencesModel).where(UserPreferencesModel.session_id == session_id)
        result = await self.session.execute(stmt)
        await self.session.flush()
        # rowcount is an attribute of CursorResult returned by execute
        return (result.rowcount or 0) > 0  # type: ignore[attr-defined]

    def _to_entity(self, model: UserPreferencesModel) -> UserPreferences:
        """Convert SQLAlchemy model to domain entity."""
        # Ensure datetimes are timezone-aware (SQLite returns naive datetimes)
        created_at = model.created_at if model.created_at.tzinfo else model.created_at.replace(tzinfo=UTC)
        updated_at = model.updated_at if model.updated_at.tzinfo else model.updated_at.replace(tzinfo=UTC)
        expires_at = model.expires_at if model.expires_at.tzinfo else model.expires_at.replace(tzinfo=UTC)

        return UserPreferences(
            id=model.id,
            session_id=model.session_id,
            user_id=model.user_id,
            selected_currency=model.selected_currency,
            dismissed_language_prompt=model.dismissed_language_prompt,
            detected_language=model.detected_language,
            created_at=created_at,
            updated_at=updated_at,
            expires_at=expires_at,
        )
