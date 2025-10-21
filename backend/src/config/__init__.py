# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Application configuration module
Loads environment variables and provides type-safe config access
Reference: T138 (Strapi CMS connection)
"""

from .settings import settings

__all__ = ["settings"]
