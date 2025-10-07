# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Pydantic models for error responses.

Reference: contracts/api-v1.yaml:607-626
"""

from pydantic import BaseModel, Field
from datetime import datetime


class ErrorResponse(BaseModel):
    """Error response model."""

    error: str = Field(..., json_schema_extra={'example': 'Not Found'})
    message: str = Field(..., json_schema_extra={'example': "Content with slug 'invalid-slug' not found for language 'it'"})
    code: str = Field(..., json_schema_extra={'example': 'CONTENT_NOT_FOUND'})
    timestamp: datetime = Field(default_factory=datetime.utcnow, json_schema_extra={'example': '2025-10-09T12:00:00Z'})
