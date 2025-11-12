# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
URLRedirect domain entity.

Reference: data-model.md:199-206, T145 (URL redirect handling)
"""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class URLRedirect(BaseModel):
    """
    Domain entity for URL redirects.

    Represents a redirect mapping from an old URL path to a new path (301)
    or a gone status (410) for deleted content.
    """

    id: UUID | None = None
    from_path: str = Field(..., description="The old URL path that should be redirected")
    to_path: str | None = Field(None, description="The new URL path (null for 410 Gone)")
    status_code: Literal[301, 410] = Field(..., description="HTTP status code (301 or 410)")
    reason: str | None = Field(None, description="Reason for redirect (e.g., slug_changed, content_deleted)")
    created_by: str | None = Field(None, description="User who created the redirect")
    created_at: datetime | None = Field(None, description="When the redirect was created")

    model_config = {"from_attributes": True}
