// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * next-intl configuration
 * Reference: T124A (Configure next-intl message loading)
 */

import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// List of supported locales
const locales = ['en', 'it', 'he']

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  const locale = await requestLocale

  // Validate that the incoming locale is valid
  if (!locale || !locales.includes(locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'UTC',
    now: new Date(),
  }
})
