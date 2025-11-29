// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Test Mock Factories
 *
 * Provides factory functions to create complete mock objects for testing.
 * All factories accept partial overrides to customize specific test scenarios.
 * Ensures type safety by providing all required fields from OpenAPI-generated types.
 */

import type { Footer, Language, Navigation, Product } from '@/lib/types'
import { CodeEnum, CurrencyCode, DirectionEnum, TranslationStatusEnum } from '@/lib/generated/types.gen'

/**
 * Creates a mock Footer object with all required fields.
 * Accepts partial overrides for test customization.
 *
 * @param overrides - Partial Footer object to override default values
 * @returns Complete Footer object suitable for testing
 *
 * @example
 * const footer = createMockFooter({ copyrightText: 'Custom copyright' })
 */
export function createMockFooter(overrides: Partial<Footer> = {}): Footer {
  return {
    entryTitle: 'Footer Entry',
    brandDescription: 'Your trusted source for eco-friendly products and sustainable living tips.',
    quickLinksTitle: 'Quick Links',
    newsletterTitle: 'Subscribe to Newsletter',
    newsletterDescription: 'Get the latest updates on sustainable products delivered to your inbox.',
    subscribeButton: 'Subscribe',
    emailPlaceholder: 'Enter your email',
    copyrightText: '© 2025 EcoPicks. All rights reserved.',
    footerTagline: 'Making sustainable shopping easy and accessible',
    privacyPolicyLabel: 'Privacy Policy',
    termsOfServiceLabel: 'Terms of Service',
    contactLabel: 'Contact Us',
    aboutUsLabel: 'About Us',
    twitterAriaLabel: 'Follow us on Twitter',
    facebookAriaLabel: 'Follow us on Facebook',
    ...overrides,
  }
}

/**
 * Creates a mock Navigation object with all required fields.
 * Accepts partial overrides for test customization.
 *
 * @param overrides - Partial Navigation object to override default values
 * @returns Complete Navigation object suitable for testing
 *
 * @example
 * const nav = createMockNavigation({ brandName: 'Custom Brand' })
 */
export function createMockNavigation(overrides: Partial<Navigation> = {}): Navigation {
  return {
    entryTitle: 'Navigation Entry',
    brandName: 'EcoPicks',
    homeLabel: 'Home',
    productsLabel: 'Products',
    aboutLabel: 'About',
    contactLabel: 'Contact',
    languageSelectorLabel: 'Language',
    currencySelectorLabel: 'Currency',
    themeSelectorLabel: 'Theme',
    themeLightLabel: 'Light',
    themeDarkLabel: 'Dark',
    themeSystemLabel: 'System',
    mobileMenuLabel: 'Menu',
    mobileMenuCloseLabel: 'Close',
    ...overrides,
  }
}

/**
 * Creates a mock Product object with all required fields.
 * Accepts partial overrides for test customization.
 *
 * @param overrides - Partial Product object to override default values
 * @returns Complete Product object suitable for testing
 *
 * @example
 * const product = createMockProduct({ title: 'Test Product', price: 99.99 })
 */
export function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    documentId: 'test-product-id',
    id: 1,
    title: 'Eco-Friendly Reusable Water Bottle',
    slug: 'eco-friendly-reusable-water-bottle',
    content: 'A sustainable, BPA-free water bottle made from recycled materials.',
    currency: CurrencyCode.USD,
    featured: false,
    translationStatus: TranslationStatusEnum.COMPLETE,
    publishedAt: '2025-01-01T00:00:00.000Z',
    description: 'Sustainable reusable water bottle',
    excerpt: 'Eco-friendly hydration solution',
    metaTitle: 'Eco-Friendly Water Bottle - Best Sustainable Choice',
    metaDescription: 'Read our review of the best eco-friendly reusable water bottle',
    metaKeywords: ['eco-friendly', 'sustainable', 'reusable', 'water bottle'],
    affiliateUrl: 'https://example.com/affiliate-link',
    price: 29.99,
    category: 'lifestyle',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    locale: CodeEnum.EN,
    ...overrides,
  }
}

/**
 * Creates a mock Language object with all required fields.
 * Accepts partial overrides for test customization.
 *
 * @param overrides - Partial Language object to override default values
 * @returns Complete Language object suitable for testing
 *
 * @example
 * const lang = createMockLanguage({ code: CodeEnum.IT, displayName: 'Italian' })
 */
export function createMockLanguage(overrides: Partial<Language> = {}): Language {
  return {
    code: CodeEnum.EN,
    displayName: 'English',
    nativeName: 'English',
    direction: DirectionEnum.LTR,
    urlPrefix: '/en',
    defaultCurrency: CurrencyCode.USD,
    localeCode: 'en-US',
    isDefault: true,
    ...overrides,
  }
}

/**
 * Creates an array of mock Language objects for multi-language testing.
 * Useful for testing language selectors and switchers.
 *
 * @returns Array of Language objects for en, it, and he
 *
 * @example
 * const languages = createMockLanguages()
 * expect(languages).toHaveLength(3)
 */
export function createMockLanguages(): Language[] {
  return [
    createMockLanguage({
      code: CodeEnum.EN,
      displayName: 'English',
      nativeName: 'English',
      direction: DirectionEnum.LTR,
      urlPrefix: '/en',
      defaultCurrency: CurrencyCode.USD,
      localeCode: 'en-US',
      isDefault: true,
    }),
    createMockLanguage({
      code: CodeEnum.IT,
      displayName: 'Italian',
      nativeName: 'Italiano',
      direction: DirectionEnum.LTR,
      urlPrefix: '/it',
      defaultCurrency: CurrencyCode.EUR,
      localeCode: 'it-IT',
      isDefault: false,
    }),
    createMockLanguage({
      code: CodeEnum.HE,
      displayName: 'Hebrew',
      nativeName: 'עברית',
      direction: DirectionEnum.RTL,
      urlPrefix: '/he',
      defaultCurrency: CurrencyCode.ILS,
      localeCode: 'he-IL',
      isDefault: false,
    }),
  ]
}
