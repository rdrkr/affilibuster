# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Generic CMS Route Factory.

Provides factory functions for creating strongly-typed FastAPI routers
that proxy to Strapi CMS endpoints. This reduces boilerplate and enables
adding new CMS routes with minimal code changes.

Usage:
    # For single-type endpoints (e.g., /about, /homepage)
    router = create_single_type_router(
        CMSSingleTypeConfig(
            path="/about",
            tag="about",
            params_model=AboutGetParametersQuery,
            response_model=AboutGetResponse,
        )
    )

    # For collection endpoints (e.g., /products, /products/{id})
    router = create_collection_router(
        CMSCollectionConfig(
            path="/products",
            tag="product",
            list_params_model=ProductsGetParametersQuery,
            list_response_model=ProductsGetResponse,
            item_params_model=ProductsIdGetParametersQuery,
            item_response_model=ProductsIdGetResponse,
        )
    )
"""

import logging
from collections.abc import Callable, Coroutine
from dataclasses import dataclass
from typing import Annotated, Any, TypeVar

from fastapi import APIRouter, HTTPException, Path, Request

from affilibuster_backend.domain.entities import CMSRequest, CMSResponse
from affilibuster_backend.infrastructure.dependencies import GetCMSContentUseCaseDep

# Type variables for generic factory functions
ParamsT = TypeVar("ParamsT", bound=CMSRequest)
ResponseT = TypeVar("ResponseT", bound=CMSResponse)

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class CMSSingleTypeConfig:
    """
    Configuration for single-type CMS endpoints.

    Single-type endpoints have only one GET endpoint (e.g., /about, /homepage).

    Attributes:
        path: API path (e.g., "/about", "/homepage")
        tag: OpenAPI tag for grouping (e.g., "about", "homepage")
        params_model: Pydantic model for query parameters
        response_model: Pydantic model for response
        description: Optional endpoint description

    """

    path: str
    tag: str
    params_model: type[CMSRequest]
    response_model: type[CMSResponse]
    description: str = "Get content from Strapi CMS."


@dataclass(frozen=True)
class CMSCollectionConfig:
    """
    Configuration for collection CMS endpoints.

    Collection endpoints have a list endpoint and a get-by-id endpoint
    (e.g., /products and /products/{id}).

    Attributes:
        path: API path (e.g., "/products", "/blog-posts")
        tag: OpenAPI tag for grouping (e.g., "product", "blog-post")
        list_params_model: Pydantic model for list query parameters
        list_response_model: Pydantic model for list response
        item_params_model: Pydantic model for get-by-id query parameters
        item_response_model: Pydantic model for get-by-id response
        id_description: Description for the ID path parameter
        list_description: Optional list endpoint description
        item_description: Optional get-by-id endpoint description

    """

    path: str
    tag: str
    list_params_model: type[CMSRequest]
    list_response_model: type[CMSResponse]
    item_params_model: type[CMSRequest]
    item_response_model: type[CMSResponse]
    id_description: str = "Document ID or slug"
    list_description: str = "List all items from Strapi CMS."
    item_description: str = "Get a specific item by ID from Strapi CMS."


# Type alias for endpoint handler functions
EndpointHandler = Callable[..., Coroutine[Any, Any, Any]]


def _get_parsed_params(request: Request, params_model: type[CMSRequest]) -> CMSRequest:
    """
    Get parsed query params from request.state and construct the params model.

    The QueryParamsParserMiddleware parses bracket notation query params
    (e.g., filters[roles][roleId][$containsi]=author) into nested dicts
    and stores them in request.state.parsed_query_params.

    This function retrieves those parsed params and constructs the appropriate
    Pydantic model instance.

    Args:
        request: The FastAPI request object
        params_model: The Pydantic model class for the params

    Returns:
        An instance of params_model with the parsed query parameters

    """
    # Get parsed params from middleware (with bracket notation support)
    parsed_params: dict[str, Any] = getattr(request.state, "parsed_query_params", {})

    # Construct the params model from parsed params
    # Use model_validate to handle any type coercion
    parsed_params.setdefault("pagination", None)
    return params_model.model_validate(parsed_params)


def _make_single_type_endpoint(
    path: str,
    tag: str,
    params_model: type[CMSRequest],
    response_model: type[CMSResponse],
) -> EndpointHandler:
    """Create a single-type endpoint handler with proper dependency injection."""

    async def handler(
        request: Request,
        use_case: GetCMSContentUseCaseDep,
    ) -> CMSResponse:
        try:
            params = _get_parsed_params(request, params_model)
            return await use_case.execute(
                path,
                params=params,
                response_model=response_model,
            )
        except Exception as e:
            logger.exception("Failed to fetch %s from Strapi", tag)
            raise HTTPException(
                status_code=502,
                detail=f"Failed to fetch {tag} from Strapi: {e!s}",
            ) from e

    return handler


def _make_list_endpoint(
    path: str,
    tag: str,
    params_model: type[CMSRequest],
    response_model: type[CMSResponse],
) -> EndpointHandler:
    """Create a list endpoint handler with proper dependency injection."""

    async def handler(
        request: Request,
        use_case: GetCMSContentUseCaseDep,
    ) -> CMSResponse:
        try:
            params = _get_parsed_params(request, params_model)
            return await use_case.execute(
                path,
                params=params,
                response_model=response_model,
            )
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to fetch {tag} list from Strapi: {e!s}",
            ) from e

    return handler


def _make_item_endpoint(
    path: str,
    tag: str,
    params_model: type[CMSRequest],
    response_model: type[CMSResponse],
    id_description: str,
) -> EndpointHandler:
    """Create a get-by-id endpoint handler with proper dependency injection."""
    _id_dep = Annotated[str, Path(alias="id", description=id_description)]

    async def handler(
        request: Request,
        use_case: GetCMSContentUseCaseDep,
        item_id: _id_dep,
    ) -> CMSResponse:
        try:
            params = _get_parsed_params(request, params_model)
            return await use_case.execute(
                f"{path}/{item_id}",
                params=params,
                response_model=response_model,
            )
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to fetch {tag} from Strapi: {e!s}",
            ) from e

    return handler


def create_single_type_router(config: CMSSingleTypeConfig) -> APIRouter:
    """
    Create a FastAPI router for a single-type CMS endpoint.

    Single-type endpoints proxy GET requests to Strapi's single-type
    content types (e.g., about page, homepage, footer).

    Args:
        config: Configuration for the single-type endpoint

    Returns:
        Configured FastAPI router ready to be included in the app

    Example:
        >>> router = create_single_type_router(
        ...     CMSSingleTypeConfig(
        ...         path="/about",
        ...         tag="about",
        ...         params_model=AboutGetParametersQuery,
        ...         response_model=AboutGetResponse,
        ...     )
        ... )

    """
    router = APIRouter(prefix="", tags=[config.tag])

    # Create the endpoint handler
    handler = _make_single_type_endpoint(
        path=config.path,
        tag=config.tag,
        params_model=config.params_model,
        response_model=config.response_model,
    )

    # Set the function name and docstring for OpenAPI
    handler.__name__ = f"{config.tag.replace('-', '_')}_get"
    handler.__doc__ = config.description

    # Register the endpoint
    router.add_api_route(
        config.path,
        handler,
        methods=["GET"],
        response_model=config.response_model,
    )

    return router


def create_collection_router(config: CMSCollectionConfig) -> APIRouter:
    """
    Create a FastAPI router for a collection CMS endpoint.

    Collection endpoints proxy GET list and GET by ID requests to
    Strapi's collection-type content types (e.g., products, blog-posts).

    Args:
        config: Configuration for the collection endpoint

    Returns:
        Configured FastAPI router ready to be included in the app

    Example:
        >>> router = create_collection_router(
        ...     CMSCollectionConfig(
        ...         path="/products",
        ...         tag="product",
        ...         list_params_model=ProductsGetParametersQuery,
        ...         list_response_model=ProductsGetResponse,
        ...         item_params_model=ProductsIdGetParametersQuery,
        ...         item_response_model=ProductsIdGetResponse,
        ...     )
        ... )

    """
    router = APIRouter(prefix=config.path, tags=[config.tag])

    # Create the list handler
    list_handler = _make_list_endpoint(
        path=config.path,
        tag=config.tag,
        params_model=config.list_params_model,
        response_model=config.list_response_model,
    )

    # Set the function name and docstring for OpenAPI
    list_handler.__name__ = f"get_{config.tag.replace('-', '_')}s"
    list_handler.__doc__ = config.list_description

    # Create the item handler
    item_handler = _make_item_endpoint(
        path=config.path,
        tag=config.tag,
        params_model=config.item_params_model,
        response_model=config.item_response_model,
        id_description=config.id_description,
    )

    # Set the function name and docstring for OpenAPI
    item_handler.__name__ = f"get_{config.tag.replace('-', '_')}"
    item_handler.__doc__ = config.item_description

    # Register the endpoints
    router.add_api_route(
        "",
        list_handler,
        methods=["GET"],
        response_model=config.list_response_model,
    )

    router.add_api_route(
        "/{id}",
        item_handler,
        methods=["GET"],
        response_model=config.item_response_model,
    )

    return router


@dataclass(frozen=True)
class CMSSlugConfig:
    """
    Configuration for slug-based lookups.

    Slug endpoints allow fetching items by their unique slug
    (e.g., /blog-posts/slug/{slug}).

    Attributes:
        path: Base API path (e.g., "/blog-posts")
        tag: OpenAPI tag for grouping
        params_model: Pydantic model for query parameters
        response_model: Pydantic model for response
        slug_description: Description for the slug parameter
        description: Optional endpoint description

    """

    path: str
    tag: str
    params_model: type[CMSRequest]
    response_model: type[CMSResponse]
    slug_description: str = "The unique slug identifier"
    description: str = "Get content by slug from Strapi."


def _make_slug_endpoint(
    path: str,
    tag: str,
    params_model: type[CMSRequest],
    response_model: type[CMSResponse],
    slug_description: str,
) -> EndpointHandler:
    """Create a get-by-slug endpoint handler with proper dependency injection."""
    _slug_dep = Annotated[str, Path(alias="slug", description=slug_description)]

    async def handler(
        request: Request,
        use_case: GetCMSContentUseCaseDep,
        slug_value: _slug_dep,
    ) -> CMSResponse:
        try:
            params = _get_parsed_params(request, params_model)
            return await use_case.execute(
                f"{path}/slug/{slug_value}",
                params=params,
                response_model=response_model,
            )
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to fetch {tag} by slug from Strapi: {e!s}",
            ) from e

    return handler


def create_slug_router(config: CMSSlugConfig) -> APIRouter:
    """
    Create a FastAPI router for a slug-based CMS endpoint.

    Args:
        config: Configuration for the slug endpoint

    Returns:
        Configured FastAPI router ready to be included in the app

    """
    router = APIRouter(prefix="", tags=[config.tag])

    # Create the handler
    handler = _make_slug_endpoint(
        path=config.path,
        tag=config.tag,
        params_model=config.params_model,
        response_model=config.response_model,
        slug_description=config.slug_description,
    )

    # Set the function name and docstring for OpenAPI
    handler.__name__ = f"{config.tag.replace('-', '_')}_get_by_slug"
    handler.__doc__ = config.description

    # Register the endpoint
    router.add_api_route(
        f"{config.path}/slug/{{slug}}",
        handler,
        methods=["GET"],
        response_model=config.response_model,
    )

    return router
