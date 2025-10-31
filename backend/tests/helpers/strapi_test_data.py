# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Strapi test data management.

Provides utilities to create and delete test content in Strapi
for integration testing without mocking.
"""

from infrastructure.cms.strapi_repository_impl import StrapiRepositoryImpl


class StrapiTestDataManager:
    """
    Manage test data lifecycle in Strapi for integration tests.

    Creates test content before tests run and cleans it up after.
    """

    def __init__(self, strapi_repo: StrapiRepositoryImpl):
        """
        Initialize test data manager.

        Args:
            strapi_repo: Real Strapi repository instance

        """
        self.strapi_repo = strapi_repo
        self.created_ids: dict[str, list[str]] = {}

    async def create_test_homepage(self) -> dict:
        """
        Create test homepage content in Strapi.

        Returns:
            Response data from Strapi

        """
        test_data = {
            "data": {
                "entryTitle": "Test Homepage",
                "heroTitle": "Test Hero **Title**",
                "heroSubtitle": "This is a test homepage",
                "locale": "en",
            },
        }

        response = await self.strapi_repo.put("/homepage", test_data)
        if "data" in response:
            doc_id = response["data"].get("documentId", "unknown")
            self.created_ids.setdefault("homepage", []).append(doc_id)
        return response

    async def create_test_navigation(self) -> dict:
        """
        Create test navigation content in Strapi.

        Returns:
            Response data from Strapi

        """
        test_data = {
            "data": {
                "brandName": "Test Brand",
                "homeLabel": "Home",
                "productsLabel": "Products",
                "aboutLabel": "About",
                "contactLabel": "Contact",
                "locale": "en",
            },
        }

        response = await self.strapi_repo.put("/navigation", test_data)
        if "data" in response:
            doc_id = response["data"].get("documentId", "unknown")
            self.created_ids.setdefault("navigation", []).append(doc_id)
        return response

    async def create_test_about(self) -> dict:
        """
        Create test about page content in Strapi.

        Returns:
            Response data from Strapi

        """
        test_data = {
            "data": {
                "entryTitle": "Test About",
                "heroTitle": "About **Test**",
                "heroSubtitle": "This is a test about page",
                "content": "Test content for about page",
                "locale": "en",
            },
        }

        response = await self.strapi_repo.put("/about", test_data)
        if "data" in response:
            doc_id = response["data"].get("documentId", "unknown")
            self.created_ids.setdefault("about", []).append(doc_id)
        return response

    async def cleanup(self) -> None:
        """
        Clean up test data from Strapi.

        Note: Currently uses PUT with empty data to reset.
        A more robust implementation would track and delete individual entries.
        """
        # Clean up by resetting to minimal data (Strapi doesn't support hard delete of singletons)
        for content_type in ["homepage", "navigation", "about"]:
            try:
                minimal_data = {"data": {"locale": "en"}}
                await self.strapi_repo.put(f"/{content_type}", minimal_data)
            except Exception as e:
                print(f"⚠️ Warning: Could not cleanup {content_type}: {e}")
