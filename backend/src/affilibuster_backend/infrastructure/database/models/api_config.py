# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for ApiConfig entity.

Stores shared configuration values that need to be accessed by multiple services.
Primary use case: Strapi API token storage for backend service authentication.
"""

from datetime import UTC, datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from affilibuster_backend.infrastructure.database.models import Base


class ApiConfigModel(Base):
    """
    SQLAlchemy model for api_config table.

    Stores key-value configuration data shared between services.
    Currently used for storing the Strapi API token that is auto-generated
    by CMS during bootstrap and consumed by the backend service.
    """

    __tablename__ = "api_config"

    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Configuration Key (unique index)
    key: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)

    # Configuration Value (text for flexibility)
    value: Mapped[str] = mapped_column(Text, nullable=False)

    # Optional Description
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Audit Fields
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    def __repr__(self) -> str:
        """String representation of ApiConfig."""
        return f"<ApiConfig(key='{self.key}', description='{self.description}')>"
