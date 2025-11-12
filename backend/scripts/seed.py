#!/usr/bin/env python
# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Backend database seeder.

Seeds PostgreSQL database with data from data/seed-data.json.
This is the backend equivalent of cms/scripts/seed.ts for Strapi.

Usage:
    uv run task seed

Reference: data/seed-data.json (single source of truth)
"""

import asyncio
import json
import logging
import sys
from pathlib import Path
from typing import Any

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from affilibuster_backend.domain.entities.url_redirect import URLRedirect
from affilibuster_backend.infrastructure.database.config import get_db_session, get_engine
from affilibuster_backend.infrastructure.database.models import Base
from affilibuster_backend.infrastructure.database.repositories.url_redirect_repository import (
    URLRedirectRepository,
)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


def get_seed_data_path() -> Path:
    """
    Get the seed data file path.

    Returns:
        Path to data/seed-data.json

    """
    # In Docker: /data/seed-data.json
    docker_path = Path("/data/seed-data.json")
    if docker_path.exists():
        return docker_path

    # Local development: ../data/seed-data.json from backend/scripts/
    local_path = Path(__file__).parent.parent.parent / "data" / "seed-data.json"
    if local_path.exists():
        return local_path

    raise FileNotFoundError(f"Seed data not found at {docker_path} or {local_path}")


def load_seed_data() -> dict[str, Any]:
    """Load seed data from JSON file."""
    seed_path = get_seed_data_path()
    logger.info("  Loading seed data from %s", seed_path)

    with seed_path.open(encoding="utf-8") as f:
        data: dict[str, Any] = json.load(f)
        return data


async def seed_redirects(seed_data: dict[str, Any]) -> int:
    """
    Seed URL redirects into PostgreSQL.

    Args:
        seed_data: The loaded seed data dictionary

    Returns:
        Number of redirects seeded

    """
    redirects_data = seed_data.get("collections", {}).get("redirects", [])

    if not redirects_data:
        logger.info("  No redirects to seed")
        return 0

    count = 0
    async with get_db_session() as session:
        repo = URLRedirectRepository(session)

        for redirect_data in redirects_data:
            # Convert to domain entity
            redirect = URLRedirect(
                id=redirect_data.get("id"),
                from_path=redirect_data["from_path"],
                to_path=redirect_data.get("to_path"),
                status_code=redirect_data["status_code"],
                reason=redirect_data.get("reason"),
                created_by=redirect_data.get("created_by"),
                created_at=redirect_data.get("created_at"),
            )

            # Check if already exists
            existing = await repo.get_by_path(redirect.from_path)
            if existing:
                logger.info("    Redirect already exists: %s", redirect.from_path)
                continue

            # Create redirect
            await repo.create(redirect)
            target = redirect.to_path or "410 Gone"
            logger.info("    Created redirect: %s -> %s", redirect.from_path, target)
            count += 1

    return count


async def ensure_tables_exist() -> None:
    """Ensure all database tables exist."""
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def main() -> None:
    """Main seed function."""
    logger.info("Backend database seeder")
    logger.info("=" * 40)

    # Load seed data
    seed_data = load_seed_data()

    # Ensure tables exist
    logger.info("  Ensuring database tables exist...")
    await ensure_tables_exist()

    # Seed redirects
    logger.info("  Seeding URL redirects...")
    redirect_count = await seed_redirects(seed_data)

    # Summary
    logger.info("=" * 40)
    logger.info("Seeding complete!")
    logger.info("   redirects: %s", redirect_count)


if __name__ == "__main__":
    asyncio.run(main())
