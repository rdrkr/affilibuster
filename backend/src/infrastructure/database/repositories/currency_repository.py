# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Currency repository implementation using SQLAlchemy.

Reference: T074 (ICurrencyRepository interface), T069 (Currency model)
"""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.repositories.currency_repository import ICurrencyRepository
from src.domain.entities.currency import Currency
from src.infrastructure.database.models.currency import CurrencyModel


class CurrencyRepository(ICurrencyRepository):
    """
    PostgreSQL implementation of ICurrencyRepository.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[Currency]:
        """Get all currencies ordered by sort_order."""
        stmt = select(CurrencyModel).order_by(CurrencyModel.sort_order)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def get_by_code(self, code: str) -> Optional[Currency]:
        """Get a currency by its code."""
        stmt = select(CurrencyModel).where(CurrencyModel.code == code)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_active(self) -> List[Currency]:
        """Get all active currencies ordered by sort_order."""
        stmt = (
            select(CurrencyModel)
            .where(CurrencyModel.is_active == True)
            .order_by(CurrencyModel.sort_order)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    def _to_entity(self, model: CurrencyModel) -> Currency:
        """Convert SQLAlchemy model to domain entity."""
        return Currency(
            code=model.code,
            name=model.name,
            symbol=model.symbol,
            decimal_places=model.decimal_places,
            symbol_position=model.symbol_position,
            thousands_separator=model.thousands_separator,
            decimal_separator=model.decimal_separator,
            is_active=model.is_active,
            sort_order=model.sort_order,
        )
