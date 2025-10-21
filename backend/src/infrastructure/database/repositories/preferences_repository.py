# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
User preferences repository implementation using SQLAlchemy.

Reference: T075 (IUserPreferencesRepository interface), T070 (UserPreferences model)
"""

from datetime import UTC, datetime
from typing import Optional

from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from domain.entities.user_preferences import UserPreferences
from domain.repositories.preferences_repository import IUserPreferencesRepository
from infrastructure.database.models.user_preferences import UserPreferencesModel


class UserPreferencesRepository(IUserPreferencesRepository):
    """
    PostgreSQL implementation of IUserPreferencesRepository.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_session(self, session_id: str) -> Optional[UserPreferences]:
        """Get user preferences by session ID."""
        stmt = select(UserPreferencesModel).where(
            UserPreferencesModel.session_id == session_id,
            UserPreferencesModel.expires_at > datetime.now(UTC).replace(tzinfo=None),
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_user(self, user_id: str) -> Optional[UserPreferences]:
        """Get user preferences by user ID."""
        stmt = select(UserPreferencesModel).where(
            UserPreferencesModel.user_id == user_id,
            UserPreferencesModel.expires_at > datetime.now(UTC).replace(tzinfo=None),
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def upsert(self, preferences: UserPreferences) -> UserPreferences:
        """Create or update user preferences using INSERT ... ON CONFLICT."""
        stmt = insert(UserPreferencesModel).values(
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

        # On conflict, update all fields except id, session_id, and created_at
        stmt = stmt.on_conflict_do_update(
            index_elements=["session_id"],
            set_={
                "user_id": stmt.excluded.user_id,
                "selected_currency": stmt.excluded.selected_currency,
                "dismissed_language_prompt": stmt.excluded.dismissed_language_prompt,
                "detected_language": stmt.excluded.detected_language,
                "updated_at": stmt.excluded.updated_at,
                "expires_at": stmt.excluded.expires_at,
            },
        )

        await self.session.execute(stmt)
        await self.session.flush()

        # Fetch and return the saved preferences
        return await self.get_by_session(preferences.session_id)

    async def delete_expired(self) -> int:
        """Delete all expired preferences."""
        stmt = delete(UserPreferencesModel).where(
            UserPreferencesModel.expires_at <= datetime.now(UTC).replace(tzinfo=None)
        )
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.rowcount

    async def delete_by_session(self, session_id: str) -> bool:
        """Delete preferences by session ID."""
        stmt = delete(UserPreferencesModel).where(UserPreferencesModel.session_id == session_id)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.rowcount > 0

    def _to_entity(self, model: UserPreferencesModel) -> UserPreferences:
        """Convert SQLAlchemy model to domain entity."""
        return UserPreferences(
            id=model.id,
            session_id=model.session_id,
            user_id=model.user_id,
            selected_currency=model.selected_currency,
            dismissed_language_prompt=model.dismissed_language_prompt,
            detected_language=model.detected_language,
            created_at=model.created_at,
            updated_at=model.updated_at,
            expires_at=model.expires_at,
        )
