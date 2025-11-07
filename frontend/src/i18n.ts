// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * next-intl configuration
 * Reference: T124A (Configure next-intl message loading)
 */

import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { isLanguageCode } from './lib/types'

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  const locale = await requestLocale

  // Validate that the incoming locale is valid
  if (!locale || !isLanguageCode(locale)) {
    notFound()
  }

  return {
    locale,
    messages: {}, // Messages now come from Strapi CMS single types
    timeZone: 'UTC',
    now: new Date(),
  }
})
