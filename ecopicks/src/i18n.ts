// Copyright (c) 2025 Affilibuster by Ronen Druker.

import type { AbstractIntlMessages } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  // Provide a static locale for now, or implement logic to determine it
  const locale = 'en'

  return {
    locale,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    messages: (await import(`../messages/${locale}.json`)).default as AbstractIntlMessages,
  }
})
