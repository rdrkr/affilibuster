// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { LanguageCode } from '@/lib/generated/types.gen'
import type { AbstractIntlMessages } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? LanguageCode.EN.toString()

  return {
    locale,
    messages: {} as AbstractIntlMessages,
  }
})
