# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Pydantic models for user preferences endpoints.

Reference: contracts/api-v1.yaml:563-605
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID


class UserPreferencesResponse(BaseModel):
    """User preferences response model."""

    model_config = ConfigDict(populate_by_name=True)

    id: UUID
    sessionId: str = Field(..., serialization_alias='sessionId', validation_alias='session_id', json_schema_extra={'example': 'sess-abc123'})
    selectedCurrency: str = Field(..., serialization_alias='selectedCurrency', validation_alias='selected_currency', pattern='^[A-Z]{3}$', json_schema_extra={'example': 'EUR'})
    dismissedLanguagePrompt: bool = Field(..., serialization_alias='dismissedLanguagePrompt', validation_alias='dismissed_language_prompt', json_schema_extra={'example': True})
    detectedLanguage: Optional[Literal['en', 'it', 'he']] = Field(None, serialization_alias='detectedLanguage', validation_alias='detected_language', json_schema_extra={'example': 'it'})
    createdAt: datetime = Field(..., serialization_alias='createdAt', validation_alias='created_at', json_schema_extra={'example': '2025-10-03T15:30:00Z'})
    updatedAt: datetime = Field(..., serialization_alias='updatedAt', validation_alias='updated_at', json_schema_extra={'example': '2025-10-03T16:45:00Z'})
    expiresAt: datetime = Field(..., serialization_alias='expiresAt', validation_alias='expires_at', json_schema_extra={'example': '2025-11-03T15:30:00Z'})


class UpdatePreferencesRequest(BaseModel):
    """Update preferences request model."""

    model_config = ConfigDict(populate_by_name=True)

    selectedCurrency: Optional[str] = Field(None, validation_alias='selected_currency', pattern='^[A-Z]{3}$', json_schema_extra={'example': 'USD'})
    dismissedLanguagePrompt: Optional[bool] = Field(None, validation_alias='dismissed_language_prompt', json_schema_extra={'example': True})
    detectedLanguage: Optional[Literal['en', 'it', 'he']] = Field(None, validation_alias='detected_language', json_schema_extra={'example': 'it'})
