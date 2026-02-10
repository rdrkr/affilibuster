# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""
Data retention cleanup use case.

Handles hard-deletion of soft-deleted users past the retention period
and purging of expired sessions, in compliance with GDPR Art. 5(1)(e)
data minimization principle.
"""

from datetime import UTC, datetime, timedelta

from affilibuster_backend.domain.entities.retention import RetentionResult
from affilibuster_backend.domain.repositories.session_repository import ISessionRepository
from affilibuster_backend.domain.repositories.user_repository import IUserRepository


class DataRetentionUseCase:
    """
    Use case for cleaning up data past retention period.

    Hard-deletes soft-deleted users whose deletion date is past the
    configured retention period, and purges all expired sessions.
    """

    def __init__(
        self,
        user_repo: IUserRepository,
        session_repo: ISessionRepository,
    ) -> None:
        """
        Initialize use case.

        Args:
            user_repo: User repository for data access.
            session_repo: Session repository for purging expired sessions.
        """
        self.user_repo = user_repo
        self.session_repo = session_repo

    async def execute(
        self,
        user_retention_days: int,
        session_retention_days: int,
    ) -> RetentionResult:
        """
        Execute the data retention cleanup.

        Args:
            user_retention_days: Days after soft-deletion before hard-deleting users.
            session_retention_days: Days after expiry before purging sessions.
                Use 0 to purge all expired sessions regardless of age.

        Returns:
            RetentionResult with counts of deleted users and purged sessions.
        """
        # Calculate cutoff for soft-deleted users
        user_cutoff = datetime.now(UTC) - timedelta(days=user_retention_days)

        # Get soft-deleted user IDs past the retention period
        user_ids = await self.user_repo.get_soft_deleted_before(user_cutoff)

        # Hard-delete each user
        for user_id in user_ids:
            await self.user_repo.delete(user_id)

        # Purge expired sessions (session_retention_days reserved for future
        # use — currently all expired sessions are purged immediately)
        _ = session_retention_days
        sessions_purged = await self.session_repo.delete_expired_sessions()

        return RetentionResult(
            users_deleted=len(user_ids),
            sessions_purged=sessions_purged,
        )
