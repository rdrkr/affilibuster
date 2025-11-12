# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Email verification token repository implementation using SQLAlchemy.

Implements IEmailVerificationTokenRepository interface with PostgreSQL persistence.
"""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from affilibuster_backend.domain.entities.email_verification_token import EmailVerificationToken
from affilibuster_backend.domain.repositories.email_verification_token_repository import (
    IEmailVerificationTokenRepository,
)
from affilibuster_backend.infrastructure.database.models.email_verification_token import (
    EmailVerificationTokenModel,
)


class EmailVerificationTokenRepository(IEmailVerificationTokenRepository):
    """PostgreSQL implementation of IEmailVerificationTokenRepository."""

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize repository with SQLAlchemy session.

        Args:
            session: The async SQLAlchemy session for database operations.
        """
        self.session = session

    async def create(self, token: EmailVerificationToken) -> EmailVerificationToken:
        """Create a new email verification token in the database."""
        # Convert timezone-aware datetimes to naive
        expires_at_naive = token.expires_at.replace(tzinfo=None)
        created_at_naive = token.created_at.replace(tzinfo=None)
        used_at_naive = token.used_at.replace(tzinfo=None) if token.used_at else None

        model = EmailVerificationTokenModel(
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

    async def get_by_id(self, token_id: UUID) -> EmailVerificationToken | None:
        """Retrieve an email verification token by its unique identifier."""
        stmt = select(EmailVerificationTokenModel).where(EmailVerificationTokenModel.id == token_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_token_hash(self, token_hash: str) -> EmailVerificationToken | None:
        """Retrieve an email verification token by its token hash."""
        stmt = select(EmailVerificationTokenModel).where(EmailVerificationTokenModel.token_hash == token_hash)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_valid_token_by_user_id(self, user_id: UUID) -> EmailVerificationToken | None:
        """Retrieve the most recent valid (unused, unexpired) token for a user."""
        now_naive = datetime.now(UTC).replace(tzinfo=None)
        stmt = (
            select(EmailVerificationTokenModel)
            .where(
                EmailVerificationTokenModel.user_id == user_id,
                EmailVerificationTokenModel.used_at.is_(None),
                EmailVerificationTokenModel.expires_at > now_naive,
            )
            .order_by(EmailVerificationTokenModel.created_at.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, token: EmailVerificationToken) -> EmailVerificationToken:
        """Update an existing email verification token in the database."""
        stmt = select(EmailVerificationTokenModel).where(EmailVerificationTokenModel.id == token.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            raise ValueError(f"Email verification token with ID {token.id} does not exist")

        # Update fields (convert timezone-aware to naive)
        model.token_hash = token.token_hash
        model.expires_at = token.expires_at.replace(tzinfo=None)
        model.used_at = token.used_at.replace(tzinfo=None) if token.used_at else None

        await self.session.commit()
        await self.session.refresh(model)

        return self._to_entity(model)

    async def delete(self, token_id: UUID) -> None:
        """Delete an email verification token from the database."""
        stmt = delete(EmailVerificationTokenModel).where(EmailVerificationTokenModel.id == token_id)
        result = await self.session.execute(stmt)

        if result.rowcount == 0:  # type: ignore[attr-defined]
            raise ValueError(f"Email verification token with ID {token_id} does not exist")

        await self.session.commit()

    async def delete_all_by_user_id(self, user_id: UUID) -> None:
        """Delete all email verification tokens for a specific user."""
        stmt = delete(EmailVerificationTokenModel).where(EmailVerificationTokenModel.user_id == user_id)
        await self.session.execute(stmt)
        await self.session.commit()

    async def delete_expired_tokens(self) -> int:
        """Delete all expired tokens from the database."""
        now_naive = datetime.now(UTC).replace(tzinfo=None)
        stmt = delete(EmailVerificationTokenModel).where(EmailVerificationTokenModel.expires_at <= now_naive)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount or 0  # type: ignore[attr-defined]

    def _to_entity(self, model: EmailVerificationTokenModel) -> EmailVerificationToken:
        """
        Convert SQLAlchemy model to domain entity.

        Args:
            model: The EmailVerificationTokenModel to convert.

        Returns:
            EmailVerificationToken domain entity with timezone-aware datetimes.
        """
        # Ensure datetimes are timezone-aware
        expires_at = model.expires_at if model.expires_at.tzinfo else model.expires_at.replace(tzinfo=UTC)
        created_at = model.created_at if model.created_at.tzinfo else model.created_at.replace(tzinfo=UTC)
        used_at = None
        if model.used_at:
            used_at = model.used_at if model.used_at.tzinfo else model.used_at.replace(tzinfo=UTC)

        return EmailVerificationToken(
            id=model.id,
            user_id=model.user_id,
            token_hash=model.token_hash,
            expires_at=expires_at,
            used_at=used_at,
            created_at=created_at,
        )
