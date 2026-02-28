// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for i18n configuration
 */

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getRequestConfig: jest.fn(
    (configFn: (params: { requestLocale: Promise<string | undefined> }) => unknown) => configFn
  ),
}))

import i18nConfig from '@/i18n'
import { LanguageCode } from '@/lib/generated/types.gen'

/** Type for the i18n config function after mock unwrapping. */
type I18nConfigFn = (params: {
  requestLocale: Promise<string | undefined>
}) => Promise<{ locale: string; messages: Record<string, unknown> }>

describe('i18n configuration', () => {
  it('should export a valid configuration function', () => {
    expect(i18nConfig).toBeDefined()
  })

  it('should return the requestLocale when provided', async () => {
    const config = i18nConfig as unknown as I18nConfigFn
    const result = await config({ requestLocale: Promise.resolve('he') })
    expect(result.locale).toBe('he')
  })

  it('should fallback to en when requestLocale is undefined', async () => {
    const config = i18nConfig as unknown as I18nConfigFn
    const result = await config({ requestLocale: Promise.resolve(undefined) })
    expect(result.locale).toBe(LanguageCode.EN)
  })

  it('should return empty messages object', async () => {
    const config = i18nConfig as unknown as I18nConfigFn
    const result = await config({ requestLocale: Promise.resolve('en') })
    expect(result.messages).toEqual({})
  })
})
