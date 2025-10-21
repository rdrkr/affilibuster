// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * i18n Request Configuration
 * Reference: next-intl v3 App Router setup
 * This file is required by next-intl to handle server-side i18n
 */

import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale parameter matches supported locales
  const supportedLocales = ['en', 'it', 'he']

  let validatedLocale = locale || 'en'

  if (!supportedLocales.includes(validatedLocale)) {
    console.warn(`Invalid locale requested: ${validatedLocale}, falling back to 'en'`)
    validatedLocale = 'en'
  }

  return {
    locale: validatedLocale,
    messages: {}, // Messages now come from Strapi CMS single types
  }
})
