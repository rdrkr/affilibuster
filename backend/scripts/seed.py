#!/usr/bin/env python
# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Backend database seeder.

Seeds PostgreSQL database with URL redirects from data/backend-seed.jsonl.
Uses JSONL format (one JSON object per line) for efficient line-by-line parsing.

Usage:
    uv run task seed

Reference: data/backend-seed.jsonl (URL redirects only)
"""

import asyncio
import logging
from pathlib import Path

from pydantic import ValidationError

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
    Get the seed data file path for backend redirects.

    Returns:
        Path to data/backend-seed.jsonl

    """
    # In Docker: /data/backend-seed.jsonl
    docker_path = Path("/data/backend-seed.jsonl")
    if docker_path.exists():
        return docker_path

    # Local development: ../data/backend-seed.jsonl from backend/scripts/
    local_path = Path(__file__).parent.parent.parent / "data" / "backend-seed.jsonl"
    if local_path.exists():
        return local_path

    msg = f"Seed data not found at {docker_path} or {local_path}"
    raise FileNotFoundError(msg)


def load_seed_data() -> list[URLRedirect]:
    """
    Load seed data from JSONL file.

    Returns:
        List of URLRedirect domain entities validated with Pydantic

    """
    seed_path = get_seed_data_path()
    logger.info("  Loading seed data from %s", seed_path)

    records: list[URLRedirect] = []
    with seed_path.open(encoding="utf-8") as f:
        for line in f:
            # Skip empty lines and comments
            stripped_line = line.strip()
            if not stripped_line or stripped_line.startswith("#"):
                continue
            try:
                # Deserialize JSON to Pydantic model for type safety and validation
                redirect = URLRedirect.model_validate_json(stripped_line)
                records.append(redirect)
            except (ValueError, ValidationError) as e:
                logger.warning("  Skipping invalid redirect: %s (error: %s)", stripped_line[:50], e)
                continue

    logger.info("  Loaded %d redirects", len(records))
    return records


async def seed_redirects(redirects: list[URLRedirect]) -> int:
    """
    Seed URL redirects into PostgreSQL.

    Args:
        redirects: List of URLRedirect domain entities (already validated via Pydantic)

    Returns:
        Number of redirects seeded

    """
    if not redirects:
        logger.info("  No redirects to seed")
        return 0

    count = 0
    async with get_db_session() as session:
        repo = URLRedirectRepository(session)

        for redirect in redirects:
            # Check if already exists
            existing = await repo.get_by_path(redirect.from_path)
            if existing:
                logger.info("    Redirect already exists: %s", redirect.from_path)
                continue

            # Create redirect (already a domain entity, no conversion needed)
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

    # Load seed data (JSONL format) - returns validated Pydantic models
    redirects = load_seed_data()

    # Ensure tables exist
    logger.info("  Ensuring database tables exist...")
    await ensure_tables_exist()

    # Seed redirects
    logger.info("  Seeding URL redirects...")
    redirect_count = await seed_redirects(redirects)

    # Summary
    logger.info("=" * 40)
    logger.info("Seeding complete!")
    logger.info("   redirects: %s", redirect_count)


if __name__ == "__main__":
    asyncio.run(main())
