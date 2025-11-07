// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for components index exports
 * Ensures all exports are properly re-exported from the index
 */

import {
  LanguageSwitcher,
  CurrencySelector,
  LanguagePrompt,
  RTLWrapper,
  SEOHead,
  generateContentMetadata,
  generateSchemaMarkup,
  Navigation,
  Footer,
  Price,
  LocaleProvider,
  useLocale,
} from '@/components'

describe('Components Index', () => {
  it('should export LanguageSwitcher', () => {
    expect(LanguageSwitcher).toBeDefined()
  })

  it('should export CurrencySelector', () => {
    expect(CurrencySelector).toBeDefined()
  })

  it('should export LanguagePrompt', () => {
    expect(LanguagePrompt).toBeDefined()
  })

  it('should export RTLWrapper', () => {
    expect(RTLWrapper).toBeDefined()
  })

  it('should export SEOHead and related functions', () => {
    expect(SEOHead).toBeDefined()
    expect(generateContentMetadata).toBeDefined()
    expect(generateSchemaMarkup).toBeDefined()
  })

  it('should export Navigation', () => {
    expect(Navigation).toBeDefined()
  })

  it('should export Footer', () => {
    expect(Footer).toBeDefined()
  })

  it('should export Price', () => {
    expect(Price).toBeDefined()
  })

  it('should export LocaleProvider and useLocale', () => {
    expect(LocaleProvider).toBeDefined()
    expect(useLocale).toBeDefined()
  })
})
