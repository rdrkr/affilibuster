# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""
Data retention cleanup script.

Standalone async script that hard-deletes soft-deleted users past the
retention period and purges expired sessions. Intended to be run as
a scheduled task (e.g., via cron or Taskipy).

Usage:
    uv run task cleanup
"""

import asyncio
import logging

from affilibuster_backend.config import settings
from affilibuster_backend.domain.use_cases.retention.data_retention_use_case import DataRetentionUseCase
from affilibuster_backend.infrastructure.database.config import get_db_session
from affilibuster_backend.infrastructure.database.repositories.session_repository import SessionRepository
from affilibuster_backend.infrastructure.database.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)


async def run_cleanup() -> None:
    """
    Execute data retention cleanup.

    Reads retention settings, instantiates repositories and use case,
    runs the cleanup, and logs the results.
    """
    async with get_db_session() as session:
        user_repo = UserRepository(session)
        session_repo = SessionRepository(session)
        use_case = DataRetentionUseCase(user_repo, session_repo)

        result = await use_case.execute(
            user_retention_days=settings.user_retention_days,
            session_retention_days=settings.session_retention_days,
        )

        logger.info(
            "Data retention cleanup complete: %d users hard-deleted, %d sessions purged",
            result.users_deleted,
            result.sessions_purged,
        )


def main() -> None:
    """Entry point for the cleanup script."""
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    asyncio.run(run_cleanup())


if __name__ == "__main__":
    main()
