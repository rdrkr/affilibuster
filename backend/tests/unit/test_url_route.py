# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Unit tests for URLRoute and URLRedirect domain entities.

Covers:
- Valid URL route and redirect creation
- Validation rules (no self-redirects)
- deactivate() method
- add_redirect() method
- make_primary() method
- Redirect management
"""

import pytest
from datetime import UTC, datetime
from uuid import UUID, uuid4

from src.domain.entities.url_route import URLRoute, URLRedirect


class TestURLRedirectCreation:
    """Test URLRedirect entity creation."""

    def test_create_301_redirect(self):
        """Test creating a 301 redirect."""
        redirect = URLRedirect(
            from_path='/old-path',
            to_primary_url_id='route-id-123',
            status_code=301,
            created_at=datetime.now(UTC),
            created_by='user-123',
            reason='slug_changed'
        )

        assert redirect.from_path == '/old-path'
        assert redirect.to_primary_url_id == 'route-id-123'
        assert redirect.status_code == 301
        assert redirect.reason == 'slug_changed'

    def test_create_410_redirect(self):
        """Test creating a 410 Gone redirect."""
        redirect = URLRedirect(
            from_path='/deleted-content',
            to_primary_url_id='route-id-456',
            status_code=410,
            created_at=datetime.now(UTC),
            created_by='admin-789',
            reason='content_deleted'
        )

        assert redirect.status_code == 410
        assert redirect.reason == 'content_deleted'

    def test_create_redirect_without_reason(self):
        """Test creating redirect without reason (optional)."""
        redirect = URLRedirect(
            from_path='/old-path',
            to_primary_url_id='route-id-123',
            status_code=301,
            created_at=datetime.now(UTC),
            created_by='user-123'
        )

        assert redirect.reason is None


class TestURLRouteCreation:
    """Test URLRoute entity creation."""

    def test_create_url_route_minimal(self):
        """Test creating URL route with minimal fields."""
        content_version_id = uuid4()

        route = URLRoute(
            content_version_id=content_version_id,
            language_code='en',
            path='/products/eco-bottle',
            slug='eco-bottle'
        )

        assert route.content_version_id == content_version_id
        assert route.language_code == 'en'
        assert route.path == '/products/eco-bottle'
        assert route.slug == 'eco-bottle'
        assert route.is_active is True
        assert route.is_primary is False
        assert route.redirects == []
        assert route.alternate_urls == {}

    def test_create_url_route_with_all_fields(self):
        """Test creating URL route with all fields."""
        content_version_id = uuid4()
        route_id = uuid4()
        created = datetime.now(UTC)
        updated = datetime.now(UTC)

        route = URLRoute(
            id=route_id,
            content_version_id=content_version_id,
            language_code='en',
            path='/products/eco-bottle',
            slug='eco-bottle',
            is_active=True,
            is_primary=True,
            canonical_url='/products/eco-bottle',
            alternate_urls={'it': '/it/prodotti/eco-bottiglia'},
            redirects=[],
            created_at=created,
            updated_at=updated
        )

        assert route.id == route_id
        assert route.is_primary is True
        assert route.canonical_url == '/products/eco-bottle'
        assert route.alternate_urls == {'it': '/it/prodotti/eco-bottiglia'}

    def test_auto_generated_id(self):
        """Test that ID is auto-generated if not provided."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/test',
            slug='test'
        )

        assert route.id is not None
        assert isinstance(route.id, UUID)

    def test_auto_generated_timestamps(self):
        """Test that timestamps are auto-generated if not provided."""
        before = datetime.now(UTC)

        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/test',
            slug='test'
        )

        after = datetime.now(UTC)

        assert route.created_at is not None
        assert route.updated_at is not None
        assert before <= route.created_at <= after
        assert before <= route.updated_at <= after


class TestURLRouteValidation:
    """Test URLRoute validation rules."""

    def test_error_when_redirect_from_path_equals_route_path(self):
        """Test validation fails when redirect creates self-reference."""
        content_version_id = uuid4()

        # Create redirect with same path as route (self-redirect)
        self_redirect = URLRedirect(
            from_path='/products/eco-bottle',
            to_primary_url_id='route-id-123',
            status_code=301,
            created_at=datetime.now(UTC),
            created_by='user-123'
        )

        with pytest.raises(ValueError, match="URLRedirect.fromPath cannot equal URLRoute.path"):
            URLRoute(
                content_version_id=content_version_id,
                language_code='en',
                path='/products/eco-bottle',
                slug='eco-bottle',
                redirects=[self_redirect]
            )

    def test_valid_when_no_self_redirects(self):
        """Test validation passes when no self-redirects exist."""
        content_version_id = uuid4()

        # Create redirect with different path
        redirect = URLRedirect(
            from_path='/old-path',
            to_primary_url_id='route-id-123',
            status_code=301,
            created_at=datetime.now(UTC),
            created_by='user-123'
        )

        route = URLRoute(
            content_version_id=content_version_id,
            language_code='en',
            path='/new-path',
            slug='new-path',
            redirects=[redirect]
        )

        assert len(route.redirects) == 1


