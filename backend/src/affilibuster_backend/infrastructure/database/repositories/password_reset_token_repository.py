# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Password reset token repository implementation using SQLAlchemy.

Implements IPasswordResetTokenRepository interface with PostgreSQL persistence.
"""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from affilibuster_backend.domain.entities.password_reset_token import PasswordResetToken
from affilibuster_backend.domain.repositories.password_reset_token_repository import (
    IPasswordResetTokenRepository,
)
from affilibuster_backend.infrastructure.database.models.password_reset_token import (
    PasswordResetTokenModel,
)


class PasswordResetTokenRepository(IPasswordResetTokenRepository):
    """PostgreSQL implementation of IPasswordResetTokenRepository."""

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize repository with SQLAlchemy session.

        Args:
            session: The async SQLAlchemy session for database operations.
        """
        self.session = session

    async def create(self, token: PasswordResetToken) -> PasswordResetToken:
        """Create a new password reset token in the database."""
        # Convert timezone-aware datetimes to naive
        expires_at_naive = token.expires_at.replace(tzinfo=None)
        created_at_naive = token.created_at.replace(tzinfo=None)
        used_at_naive = token.used_at.replace(tzinfo=None) if token.used_at else None

        model = PasswordResetTokenModel(
            id=token.id,
            user_id=token.user_id,
            token_hash=token.token_hash,
            expires_at=expires_at_naive,
            used_at=used_at_naive,
            created_at=created_at_naive,
        )

        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)

        return self._to_entity(model)

    async def get_by_id(self, token_id: UUID) -> PasswordResetToken | None:
        """Retrieve a password reset token by its unique identifier."""
        stmt = select(PasswordResetTokenModel).where(PasswordResetTokenModel.id == token_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_token_hash(self, token_hash: str) -> PasswordResetToken | None:
        """Retrieve a password reset token by its token hash."""
        stmt = select(PasswordResetTokenModel).where(PasswordResetTokenModel.token_hash == token_hash)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_valid_token_by_user_id(self, user_id: UUID) -> PasswordResetToken | None:
        """Retrieve the most recent valid (unused, unexpired) token for a user."""
        now_naive = datetime.now(UTC).replace(tzinfo=None)
        stmt = (
            select(PasswordResetTokenModel)
            .where(
                PasswordResetTokenModel.user_id == user_id,
                PasswordResetTokenModel.used_at.is_(None),
                PasswordResetTokenModel.expires_at > now_naive,
            )
            .order_by(PasswordResetTokenModel.created_at.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, token: PasswordResetToken) -> PasswordResetToken:
        """Update an existing password reset token in the database."""
        stmt = select(PasswordResetTokenModel).where(PasswordResetTokenModel.id == token.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            raise ValueError(f"Password reset token with ID {token.id} does not exist")

        # Update fields (convert timezone-aware to naive)
        model.token_hash = token.token_hash
        model.expires_at = token.expires_at.replace(tzinfo=None)
        model.used_at = token.used_at.replace(tzinfo=None) if token.used_at else None

        await self.session.commit()
        await self.session.refresh(model)

        return self._to_entity(model)

    async def delete(self, token_id: UUID) -> None:
        """Delete a password reset token from the database."""
        stmt = delete(PasswordResetTokenModel).where(PasswordResetTokenModel.id == token_id)
        result = await self.session.execute(stmt)

        if result.rowcount == 0:  # type: ignore[attr-defined]
            raise ValueError(f"Password reset token with ID {token_id} does not exist")

        await self.session.commit()

    async def delete_all_by_user_id(self, user_id: UUID) -> None:
        """Delete all password reset tokens for a specific user."""
        stmt = delete(PasswordResetTokenModel).where(PasswordResetTokenModel.user_id == user_id)
        await self.session.execute(stmt)
        await self.session.commit()

    async def delete_expired_tokens(self) -> int:
        """Delete all expired tokens from the database."""
        now_naive = datetime.now(UTC).replace(tzinfo=None)
        stmt = delete(PasswordResetTokenModel).where(PasswordResetTokenModel.expires_at <= now_naive)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount or 0  # type: ignore[attr-defined]

    def _to_entity(self, model: PasswordResetTokenModel) -> PasswordResetToken:
        """
        Convert SQLAlchemy model to domain entity.

        Args:
            model: The PasswordResetTokenModel to convert.

        Returns:
            PasswordResetToken domain entity with timezone-aware datetimes.
        """
        # Ensure datetimes are timezone-aware
        expires_at = model.expires_at if model.expires_at.tzinfo else model.expires_at.replace(tzinfo=UTC)
        created_at = model.created_at if model.created_at.tzinfo else model.created_at.replace(tzinfo=UTC)
        used_at = None
        if model.used_at:
            used_at = model.used_at if model.used_at.tzinfo else model.used_at.replace(tzinfo=UTC)

        return PasswordResetToken(
            id=model.id,
            user_id=model.user_id,
            token_hash=model.token_hash,
            expires_at=expires_at,
            used_at=used_at,
            created_at=created_at,
        )
