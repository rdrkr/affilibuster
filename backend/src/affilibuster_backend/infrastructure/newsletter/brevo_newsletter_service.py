# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
Brevo newsletter service implementation.

Implements the INewsletterService interface using Brevo (formerly Sendinblue)
REST API for managing newsletter subscriptions.
"""

import logging
from http import HTTPStatus

import httpx

from affilibuster_backend.domain.services.newsletter_service import (
    INewsletterService,
    NewsletterSubscribeError,
    NewsletterUnsubscribeError,
)

logger = logging.getLogger(__name__)


class BrevoNewsletterService(INewsletterService):
    """
    Newsletter service implementation using Brevo (formerly Sendinblue).

    Uses the Brevo Double Opt-In (DOI) API to add email addresses to a
    configured mailing list with email confirmation. This ensures GDPR Art. 7(1)
    compliance by requiring unambiguous indication of consent.
    """

    _DOI_URL = "https://api.brevo.com/v3/contacts/doubleOptinConfirmation"
    _LIST_REMOVE_URL = "https://api.brevo.com/v3/contacts/lists/{list_id}/contacts/remove"

    def __init__(self, api_key: str, list_id: int, doi_template_id: int, doi_redirect_url: str) -> None:
        """
        Initialize the Brevo newsletter service.

        Args:
            api_key: Brevo API key for authentication.
            list_id: Brevo mailing list ID to subscribe contacts to.
            doi_template_id: Brevo DOI email template ID for confirmation emails.
            doi_redirect_url: URL the user lands on after clicking the DOI confirmation link.

        """
        self._api_key = api_key
        self._list_id = list_id
        self._doi_template_id = doi_template_id
        self._doi_redirect_url = doi_redirect_url

    async def subscribe(self, email: str) -> None:
        """
        Subscribe an email address to the newsletter via Brevo DOI API.

        Sends a double opt-in confirmation email to the subscriber. The contact
        is only added to the mailing list after they confirm via the email link.
        A 201 response indicates the DOI email was sent successfully.

        Args:
            email: Email address to subscribe.

        Raises:
            NewsletterSubscribeError: If the Brevo API returns an error or is unreachable.

        """
        payload = {
            "email": email,
            "includeListIds": [self._list_id],
            "templateId": self._doi_template_id,
            "redirectionUrl": self._doi_redirect_url,
        }
        headers = {
            "api-key": self._api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self._DOI_URL,
                    json=payload,
                    headers=headers,
                    timeout=10.0,
                )

            # 201 = DOI confirmation email sent
            if response.status_code == HTTPStatus.CREATED:
                logger.info("Newsletter DOI confirmation sent for email")
                return

            # Any other status is an error
            logger.error("Brevo API error: status=%s", response.status_code)
            raise NewsletterSubscribeError(f"Brevo API returned status {response.status_code}")

        except httpx.RequestError as e:
            logger.exception("Brevo API request failed")
            raise NewsletterSubscribeError(f"Failed to connect to Brevo: {e!s}") from e

    async def unsubscribe(self, email: str) -> None:
        """
        Unsubscribe an email address from the newsletter via Brevo API.

        Removes the contact from the configured mailing list.
        A 200 response indicates success.

        Args:
            email: Email address to unsubscribe.

        Raises:
            NewsletterUnsubscribeError: If the Brevo API returns an error or is unreachable.

        """
        url = self._LIST_REMOVE_URL.format(list_id=self._list_id)
        payload = {"emails": [email]}
        headers = {
            "api-key": self._api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    timeout=10.0,
                )

            if response.status_code == HTTPStatus.OK:
                logger.info("Newsletter unsubscription successful for email")
                return

            logger.error("Brevo API unsubscribe error: status=%s", response.status_code)
            raise NewsletterUnsubscribeError(f"Brevo API returned status {response.status_code}")

        except httpx.RequestError as e:
            logger.exception("Brevo API unsubscribe request failed")
            raise NewsletterUnsubscribeError(f"Failed to connect to Brevo: {e!s}") from e
