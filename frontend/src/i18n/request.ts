// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * i18n Request Configuration
 * Reference: next-intl v3 App Router setup
 * This file is required by next-intl to handle server-side i18n
 */

import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale parameter matches supported locales
  const supportedLocales = ['en', 'it', 'he'];

  if (!supportedLocales.includes(locale)) {
    console.warn(`Invalid locale requested: ${locale}, falling back to 'en'`);
    locale = 'en';
  }

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
