# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for ContentVersion entity.

Reference: data-model.md:600-619
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from . import Base


class ContentVersionModel(Base):
    """
    SQLAlchemy model for content_versions table.

    Maps to domain entity: domain.entities.content_version.ContentVersion
    """

    __tablename__ = 'content_versions'

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Keys
    content_id = Column(UUID(as_uuid=True), ForeignKey('content.id', ondelete='CASCADE'), nullable=False)
    language_code = Column(String(2), ForeignKey('languages.code'), nullable=False)

    # Content Fields
    title = Column(String(500), nullable=False)
    slug = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)

    # SEO Fields
    meta_title = Column(String(500), nullable=True)
    meta_description = Column(String(1000), nullable=True)
    meta_keywords = Column(ARRAY(Text), nullable=True)

    # Custom Schema (JSONB)
    custom_schema = Column(JSONB, nullable=True)

    # Publishing
    is_published = Column(Boolean, nullable=False, default=False, server_default='false')
    published_at = Column(DateTime, nullable=True)

    # Translations (JSONB mapping language codes to content version IDs)
    translations = Column(JSONB, nullable=True)

    # Audit Fields
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default='NOW()')
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow, server_default='NOW()')

    # Constraints
    __table_args__ = (
        UniqueConstraint('content_id', 'language_code', name='uq_content_language'),
        UniqueConstraint('content_id', 'language_code', 'slug', name='uq_content_language_slug'),
    )

    # Relationships
    content = relationship(
        "ContentModel",
        back_populates="versions",
        foreign_keys=[content_id]
    )

    language = relationship(
        "LanguageModel",
        back_populates="content_versions",
        foreign_keys=[language_code]
    )

    url_routes = relationship(
        "URLRouteModel",
        back_populates="content_version",
        cascade="all, delete-orphan",
        foreign_keys="URLRouteModel.content_version_id"
    )

    def __repr__(self):
        return f"<ContentVersionModel(id='{self.id}', title='{self.title}', language='{self.language_code}')>"
