# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
CMS API Generator Script.

Auto-generates cms_routes.py and cms_entities.py from the generated Pydantic models.
This eliminates the need to manually maintain route configurations and type unions.

Usage:
    uv run task generate-cms-api

The script:
1. Parses generated/models.py to find all *GetParametersQuery and *GetResponse classes
2. Identifies single-type vs collection endpoints based on naming patterns:
   - Single-type: Has {Name}GetParametersQuery without {Name}IdGetParametersQuery
   - Collection: Has both {Name}GetParametersQuery AND {Name}IdGetParametersQuery
3. Generates cms_routes.py with proper imports and configurations
4. Generates cms_entities.py with type unions for all request/response models
5. Excludes routes that have custom logic (auth, preferences, languages, etc.)
"""

from __future__ import annotations

import logging
import re
import sys
from dataclasses import dataclass
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

# Routes that have custom logic and should NOT be auto-generated
EXCLUDED_ROUTES = frozenset(
    {
        "auth",  # Authentication routes
        "languages",  # Custom language detection logic
        "preferences",  # User preferences with custom logic
        "redirects",  # Custom redirect logic
    }
)

# Map of route names to their descriptions (for better OpenAPI docs)
ROUTE_DESCRIPTIONS = {
    "about": "Get About page content from Strapi.",
    "auth-page": "Get authentication page content (login, signup forms) from Strapi.",
    "blog": "Get Blog page content and configuration from Strapi.",
    "blog-post": "Get blog posts from Strapi.",
    "blog-post-tag": "Get blog post tags from Strapi.",
    "contact-us": "Get Contact Us page content from Strapi.",
    "contributor": "Get contributors from Strapi.",
    "contributor-role": "Get contributor roles from Strapi.",
    "currency": "Get currencies from Strapi.",
    "error-404": "Get 404 Not Found error page content from Strapi.",
    "error-410": "Get 410 Gone error page content from Strapi.",
    "faq": "Get FAQ (Frequently Asked Questions) content from Strapi.",
    "feature-flag": "Get feature flags from Strapi.",
    "footer": "Get Footer content and links from Strapi.",
    "homepage": "Get Homepage content from Strapi.",
    "navigation": "Get Navigation menu structure from Strapi.",
    "privacy": "Get Privacy Policy content from Strapi.",
    "product": "Get products from Strapi.",
    "product-categories-page": "Get Product Categories listing page content from Strapi.",
    "product-category": "Get product categories from Strapi.",
    "product-tag": "Get product tags from Strapi.",
    "profile": "Get user Profile page content from Strapi.",
    "term": "Get Terms and Conditions content from Strapi.",
    "theme": "Get themes from Strapi.",
    "upload": "Get files upload endpoint from Strapi.",
}


@dataclass
class RouteInfo:
    """Information about a CMS route derived from model names."""

    name: str  # PascalCase name from model (e.g., "About", "Products")
    params_model: str  # e.g., "AboutGetParametersQuery"
    response_model: str  # e.g., "AboutGetResponse"
    id_params_model: str | None = None  # For collections: "ProductsIdGetParametersQuery"
    id_response_model: str | None = None  # For collections: "ProductsIdGetResponse"
    slug_params_model: str | None = None  # For slug lookups: "ProductsSlugSlugGetParametersQuery"
    slug_response_model: str | None = None  # For slug lookups: "ProductsSlugSlugGetResponse"

    @property
    def is_collection(self) -> bool:
        """Check if this is a collection endpoint (has {Name}Id models)."""
        return self.id_params_model is not None

    @property
    def has_slug_lookup(self) -> bool:
        """Check if this route has a slug lookup endpoint."""
        return self.slug_params_model is not None

    @property
    def path(self) -> str:
        """Generate the URL path from the route name."""
        # Convert PascalCase to kebab-case
        # e.g., "ProductCategoriesPage" -> "product-categories-page"
        # Also handle numbers: "Error404" -> "error-404"
        # First, insert hyphen before uppercase letters
        name = re.sub(r"(?<!^)(?=[A-Z])", "-", self.name)
        # Then, insert hyphen between letters and digits: "Error404" -> "Error-404"
        name = re.sub(r"([a-zA-Z])([0-9])", r"\1-\2", name)
        return f"/{name.lower()}"

    @property
    def tag(self) -> str:
        """Generate the OpenAPI tag from the route name."""
        # For collections, remove trailing 's' to get singular tag
        # e.g., "Products" -> "product", "Currencies" -> "currency"
        path = self.path.lstrip("/")
        if self.is_collection and path.endswith("s"):
            if path.endswith("ies"):
                # currencies -> currency, categories -> category
                return path[:-3] + "y"
            return path[:-1]
        return path

    @property
    def description(self) -> str:
        """Get the route description for OpenAPI."""
        return ROUTE_DESCRIPTIONS.get(self.tag, f"Get {self.tag.replace('-', ' ')} content from Strapi.")


# =============================================================================
# Model Parsing
# =============================================================================


def parse_models_file(models_path: Path) -> tuple[list[str], list[str]]:
    """
    Parse the generated models.py file to extract class names.

    Args:
        models_path: Path to generated models.py

    Returns:
        Tuple of (params_classes, response_classes)
    """
    content = models_path.read_text()

    # Find all class definitions for query params and responses
    param_pattern = re.compile(r"^class (\w+GetParametersQuery)\(", re.MULTILINE)
    response_pattern = re.compile(r"^class (\w+GetResponse)\(", re.MULTILINE)
    post_request_pattern = re.compile(r"^class (\w+PostRequest)\(", re.MULTILINE)

    params = param_pattern.findall(content)
    responses = response_pattern.findall(content)
    post_requests = post_request_pattern.findall(content)

    return params + post_requests, responses


def _update_route_info(routes_map: dict[str, RouteInfo], name: str) -> None:
    """Update routes map with information from a single model class name."""
    suffix_map = {
        "SlugSlugGetParametersQuery": ("slug_params_model", 26),
        "SlugSlugGetResponse": ("slug_response_model", 19),
        "IdGetParametersQuery": ("id_params_model", 20),
        "IdGetResponse": ("id_response_model", 13),
        "GetParametersQuery": ("params_model", 18),
        "GetResponse": ("response_model", 11),
    }

    for suffix, (attr, length) in suffix_map.items():
        if name.endswith(suffix):
            base = name[:-length]
            if base not in routes_map:
                routes_map[base] = RouteInfo(name=base, params_model="", response_model="")
            setattr(routes_map[base], attr, name)
            return


def classify_routes(class_names: list[str]) -> tuple[list[RouteInfo], list[RouteInfo], list[RouteInfo]]:
    """
    Classify routes as single-type, collection, or slug-lookup based on naming patterns.

    Args:
        class_names: List of class names from models.py

    Returns:
        Tuple of (single_type_routes, collection_routes, slug_routes)
    """
    routes_map: dict[str, RouteInfo] = {}

    for name in class_names:
        _update_route_info(routes_map, name)

    # Filter out excluded routes and incomplete routes
    single_types: list[RouteInfo] = []
    collections: list[RouteInfo] = []
    slug_routes: list[RouteInfo] = []

    for route in routes_map.values():
        route_key = route.path.lstrip("/").replace("-", "")
        if route_key.rstrip("s") in EXCLUDED_ROUTES or route_key in EXCLUDED_ROUTES:
            continue

        if route.has_slug_lookup and route.slug_response_model:
            slug_routes.append(route)

        if not route.params_model or not route.response_model:
            continue

        if route.is_collection:
            if route.id_params_model and route.id_response_model:
                collections.append(route)
        else:
            single_types.append(route)

    # Sort alphabetically by path
    single_types.sort(key=lambda r: r.path)
    collections.sort(key=lambda r: r.path)
    slug_routes.sort(key=lambda r: r.path)

    return single_types, collections, slug_routes


# =============================================================================
# CMS Routes Generator
# =============================================================================


def _generate_imports(imports: set[str]) -> list[str]:
    # Use case-insensitive sorting to match Ruff/isort behavior
    sorted_imports = sorted(imports, key=str.casefold)
    return [f"    {imp}," for imp in sorted_imports]


def _generate_single_type_configs(single_types: list[RouteInfo]) -> list[str]:
    lines = [
        "# =============================================================================",
        "# Single-Type CMS Endpoints",
        "# =============================================================================",
        "# These are Strapi single-type content types with only one GET endpoint.",
        "",
        "SINGLE_TYPE_CONFIGS: list[CMSSingleTypeConfig] = [",
    ]

    for route in single_types:
        lines.append("    CMSSingleTypeConfig(")
        lines.append(f'        path="{route.path}",')
        lines.append(f'        tag="{route.tag}",')
        lines.append(f"        params_model={route.params_model},")
        lines.append(f"        response_model={route.response_model},")
        lines.append(f'        description="{route.description}",')
        lines.append("    ),")

    lines.append("]")
    lines.append("")
    lines.append("")
    return lines


def _generate_collection_configs(collections: list[RouteInfo]) -> list[str]:
    lines = [
        "# =============================================================================",
        "# Collection CMS Endpoints",
        "# =============================================================================",
        "# These are Strapi collection-type content types with list and get-by-id endpoints.",
        "",
        "COLLECTION_CONFIGS: list[CMSCollectionConfig] = [",
    ]

    for route in collections:
        singular_tag = route.tag
        lines.append("    CMSCollectionConfig(")
        lines.append(f'        path="{route.path}",')
        lines.append(f'        tag="{singular_tag}",')
        lines.append(f"        list_params_model={route.params_model},")
        lines.append(f"        list_response_model={route.response_model},")
        lines.append(f"        item_params_model={route.id_params_model},")
        lines.append(f"        item_response_model={route.id_response_model},")
        lines.append(f'        id_description="{singular_tag.replace("-", " ").title()} ID or slug",')
        lines.append(f'        list_description="List all {singular_tag.replace("-", " ")}s from Strapi.",')
        lines.append(f'        item_description="Get a specific {singular_tag.replace("-", " ")} by ID or slug.",')
        lines.append("    ),")

    lines.append("]")
    lines.append("")
    lines.append("")
    return lines


def _generate_slug_configs(slug_routes: list[RouteInfo]) -> list[str]:
    lines = [
        "# =============================================================================",
        "# Slug CMS Endpoints",
        "# =============================================================================",
        "# These are endpoints that support fetching by slug (e.g. /path/slug/{slug}).",
        "",
        "SLUG_CONFIGS: list[CMSSlugConfig] = [",
    ]

    for route in slug_routes:
        singular_tag = route.tag
        lines.append("    CMSSlugConfig(")
        lines.append(f'        path="{route.path}",')
        lines.append(f'        tag="{singular_tag}",')
        lines.append(f"        params_model={route.slug_params_model},")
        lines.append(f"        response_model={route.slug_response_model},")
        lines.append(f'        description="Get {singular_tag.replace("-", " ")} by slug from Strapi.",')
        lines.append("    ),")

    lines.append("]")
    lines.append("")
    lines.append("")
    return lines


def generate_cms_routes_code(
    single_types: list[RouteInfo],
    collections: list[RouteInfo],
    slug_routes: list[RouteInfo],
) -> str:
    """Generate the cms_routes.py file content."""
    # Collect all model imports
    imports: set[str] = set()
    for route in single_types:
        imports.add(route.params_model)
        imports.add(route.response_model)

    for route in collections:
        imports.add(route.params_model)
        imports.add(route.response_model)
        if route.id_params_model:
            imports.add(route.id_params_model)
        if route.id_response_model:
            imports.add(route.id_response_model)

    for route in slug_routes:
        if route.slug_params_model:
            imports.add(route.slug_params_model)
        if route.slug_response_model:
            imports.add(route.slug_response_model)

    import_lines = _generate_imports(imports)

    lines = [
        "# Copyright (c) 2026 Affilibuster by Ronen Druker.",
        "",
        "# AUTO-GENERATED FILE - DO NOT EDIT MANUALLY",
        "# Generated by: uv run task generate-cms-api",
        "# To regenerate, run the command above after updating OpenAPI spec.",
        "",
        '"""',
        "Centralized CMS Route Configurations.",
        "",
        "This module defines all CMS proxy routes using declarative configurations.",
        "Routes are auto-generated from the configuration lists using the factory",
        "functions from cms_route_factory.",
        "",
        "WARNING: This file is auto-generated. Do not edit manually.",
        "To add custom routes, modify the generator script or add routes in main.py.",
        '"""',
        "",
        "from fastapi import APIRouter",
        "",
        "from affilibuster_backend.domain.entities.generated.models import (",
    ]
    lines.extend(import_lines)
    lines.append(")")
    lines.append("from affilibuster_backend.infrastructure.api.routes.cms_route_factory import (")
    lines.append("    CMSCollectionConfig,")
    lines.append("    CMSSingleTypeConfig,")
    lines.append("    CMSSlugConfig,")
    lines.append("    create_collection_router,")
    lines.append("    create_single_type_router,")
    lines.append("    create_slug_router,")
    lines.append(")")
    lines.append("")

    lines.extend(_generate_single_type_configs(single_types))
    lines.extend(_generate_collection_configs(collections))
    lines.extend(_generate_slug_configs(slug_routes))

    lines.append("def get_all_cms_routers() -> list[APIRouter]:")
    lines.append('    """')
    lines.append("    Generate all CMS proxy routers from configurations.")
    lines.append("")
    lines.append("    Returns:")
    lines.append("        List of FastAPI routers ready to be included in the application")
    lines.append("")
    lines.append('    """')
    lines.append("    return [create_single_type_router(config) for config in SINGLE_TYPE_CONFIGS] + [")
    lines.append("        create_collection_router(config) for config in COLLECTION_CONFIGS")
    lines.append("    ] + [")
    lines.append("        create_slug_router(config) for config in SLUG_CONFIGS")
    lines.append("    ]")
    lines.append("")

    return "\n".join(lines)


