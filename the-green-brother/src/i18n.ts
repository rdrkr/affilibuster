// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { LanguageCode } from '@/lib/generated/types.gen'
import type { AbstractIntlMessages } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(() => {
  // Provide a static locale for now, or implement logic to determine it
  const locale = LanguageCode.EN.toString()

  return {
    locale,
    messages: {} as AbstractIntlMessages,
  }
})
