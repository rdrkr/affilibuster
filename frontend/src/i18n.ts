// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * next-intl configuration
 * Reference: T124A (Configure next-intl message loading)
 */

import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LANGUAGE_CODE, isLanguageCode } from './lib/types'

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale

  // Validate that the incoming locale is valid - fallback to default instead of notFound()
  // Note: notFound() is not allowed in i18n config as it can cause recursive errors
  // requestLocale will be undefined for pages outside [lang] segment (like root page.tsx, not-found.tsx)
  // This is expected behavior and not an error
  if (locale && !isLanguageCode(locale)) {
    // Only warn if locale was explicitly set but invalid
    console.warn(`Invalid locale in i18n config: ${locale}, falling back to '${DEFAULT_LANGUAGE_CODE}'`)
  }

  // Use nullish coalescing to set default locale
  locale ??= DEFAULT_LANGUAGE_CODE

  return {
    locale,
    messages: {}, // Messages now come from Strapi CMS single types
    timeZone: 'UTC',
    now: new Date(),
  }
})
