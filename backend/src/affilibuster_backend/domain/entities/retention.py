# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""
Data retention result entity.

Contains the result of a data retention cleanup operation,
reporting how many users were hard-deleted and sessions purged.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class RetentionResult:
    """
    Result of a data retention cleanup operation.

    Attributes:
        users_deleted: Number of soft-deleted users that were hard-deleted.
        sessions_purged: Number of expired sessions that were purged.
    """

    users_deleted: int
    sessions_purged: int
