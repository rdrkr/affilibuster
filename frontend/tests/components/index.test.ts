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
  Hero,
  Button,
  Card,
  Input,
  Textarea,
  Dropdown,
  Checkbox,
  Radio,
  ThemeSelector,
  JsonLd,
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

  it('should export Hero', () => {
    expect(Hero).toBeDefined()
  })

  it('should export Button', () => {
    expect(Button).toBeDefined()
  })

  it('should export Card', () => {
    expect(Card).toBeDefined()
  })

  it('should export Input', () => {
    expect(Input).toBeDefined()
  })

  it('should export Textarea', () => {
    expect(Textarea).toBeDefined()
  })

  it('should export Dropdown', () => {
    expect(Dropdown).toBeDefined()
  })

  it('should export Checkbox', () => {
    expect(Checkbox).toBeDefined()
  })

  it('should export Radio', () => {
    expect(Radio).toBeDefined()
  })

  it('should export ThemeSelector', () => {
    expect(ThemeSelector).toBeDefined()
  })

  it('should export JsonLd', () => {
    expect(JsonLd).toBeDefined()
  })
})