# =============================================================================
# CMS Entities Generator
# =============================================================================


def generate_cms_entities_code(params_classes: list[str], response_classes: list[str]) -> str:
    """
    Generate the cms_entities.py file content.

    Args:
        params_classes: List of request/params class names
        response_classes: List of response class names

    Returns:
        Generated Python code as string
    """
    # Sort for consistent output using case-insensitive sorting to match Ruff/isort
    sorted_params = sorted(params_classes, key=str.casefold)
    sorted_responses = sorted(response_classes, key=str.casefold)

    # Build import list (combine both for single import statement)
    all_imports = sorted(set(sorted_params) | set(sorted_responses), key=str.casefold)
    import_lines = [f"    {imp}," for imp in all_imports]

    # Build CMSRequest union
    request_union_lines = []
    for i, params in enumerate(sorted_params):
        prefix = "    " if i == 0 else "    | "
        request_union_lines.append(f"{prefix}{params}")

    # Build CMSResponse union
    response_union_lines = []
    for i, resp in enumerate(sorted_responses):
        prefix = "    " if i == 0 else "    | "
        response_union_lines.append(f"{prefix}{resp}")

    lines = [
        "# Copyright (c) 2026 Affilibuster by Ronen Druker.",
        "",
        "# AUTO-GENERATED FILE - DO NOT EDIT MANUALLY",
        "# Generated by: uv run task generate-cms-api",
        "# To regenerate, run the command above after updating OpenAPI spec.",
        "",
        '"""',
        "CMS Type Unions.",
        "",
        "Defines union types for all OpenAPI-generated CMS request and response models.",
        "These types provide strong type safety for the generic CMS repository pattern.",
        "",
        "WARNING: This file is auto-generated. Do not edit manually.",
        '"""',
        "",
        "from typing import Any",
        "",
        "from pydantic import BaseModel, ConfigDict, Field, RootModel",
        "",
        "from affilibuster_backend.domain.entities.generated.models import (",
    ]
    lines.extend(import_lines)
    lines.append(")")
    lines.append("")
    lines.append("")
    # Add Locales models BEFORE unions (i18n support - internal Strapi endpoint)
    lines.extend(
        [
            "class LocaleItem(BaseModel):",
            '    """Strapi locale item response model."""',
            "",
            '    model_config = ConfigDict(extra="forbid", populate_by_name=True)',
            "",
            "    id: int = Field(..., gt=0, le=9007199254740991)",
            '    document_id: str = Field(..., alias="documentId", examples=["550e8400-e29b-41d4-a716-446655440000"])',
            "    name: str",
            "    code: str = Field(..., max_length=2, min_length=2)",
            '    created_at: str = Field(..., alias="createdAt", examples=["2025-10-30T17:41:47.696Z"])',
            '    updated_at: str = Field(..., alias="updatedAt", examples=["2025-10-30T18:23:15.432Z"])',
            '    published_at: str | None = Field(..., alias="publishedAt", examples=["2025-10-30T17:41:47.696Z"])',
            '    is_default: bool = Field(..., alias="isDefault")',
            "",
            "",
            "class LocalesResponse(RootModel[list[LocaleItem]]):",
            '    """Strapi locales list response model."""',
            "",
            "    model_config = ConfigDict(populate_by_name=True)",
            "",
            "    root: list[LocaleItem]",
            "",
            "",
        ]
    )
    lines.append("# Union of all request parameter types (query parameters and request bodies)")
    lines.append("CMSRequest = (")
    lines.extend(request_union_lines)
    lines.append(")")
    lines.append("")
    lines.append("# Union of all response types")
    lines.append("CMSResponse = (")
    lines.extend(response_union_lines)
    lines.append("    | LocalesResponse  # Internal Strapi i18n endpoint (added programmatically)")
    lines.append(")")
    lines.append("")
    lines.append("")

    # Add the CMSErrorDetails and CMSAPIError classes (these are handwritten, not generated)
    lines.extend(
        [
            "class CMSErrorDetails(BaseModel):",
            '    """',
            "    Structured error details from CMS API responses.",
            "",
            "    Represents the error structure returned by Strapi CMS.",
            "    Provides strong typing for error information instead of dict[str, Any].",
            '    """',
            "",
            '    model_config = {"extra": "allow"}  # Allow additional fields from Strapi',
            "",
            '    message: str | None = Field(default=None, description="Error message from CMS")',
            '    status: int | None = Field(default=None, description="HTTP status code")',
            '    name: str | None = Field(default=None, description="Error name/type")',
            '    details: dict[str, Any] | None = Field(default=None, description="Additional error context")',
            "",
            "",
            "class CMSAPIError(Exception):",
            '    """',
            "    Raised when CMS API returns an error.",
            "",
            "    Provides structured error information with strong typing.",
            '    """',
            "",
            "    def __init__(",
            "        self, status_code: int, message: str, details: CMSErrorDetails | dict[str, Any] | None = None",
            "    ) -> None:",
            '        """',
            "        Initialize CMS API error.",
            "",
            "        Args:",
            "            status_code: HTTP status code.",
            "            message: Error message.",
            "            details: Structured error details from CMS response.",
            "",
            '        """',
            "        self.status_code = status_code",
            "        self.message = message",
            "",
            "        # Convert dict to CMSErrorDetails for strong typing",
            "        if isinstance(details, dict):",
            "            # Handle both Strapi error structure and simple message fallback",
            '            if "error" in details:',
            '                # Strapi wraps errors in an "error" object',
            '                error_data = details["error"]',
            "                if isinstance(error_data, dict):",
            "                    self.details = CMSErrorDetails.model_validate(error_data)",
            "                else:",
            "                    # Error is a string or other simple type",
            "                    self.details = CMSErrorDetails(",
            "                        message=str(error_data), status=None, name=None, details=None",
            "                    )",
            "            else:",
            '                # Simple dict (e.g., {"message": "..."})',
            "                self.details = CMSErrorDetails.model_validate(details)",
            "        elif details is None:",
            "            self.details = CMSErrorDetails(message=None, status=None, name=None, details=None)",
            "        else:",
            "            self.details = details",
            "",
            '        super().__init__(f"CMS API error ({status_code}): {message}")',
            "",
        ]
    )

    return "\n".join(lines)


