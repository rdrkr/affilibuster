# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for Content entity.

Reference: data-model.md:589-597
"""

from sqlalchemy import Column, String, CheckConstraint, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from . import Base


class ContentModel(Base):
    """
    SQLAlchemy model for content table.

    Maps to domain entity: domain.entities.content.Content
    """

    __tablename__ = 'content'

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Content Type and Status
    type = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default='draft', server_default='draft')

    # Audit Fields
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default='NOW()')
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow, server_default='NOW()')
    created_by = Column(String(100), nullable=False)
    updated_by = Column(String(100), nullable=False)

    # Constraints
    __table_args__ = (
        CheckConstraint("type IN ('page', 'product', 'article')", name='content_type_check'),
        CheckConstraint("status IN ('draft', 'published', 'archived')", name='content_status_check'),
    )

    # Relationships
    versions = relationship(
        "ContentVersionModel",
        back_populates="content",
        cascade="all, delete-orphan",
        foreign_keys="ContentVersionModel.content_id"
    )

    def __repr__(self):
        return f"<ContentModel(id='{self.id}', type='{self.type}', status='{self.status}')>"
