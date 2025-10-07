# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
SQLAlchemy database models for the Affilibuster platform.

These models map domain entities to database tables.
"""

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import all models to ensure they are registered with SQLAlchemy
from .language import LanguageModel
from .content import ContentModel
from .content_version import ContentVersionModel
from .url_route import URLRouteModel, URLRedirectModel
from .currency import CurrencyModel
from .user_preferences import UserPreferencesModel
from .locale import LocaleModel

__all__ = [
    'Base',
    'LanguageModel',
    'ContentModel',
    'ContentVersionModel',
    'URLRouteModel',
    'URLRedirectModel',
    'CurrencyModel',
    'UserPreferencesModel',
    'LocaleModel',
]
