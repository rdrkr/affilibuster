# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy model for Currency entity.

Reference: data-model.md:653-663
"""

from sqlalchemy import Column, String, Integer, Boolean, CheckConstraint
from sqlalchemy.orm import relationship
from . import Base


class CurrencyModel(Base):
    """
    SQLAlchemy model for currencies table.

    Maps to domain entity: domain.entities.currency.Currency
    """

    __tablename__ = 'currencies'

    # Primary Key
    code = Column(String(3), primary_key=True)

    # Display Information
    name = Column(String(100), nullable=False)
    symbol = Column(String(10), nullable=False)

    # Formatting
    decimal_places = Column(Integer, nullable=False, default=2, server_default='2')
    symbol_position = Column(String(10), nullable=False)
    thousands_separator = Column(String(5), nullable=False)
    decimal_separator = Column(String(5), nullable=False)

    # Status
    is_active = Column(Boolean, nullable=False, default=True, server_default='true')
    sort_order = Column(Integer, nullable=False)

    # Constraints
    __table_args__ = (
        CheckConstraint("decimal_places BETWEEN 0 AND 3", name='decimal_places_check'),
        CheckConstraint("symbol_position IN ('before', 'after')", name='symbol_position_check'),
    )

    # Relationships
    user_preferences = relationship(
        "UserPreferencesModel",
        back_populates="currency",
        foreign_keys="UserPreferencesModel.selected_currency"
    )

    def __repr__(self):
        return f"<CurrencyModel(code='{self.code}', name='{self.name}', symbol='{self.symbol}')>"
