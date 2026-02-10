// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for i18n configuration
 */

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getRequestConfig: jest.fn((configFn: () => unknown) => configFn),
}))

import i18nConfig from '@/i18n'
import { LanguageCode } from '@/lib/generated/types.gen'

describe('i18n configuration', () => {
  it('should export a valid configuration function', () => {
    expect(i18nConfig).toBeDefined()
  })

  it('should return locale en by default', () => {
    const config = i18nConfig as unknown as () => { locale: string; messages: Record<string, unknown> }
    const result = config()
    expect(result.locale).toBe(LanguageCode.EN)
  })

  it('should return empty messages object by default', () => {
    const config = i18nConfig as unknown as () => { locale: string; messages: Record<string, unknown> }
    const result = config()
    expect(result.messages).toEqual({})
  })
})
