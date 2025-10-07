# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
URLRoute and URLRedirect domain entities.

Reference: data-model.md:170-246
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, List, Literal
from uuid import UUID, uuid4


@dataclass
class URLRedirect:
    """
    Redirect entry for URL routing.

    Represents a redirect from an old path to a primary URL,
    typically created when slugs change or content is deleted.
    """

    from_path: str
    to_primary_url_id: str  # FK to URLRoute
    status_code: Literal[301, 410]
    created_at: datetime
    created_by: str
    reason: Optional[str] = None  # "slug_changed" | "content_deleted" | "manual"


@dataclass
class URLRoute:
    """
    SEO-optimized URL routing with redirect management.

    Business Rules:
    - path must be globally unique (across all languages) [enforced at DB level]
    - Only one URLRoute can have isPrimary = true per ContentVersion [enforced at DB level]
    - When slug changes:
      1. Create new URLRoute with isPrimary = true
      2. Old URLRoute set isPrimary = false, isActive = false
      3. Create URLRedirect (301) from old path to new URLRoute
    - When content deleted/archived:
      1. Set URLRoute isActive = false
      2. Create URLRedirect (410 Gone) from path
    - redirects are immutable (append-only audit log)
    - URLRedirect.fromPath must not equal URLRoute.path (no self-redirects)
    """

    content_version_id: UUID
    language_code: str
    path: str
    slug: str
    is_active: bool = True
    is_primary: bool = False
    redirects: List[URLRedirect] = field(default_factory=list)
    canonical_url: str = ""
    alternate_urls: Dict[str, str] = field(default_factory=dict)
    id: UUID = None  # type: ignore
    created_at: datetime = None  # type: ignore
    updated_at: datetime = None  # type: ignore

    def __post_init__(self):
        """Initialize defaults and run validation."""
        if self.id is None:
            self.id = uuid4()
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
        if self.redirects is None:
            self.redirects = []
        if self.alternate_urls is None:
            self.alternate_urls = {}

        self.validate()

    def validate(self) -> None:
        """
        Validate business rules.

        Raises:
            ValueError: If any business rule is violated
        """
        # Rule: redirects must not include self-reference
        for redirect in self.redirects:
            if redirect.from_path == self.path:
                raise ValueError(
                    f"URLRedirect.fromPath cannot equal URLRoute.path ('{self.path}')"
                )

    def deactivate(self, reason: str, deactivated_by: str) -> None:
        """
        Deactivate this URL route and optionally create a 410 redirect.

        Args:
            reason: Reason for deactivation (e.g., "content_deleted", "content_archived")
            deactivated_by: User ID who deactivated the route
        """
        if not self.is_active:
            raise ValueError("URL route is already inactive")

        self.is_active = False
        self.is_primary = False
        self.updated_at = datetime.utcnow()

        # Create 410 Gone redirect
        redirect = URLRedirect(
            from_path=self.path,
            to_primary_url_id=str(self.id),
            status_code=410,
            created_at=datetime.utcnow(),
            created_by=deactivated_by,
            reason=reason
        )
        self.redirects.append(redirect)

        # Re-validate (should catch self-redirect if logic is wrong)
        self.validate()

    def add_redirect(self, from_path: str, created_by: str, reason: Optional[str] = None) -> None:
        """
        Add a 301 redirect from an old path to this URL route.

        Args:
            from_path: The old path to redirect from
            created_by: User ID who created the redirect
            reason: Optional reason for the redirect

        Raises:
            ValueError: If trying to create self-redirect
        """
        if from_path == self.path:
            raise ValueError(
                f"Cannot create redirect from '{from_path}' to itself"
            )

        redirect = URLRedirect(
            from_path=from_path,
            to_primary_url_id=str(self.id),
            status_code=301,
            created_at=datetime.utcnow(),
            created_by=created_by,
            reason=reason
        )
        self.redirects.append(redirect)
        self.updated_at = datetime.utcnow()

    def make_primary(self) -> None:
        """Make this URL route the primary route for its content version."""
        if self.is_primary:
            raise ValueError("URL route is already primary")

        self.is_primary = True
        self.is_active = True
        self.updated_at = datetime.utcnow()