class TestURLRouteDeactivate:
    """Test URLRoute deactivate() method."""

    def test_error_when_deactivating_already_inactive_route(self):
        """Test error when trying to deactivate already inactive route."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/test',
            slug='test',
            is_active=False
        )

        with pytest.raises(ValueError, match="URL route is already inactive"):
            route.deactivate(reason='manual', deactivated_by='user-123')


class TestURLRouteAddRedirect:
    """Test URLRoute add_redirect() method."""

    def test_add_redirect(self):
        """Test adding a 301 redirect to URL route."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/products/new-slug',
            slug='new-slug'
        )

        route.add_redirect(
            from_path='/products/old-slug',
            created_by='user-123',
            reason='slug_changed'
        )

        assert len(route.redirects) == 1
        assert route.redirects[0].from_path == '/products/old-slug'
        assert route.redirects[0].status_code == 301
        assert route.redirects[0].reason == 'slug_changed'

    def test_add_multiple_redirects(self):
        """Test adding multiple redirects to same route."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/products/final-slug',
            slug='final-slug'
        )

        route.add_redirect('/products/slug-v1', 'user-123', 'slug_changed')
        route.add_redirect('/products/slug-v2', 'user-456', 'slug_changed')
        route.add_redirect('/products/slug-v3', 'user-789', 'slug_changed')

        assert len(route.redirects) == 3
        assert route.redirects[0].from_path == '/products/slug-v1'
        assert route.redirects[1].from_path == '/products/slug-v2'
        assert route.redirects[2].from_path == '/products/slug-v3'

    def test_add_redirect_updates_updated_at(self):
        """Test that add_redirect() updates updated_at timestamp."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/new-path',
            slug='new-path'
        )

        old_updated_at = route.updated_at
        route.add_redirect('/old-path', 'user-123')

        assert route.updated_at > old_updated_at

    def test_error_when_adding_self_redirect(self):
        """Test error when trying to add self-redirect."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/products/eco-bottle',
            slug='eco-bottle'
        )

        with pytest.raises(ValueError, match="Cannot create redirect from .* to itself"):
            route.add_redirect(
                from_path='/products/eco-bottle',  # Same as route path
                created_by='user-123'
            )

    def test_add_redirect_without_reason(self):
        """Test adding redirect without reason (optional)."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/new-path',
            slug='new-path'
        )

        route.add_redirect('/old-path', 'user-123')

        assert route.redirects[0].reason is None


class TestURLRouteMakePrimary:
    """Test URLRoute make_primary() method."""

    def test_make_primary(self):
        """Test making URL route primary."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/test',
            slug='test',
            is_primary=False
        )

        route.make_primary()

        assert route.is_primary is True

    def test_make_primary_sets_is_active_true(self):
        """Test that make_primary() sets is_active to True."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/test',
            slug='test',
            is_active=False,
            is_primary=False
        )

        route.make_primary()

        assert route.is_active is True

    def test_make_primary_updates_updated_at(self):
        """Test that make_primary() updates updated_at timestamp."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/test',
            slug='test',
            is_primary=False
        )

        old_updated_at = route.updated_at
        route.make_primary()

        assert route.updated_at > old_updated_at

    def test_error_when_making_already_primary_route_primary(self):
        """Test error when trying to make already primary route primary."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/test',
            slug='test',
            is_primary=True
        )

        with pytest.raises(ValueError, match="URL route is already primary"):
            route.make_primary()


class TestURLRouteEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_slug_change_workflow(self):
        """Test realistic slug change workflow."""
        content_version_id = uuid4()

        # Old route
        old_route = URLRoute(
            content_version_id=content_version_id,
            language_code='en',
            path='/products/old-slug',
            slug='old-slug',
            is_primary=True,
            is_active=True
        )

        # Deactivate old route
        old_route.is_primary = False
        old_route.is_active = False

        # New route with redirect from old
        new_route = URLRoute(
            content_version_id=content_version_id,
            language_code='en',
            path='/products/new-slug',
            slug='new-slug',
            is_primary=True,
            is_active=True
        )

        new_route.add_redirect('/products/old-slug', 'user-123', 'slug_changed')

        assert new_route.is_primary is True
        assert len(new_route.redirects) == 1
        assert new_route.redirects[0].from_path == '/products/old-slug'

    def test_multiple_language_routes(self):
        """Test creating routes for multiple languages."""
        content_version_id = uuid4()

        en_route = URLRoute(
            content_version_id=content_version_id,
            language_code='en',
            path='/products/eco-bottle',
            slug='eco-bottle',
            canonical_url='/products/eco-bottle',
            alternate_urls={'it': '/it/prodotti/eco-bottiglia'}
        )

        it_route = URLRoute(
            content_version_id=content_version_id,
            language_code='it',
            path='/it/prodotti/eco-bottiglia',
            slug='eco-bottiglia',
            canonical_url='/it/prodotti/eco-bottiglia',
            alternate_urls={'en': '/products/eco-bottle'}
        )

        assert en_route.language_code == 'en'
        assert it_route.language_code == 'it'
        assert en_route.alternate_urls['it'] == it_route.path
        assert it_route.alternate_urls['en'] == en_route.path

    def test_provided_none_values_get_defaults(self):
        """Test that explicitly provided None values get replaced with defaults."""
        route = URLRoute(
            content_version_id=uuid4(),
            language_code='en',
            path='/test',
            slug='test',
            redirects=None,
            alternate_urls=None
        )

        assert route.redirects == []
        assert route.alternate_urls == {}
