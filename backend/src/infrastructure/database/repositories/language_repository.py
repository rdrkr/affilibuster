# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Language repository implementation using SQLAlchemy.

Reference: T072 (ILanguageRepository interface), T065 (Language model)
"""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.repositories.language_repository import ILanguageRepository
from src.domain.entities.language import Language
from src.infrastructure.database.models.language import LanguageModel


class LanguageRepository(ILanguageRepository):
    """
    PostgreSQL implementation of ILanguageRepository.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[Language]:
        """Get all languages ordered by sort_order."""
        stmt = select(LanguageModel).order_by(LanguageModel.sort_order)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def get_by_code(self, code: str) -> Optional[Language]:
        """Get a language by its code."""
        stmt = select(LanguageModel).where(LanguageModel.code == code)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_default(self) -> Language:
        """Get the default language (English)."""
        stmt = select(LanguageModel).where(LanguageModel.is_default == True)
        result = await self.session.execute(stmt)
        model = result.scalar_one()
        return self._to_entity(model)

    async def get_active(self) -> List[Language]:
        """Get all active languages ordered by sort_order."""
        stmt = (
            select(LanguageModel)
            .where(LanguageModel.is_active == True)
            .order_by(LanguageModel.sort_order)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    def _to_entity(self, model: LanguageModel) -> Language:
        """Convert SQLAlchemy model to domain entity."""
        return Language(
            code=model.code,
            display_name=model.display_name,
            native_name=model.native_name,
            direction=model.direction,
            url_prefix=model.url_prefix,
            default_currency=model.default_currency,
            locale_code=model.locale_code,
            is_default=model.is_default,
            is_active=model.is_active,
            sort_order=model.sort_order,
        )
