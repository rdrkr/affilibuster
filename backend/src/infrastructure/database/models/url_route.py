# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy models for URLRoute and URLRedirect entities.

Reference: data-model.md:622-650
"""

from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from . import Base


class URLRouteModel(Base):
    """
    SQLAlchemy model for url_routes table.

    Maps to domain entity: domain.entities.url_route.URLRoute
    """

    __tablename__ = 'url_routes'

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Keys
    content_version_id = Column(UUID(as_uuid=True), ForeignKey('content_versions.id', ondelete='CASCADE'), nullable=False)
    language_code = Column(String(2), ForeignKey('languages.code'), nullable=False)

    # URL Fields
    path = Column(String(500), nullable=False, unique=True)
    slug = Column(String(200), nullable=False)

    # Status
    is_active = Column(Boolean, nullable=False, default=True, server_default='true')
    is_primary = Column(Boolean, nullable=False, default=False, server_default='false')

    # SEO
    canonical_url = Column(String(500), nullable=False)
    alternate_urls = Column(JSONB, nullable=True)  # {"it": "url", "he": "url"}

    # Audit Fields
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default='NOW()')
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow, server_default='NOW()')

    # Relationships
    content_version = relationship(
        "ContentVersionModel",
        back_populates="url_routes",
        foreign_keys=[content_version_id]
    )

    language = relationship(
        "LanguageModel",
        back_populates="url_routes",
        foreign_keys=[language_code]
    )

    redirects = relationship(
        "URLRedirectModel",
        back_populates="target_url",
        foreign_keys="URLRedirectModel.to_primary_url_id"
    )

    def __repr__(self):
        return f"<URLRouteModel(id='{self.id}', path='{self.path}', is_primary={self.is_primary})>"


class URLRedirectModel(Base):
    """
    SQLAlchemy model for url_redirects table.

    Maps to domain entity: domain.entities.url_route.URLRedirect
    """

    __tablename__ = 'url_redirects'

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Redirect Fields
    from_path = Column(String(500), nullable=False)
    to_primary_url_id = Column(UUID(as_uuid=True), ForeignKey('url_routes.id'), nullable=False)
    status_code = Column(Integer, nullable=False)

    # Audit Fields
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default='NOW()')
    created_by = Column(String(100), nullable=False)
    reason = Column(String(50), nullable=True)

    # Constraints
    __table_args__ = (
        CheckConstraint("status_code IN (301, 410)", name='redirect_status_check'),
    )

    # Relationships
    target_url = relationship(
        "URLRouteModel",
        back_populates="redirects",
        foreign_keys=[to_primary_url_id]
    )

    def __repr__(self):
        return f"<URLRedirectModel(from='{self.from_path}', status={self.status_code})>"
