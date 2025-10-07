# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Pydantic models for language endpoints.

Reference: contracts/api-v1.yaml:276-340
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional, List


class LanguageResponse(BaseModel):
    """Language response model."""

    model_config = ConfigDict(populate_by_name=True)

    code: Literal['en', 'it', 'he'] = Field(..., json_schema_extra={'example': 'it'})
    displayName: str = Field(..., serialization_alias='displayName', validation_alias='display_name', json_schema_extra={'example': 'Italian'})
    nativeName: str = Field(..., serialization_alias='nativeName', validation_alias='native_name', json_schema_extra={'example': 'Italiano'})
    direction: Literal['ltr', 'rtl'] = Field(..., json_schema_extra={'example': 'ltr'})
    urlPrefix: str = Field(..., serialization_alias='urlPrefix', validation_alias='url_prefix', json_schema_extra={'example': '/it'})
    defaultCurrency: str = Field(..., serialization_alias='defaultCurrency', validation_alias='default_currency', json_schema_extra={'example': 'EUR'})
    localeCode: str = Field(..., serialization_alias='localeCode', validation_alias='locale_code', json_schema_extra={'example': 'it-IT'})
    isDefault: bool = Field(..., serialization_alias='isDefault', validation_alias='is_default', json_schema_extra={'example': False})
    isActive: bool = Field(..., serialization_alias='isActive', validation_alias='is_active', json_schema_extra={'example': True})
    sortOrder: int = Field(..., serialization_alias='sortOrder', validation_alias='sort_order', json_schema_extra={'example': 1})


class DetectLanguageRequest(BaseModel):
    """Request model for language detection."""

    model_config = ConfigDict(populate_by_name=True)

    acceptLanguage: str = Field(..., validation_alias='accept_language', json_schema_extra={'example': 'it-IT,it;q=0.9,en;q=0.8'})
    userAgent: Optional[str] = Field(None, validation_alias='user_agent', json_schema_extra={'example': 'Mozilla/5.0...'})
    countryCode: Optional[str] = Field(None, validation_alias='country_code', json_schema_extra={'example': 'IT'})


class DetectedLanguageResponse(BaseModel):
    """Response model for detected language."""

    model_config = ConfigDict(populate_by_name=True)

    detected: Literal['en', 'it', 'he'] = Field(..., json_schema_extra={'example': 'it'})
    preferred: Literal['en', 'it', 'he'] = Field(..., json_schema_extra={'example': 'it'})
    browserLanguages: List[str] = Field(..., serialization_alias='browserLanguages', validation_alias='browser_languages', json_schema_extra={'example': ['it-IT', 'it', 'en']})
    fallback: Literal['en', 'it', 'he'] = Field(..., json_schema_extra={'example': 'en'})
