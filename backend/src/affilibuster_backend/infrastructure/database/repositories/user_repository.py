# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
UserEntity repository implementation using SQLAlchemy.

Implements IUserRepository interface with PostgreSQL persistence.
"""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from affilibuster_backend.domain.entities.user import Email, HashedPassword, UserEntity
from affilibuster_backend.domain.repositories.user_repository import IUserRepository
from affilibuster_backend.infrastructure.database.models.user import UserModel


class UserRepository(IUserRepository):
    """PostgreSQL implementation of IUserRepository."""

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize repository with SQLAlchemy session.

        Args:
            session: The async SQLAlchemy session for database operations.
        """
        self.session = session

    async def create(self, user: UserEntity) -> UserEntity:
        """Create a new user in the database."""
        # Check if user with email already exists
        if await self.exists_by_email(user.email):
            raise ValueError(f"UserEntity with email {user.email.value} already exists")

        # Convert timezone-aware datetimes to naive
        created_at_naive = user.created_at.replace(tzinfo=None)
        updated_at_naive = user.updated_at.replace(tzinfo=None)
        last_login_at_naive = user.last_login_at.replace(tzinfo=None) if user.last_login_at else None
        deleted_at_naive = user.deleted_at.replace(tzinfo=None) if user.deleted_at else None

        model = UserModel(
            id=user.id,
            email=user.email.value,
            hashed_password=user.hashed_password.value,
            display_name=user.display_name,
            email_verified=user.email_verified,
            status=user.status,
            created_at=created_at_naive,
            updated_at=updated_at_naive,
            last_login_at=last_login_at_naive,
            deleted_at=deleted_at_naive,
        )

        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)

        return self._to_entity(model)

    async def get_by_id(self, user_id: UUID) -> UserEntity | None:
        """Retrieve a user by their unique identifier."""
        stmt = select(UserModel).where(UserModel.id == user_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_email(self, email: Email) -> UserEntity | None:
        """Retrieve a user by their email address."""
        stmt = select(UserModel).where(UserModel.email == email.value)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, user: UserEntity) -> UserEntity:
        """Update an existing user in the database."""
        stmt = select(UserModel).where(UserModel.id == user.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            raise ValueError(f"UserEntity with ID {user.id} does not exist")

        # Update fields (convert timezone-aware to naive)
        model.email = user.email.value
        model.hashed_password = user.hashed_password.value
        model.display_name = user.display_name
        model.email_verified = user.email_verified
        model.status = user.status
        model.updated_at = user.updated_at.replace(tzinfo=None)
        model.last_login_at = user.last_login_at.replace(tzinfo=None) if user.last_login_at else None
        model.deleted_at = user.deleted_at.replace(tzinfo=None) if user.deleted_at else None

        await self.session.commit()
        await self.session.refresh(model)

        return self._to_entity(model)

    async def delete(self, user_id: UUID) -> None:
        """Delete a user from the database (hard delete)."""
        stmt = delete(UserModel).where(UserModel.id == user_id)
        result = await self.session.execute(stmt)

        if result.rowcount == 0:  # type: ignore[attr-defined]
            raise ValueError(f"UserEntity with ID {user_id} does not exist")

        await self.session.commit()

    async def get_soft_deleted_before(self, cutoff: datetime) -> list[UUID]:
        """Get IDs of soft-deleted users whose deletion date is before the cutoff."""
        cutoff_naive = cutoff.replace(tzinfo=None)
        stmt = select(UserModel.id).where(
            UserModel.deleted_at.isnot(None),
            UserModel.deleted_at < cutoff_naive,
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def exists_by_email(self, email: Email) -> bool:
        """Check if a user with the given email exists."""
        stmt = select(UserModel.id).where(UserModel.email == email.value)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    def _to_entity(self, model: UserModel) -> UserEntity:
        """
        Convert SQLAlchemy model to domain entity.

        Args:
            model: The UserModel to convert.

        Returns:
            UserEntity domain entity with timezone-aware datetimes.
        """
        # Ensure datetimes are timezone-aware
        created_at = model.created_at if model.created_at.tzinfo else model.created_at.replace(tzinfo=UTC)
        updated_at = model.updated_at if model.updated_at.tzinfo else model.updated_at.replace(tzinfo=UTC)
        last_login_at = None
        if model.last_login_at:
            last_login_at = (
                model.last_login_at if model.last_login_at.tzinfo else model.last_login_at.replace(tzinfo=UTC)
            )
        deleted_at = None
        if model.deleted_at:
            deleted_at = model.deleted_at if model.deleted_at.tzinfo else model.deleted_at.replace(tzinfo=UTC)

        return UserEntity(
            id=model.id,
            email=Email(model.email),
            hashed_password=HashedPassword(model.hashed_password),
            display_name=model.display_name,
            email_verified=model.email_verified,
            status=model.status,
            created_at=created_at,
            updated_at=updated_at,
            last_login_at=last_login_at,
            deleted_at=deleted_at,
        )
