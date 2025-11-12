#!/usr/bin/env python3
# Copyright (c) 2025 Affilibuster by Ronen Druker.
# ruff: noqa: T201 - Print statements are appropriate for CLI scripts

"""
Create all database tables directly from SQLAlchemy models.

This script creates tables using Base.metadata.create_all() instead of migrations.
Useful for development when migrations are being set up or when starting fresh.
"""

from sqlalchemy import create_engine

from affilibuster_backend.config import settings
from affilibuster_backend.infrastructure.database.models import Base


def create_tables() -> None:
    """Create all database tables from SQLAlchemy models."""
    print("Creating database tables...")
    print(f"Database URL: {settings.database_url}")

    # Create synchronous engine for DDL operations
    engine = create_engine(settings.database_url)

    # Create all tables
    Base.metadata.create_all(engine)

    print("✅ All tables created successfully!")
    print("\nCreated tables:")
    for table in Base.metadata.sorted_tables:
        print(f"  - {table.name}")


if __name__ == "__main__":
    create_tables()
