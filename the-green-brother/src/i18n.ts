// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { CodeEnum } from '@/lib/generated/types.gen'
import type { AbstractIntlMessages } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(() => {
  // Provide a static locale for now, or implement logic to determine it
  const locale = CodeEnum.EN.toString()

  return {
    locale,
    messages: {} as AbstractIntlMessages,
  }
})
