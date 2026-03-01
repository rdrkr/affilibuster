// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Newsletter Types Module
 *
 * Re-exports generated types used by the newsletter feature for convenience.
 */

export type {
  NewsletterSubscribeRequest,
  NewsletterSubscribeResponse,
  NewsletterUnsubscribeRequest,
  NewsletterUnsubscribeResponse,
} from '@/lib/generated/types.gen'

import type { NewsletterSubscribeRequest, NewsletterUnsubscribeRequest } from '@/lib/generated/types.gen'

/**
 * API request data type for the POST /newsletter/subscribe endpoint.
 *
 * Manually defined because the code generator does not produce a Data type
 * for this endpoint. Follows the same pattern as other generated Data types
 * (e.g., RecordConsentData).
 */
export interface SubscribeNewsletterData {
  /** The newsletter subscription request body. */
  body: NewsletterSubscribeRequest
  path?: never
  query?: never
  url: '/newsletter/subscribe'
}

/**
 * API request data type for the POST /newsletter/unsubscribe endpoint.
 *
 * Manually defined because the code generator does not produce a Data type
 * for this endpoint. Follows the same pattern as SubscribeNewsletterData.
 */
export interface UnsubscribeNewsletterData {
  /** The newsletter unsubscription request body. */
  body: NewsletterUnsubscribeRequest
  path?: never
  query?: never
  url: '/newsletter/unsubscribe'
}