# =============================================================================
# Main Entry Point
# =============================================================================


def main() -> None:
    """Generate cms_routes.py and cms_entities.py from the generated models."""
    script_path = Path(__file__).resolve()
    backend_root = script_path.parent.parent
    models_path = backend_root / "src" / "affilibuster_backend" / "domain" / "entities" / "generated" / "models.py"
    routes_output_path = (
        backend_root
        / "src"
        / "affilibuster_backend"
        / "infrastructure"
        / "api"
        / "routes"
        / "generated"
        / "cms_routes.py"
    )
    entities_output_path = (
        backend_root / "src" / "affilibuster_backend" / "domain" / "entities" / "generated" / "cms_entities.py"
    )

    logger.info("=" * 60)
    logger.info("🔧 Generating CMS API Code")
    logger.info("=" * 60)
    logger.info("")

    if not models_path.exists():
        logger.error("❌ Error: Models file not found at %s", models_path)
        logger.error("   Run 'uv run task openapi-generate' first to generate models.")
        sys.exit(1)

    logger.info("📖 Reading models from: %s", models_path.relative_to(backend_root))

    params_classes, response_classes = parse_models_file(models_path)
    all_classes = params_classes + response_classes
    logger.info("   Found %d request model classes", len(params_classes))
    logger.info("   Found %d response model classes", len(response_classes))

    single_types, collections, slug_routes = classify_routes(all_classes)
    logger.info("   Identified %d single-type routes", len(single_types))
    logger.info("   Identified %d collection routes", len(collections))
    logger.info("   Identified %d slug routes", len(slug_routes))
    logger.info("")

    # Generate cms_routes.py
    logger.info("📝 Generating cms_routes.py...")
    routes_code = generate_cms_routes_code(single_types, collections, slug_routes)
    routes_output_path.write_text(routes_code)
    logger.info("✅ Generated: %s", routes_output_path.relative_to(backend_root))

    # Generate cms_entities.py
    logger.info("📝 Generating cms_entities.py...")
    entities_code = generate_cms_entities_code(params_classes, response_classes)
    entities_output_path.write_text(entities_code)
    logger.info("✅ Generated: %s", entities_output_path.relative_to(backend_root))

    logger.info("")
    logger.info("⚠️  Run 'uv run ruff check --fix && uv run ruff format' to format the generated files.")
    logger.info("")

    logger.info("📋 Single-Type Routes:")
    for route in single_types:
        logger.info("   • %s", route.path)

    logger.info("")
    logger.info("📋 Collection Routes:")
    for route in collections:
        logger.info("   • %s (+ %s/{id})", route.path, route.path)

    logger.info("")
    logger.info("📋 Slug Routes:")
    for route in slug_routes:
        logger.info("   • %s/slug/{slug}", route.path)

    logger.info("")
    logger.info("=" * 60)
    logger.info("✅ CMS API Generation Complete!")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
