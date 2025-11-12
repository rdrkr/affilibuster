# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Authentication dependencies for FastAPI.

Provides dependency injection for authentication middleware.
"""

from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from affilibuster_backend.domain.entities.user import UserEntity
from affilibuster_backend.domain.repositories.session_repository import ISessionRepository
from affilibuster_backend.domain.repositories.user_repository import IUserRepository
from affilibuster_backend.domain.services.password_hasher import PasswordHasher
from affilibuster_backend.domain.services.token_generator import TokenGenerator
from affilibuster_backend.infrastructure.database.config import get_db
from affilibuster_backend.infrastructure.database.repositories.session_repository import SessionRepository
from affilibuster_backend.infrastructure.database.repositories.user_repository import UserRepository


def get_user_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> IUserRepository:
    """Provide user repository instance."""
    return UserRepository(db)


def get_session_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> ISessionRepository:
    """Provide session repository instance."""
    return SessionRepository(db)


def get_token_generator() -> TokenGenerator:
    """Provide token generator instance."""
    return TokenGenerator()


def get_password_hasher() -> PasswordHasher:
    """Provide password hasher instance."""
    return PasswordHasher()


async def get_current_user(
    request: Request,
    access_token: Annotated[str | None, Cookie()] = None,
    user_repo: Annotated[IUserRepository | None, Depends(get_user_repo)] = None,
    session_repo: Annotated[ISessionRepository | None, Depends(get_session_repo)] = None,
    token_generator: Annotated[TokenGenerator | None, Depends(get_token_generator)] = None,
) -> UserEntity:
    """
    Extract and validate JWT token from cookie or Authorization header.

    Verifies the token and fetches the authenticated user.

    Args:
        request: FastAPI request object
        access_token: Access token from cookie (optional)
        user_repo: UserEntity repository dependency
        session_repo: Session repository dependency
        token_generator: Token generator dependency

    Returns:
        Authenticated UserEntity entity

    Raises:
        HTTPException: 401 if token is missing, invalid, or user not found
    """
    # Try to get token from cookie first, then Authorization header
    token = access_token

    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]  # Remove "Bearer " prefix

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate dependencies
    if token_generator is None or session_repo is None or user_repo is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Service unavailable",
        )

    # Hash the token to find the session
    token_hash = token_generator.hash_token(token)

    # Get session by token hash
    session = await session_repo.get_by_token_hash(token_hash)

    if not session or session.is_expired():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user by session user_id
    user = await user_repo.get_by_id(session.user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is locked or deleted",
        )

    return user


async def get_current_verified_user(
    current_user: Annotated[UserEntity, Depends(get_current_user)],
) -> UserEntity:
    """
    Require that the current user has verified their email.

    Args:
        current_user: The authenticated user from get_current_user

    Returns:
        The authenticated and verified UserEntity

    Raises:
        HTTPException: 403 if email is not verified
    """
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required",
        )

    return current_user


# Type aliases for use in route signatures
CurrentUser = Annotated[UserEntity, Depends(get_current_user)]
CurrentVerifiedUser = Annotated[UserEntity, Depends(get_current_verified_user)]
UserRepoDep = Annotated[IUserRepository, Depends(get_user_repo)]
SessionRepoDep = Annotated[ISessionRepository, Depends(get_session_repo)]
TokenGeneratorDep = Annotated[TokenGenerator, Depends(get_token_generator)]
PasswordHasherDep = Annotated[PasswordHasher, Depends(get_password_hasher)]
