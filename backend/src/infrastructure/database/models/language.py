# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for Language entity.

Reference: data-model.md:572-586
"""

from sqlalchemy import Column, String, Boolean, Integer, CheckConstraint
from sqlalchemy.orm import relationship
from . import Base


class LanguageModel(Base):
    """
    SQLAlchemy model for languages table.

    Maps to domain entity: domain.entities.language.Language
    """

    __tablename__ = 'languages'

    # Primary Key
    code = Column(String(2), primary_key=True)

    # Display Information
    display_name = Column(String(100), nullable=False)
    native_name = Column(String(100), nullable=False)

    # Localization
    direction = Column(String(3), nullable=False)
    url_prefix = Column(String(10), nullable=False)
    default_currency = Column(String(3), nullable=False)
    locale_code = Column(String(10), nullable=False)

    # Status
    is_default = Column(Boolean, nullable=False, default=False, server_default='false')
    is_active = Column(Boolean, nullable=False, default=True, server_default='true')
    sort_order = Column(Integer, nullable=False)

    # Constraints
    __table_args__ = (
        CheckConstraint("direction IN ('ltr', 'rtl')", name='direction_check'),
    )

    # Relationships
    content_versions = relationship(
        "ContentVersionModel",
        back_populates="language",
        foreign_keys="ContentVersionModel.language_code"
    )

    url_routes = relationship(
        "URLRouteModel",
        back_populates="language",
        foreign_keys="URLRouteModel.language_code"
    )

    locales = relationship(
        "LocaleModel",
        back_populates="language",
        foreign_keys="LocaleModel.language_code"
    )

    def __repr__(self):
        return f"<LanguageModel(code='{self.code}', display_name='{self.display_name}')>"
