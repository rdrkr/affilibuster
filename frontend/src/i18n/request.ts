// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * i18n Request Configuration
 * Reference: next-intl v3 App Router setup
 * This file is required by next-intl to handle server-side i18n
 */

import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LANGUAGE_CODE, isLanguageCode, type LanguageCode } from '@/lib/types'

export default getRequestConfig(({ locale }) => {
  // Validate that the incoming locale parameter matches supported locales
  let validatedLocale: LanguageCode = locale ? (locale as LanguageCode) : DEFAULT_LANGUAGE_CODE

  if (!isLanguageCode(validatedLocale)) {
    console.warn(`Invalid locale requested: ${String(validatedLocale)}, falling back to '${DEFAULT_LANGUAGE_CODE}'`)
    validatedLocale = DEFAULT_LANGUAGE_CODE
  }

  return {
    locale: validatedLocale,
    messages: {}, // Messages now come from Strapi CMS single types
  }
})
