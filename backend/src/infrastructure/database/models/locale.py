# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for Locale entity.

Reference: data-model.md:680-689
"""

from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from . import Base


class LocaleModel(Base):
    """
    SQLAlchemy model for locales table.

    Maps to domain entity: domain.entities.locale.Locale
    """

    __tablename__ = 'locales'

    # Primary Key
    code = Column(String(10), primary_key=True)

    # Foreign Keys
    language_code = Column(String(2), ForeignKey('languages.code'), nullable=False)

    # Display Information
    country_code = Column(String(2), nullable=False)
    display_name = Column(String(100), nullable=False)

    # Formatting
    date_format = Column(String(20), nullable=False)
    time_format = Column(String(3), nullable=False)
    first_day_of_week = Column(Integer, nullable=False)

    # Status
    is_active = Column(Boolean, nullable=False, default=True, server_default='true')

    # Constraints
    __table_args__ = (
        CheckConstraint("time_format IN ('12h', '24h')", name='time_format_check'),
        CheckConstraint("first_day_of_week BETWEEN 0 AND 6", name='first_day_of_week_check'),
    )

    # Relationships
    language = relationship(
        "LanguageModel",
        back_populates="locales",
        foreign_keys=[language_code]
    )

    def __repr__(self):
        return f"<LocaleModel(code='{self.code}', display_name='{self.display_name}')>"
