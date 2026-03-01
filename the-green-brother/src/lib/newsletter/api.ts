// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Newsletter API Module
 *
 * Provides functions for subscribing to and unsubscribing from the newsletter
 * via the backend API.
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'
import type { NewsletterSubscribeResponse, NewsletterUnsubscribeResponse } from '@/lib/generated/types.gen'
import type { SubscribeNewsletterData, UnsubscribeNewsletterData } from './types'

/**
 * Subscribe an email address to the newsletter.
 *
 * Posts the email to the backend which proxies to the configured
 * email marketing provider (e.g., Brevo).
 * @param email - The email address to subscribe
 * @returns The subscription response or null if the request fails
 */
export async function subscribeNewsletter(email: string): Promise<NewsletterSubscribeResponse | null> {
  try {
    const request = createApiRequest<SubscribeNewsletterData>('/newsletter/subscribe', {
      body: { email },
    })
    return await apiRequest<NewsletterSubscribeResponse>(request, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Failed to subscribe to newsletter:', error)
    return null
  }
}

/**
 * Unsubscribe an email address from the newsletter.
 *
 * Posts the email to the backend which removes it from the configured
 * email marketing provider mailing list.
 * @param email - The email address to unsubscribe
 * @returns The unsubscription response or null if the request fails
 */
export async function unsubscribeNewsletter(email: string): Promise<NewsletterUnsubscribeResponse | null> {
  try {
    const request = createApiRequest<UnsubscribeNewsletterData>('/newsletter/unsubscribe', {
      body: { email },
    })
    return await apiRequest<NewsletterUnsubscribeResponse>(request, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Failed to unsubscribe from newsletter:', error)
    return null
  }
}
