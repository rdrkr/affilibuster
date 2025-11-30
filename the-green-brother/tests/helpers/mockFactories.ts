// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Test Mock Factories
 *
 * Provides factory functions to create complete mock objects for testing.
 * All factories accept partial overrides to customize specific test scenarios.
 * Ensures type safety by providing all required fields from OpenAPI-generated types.
 */

import type { ApiCurrencyCurrencyDocument, ApiProductCategoryProductCategoryDocument } from '@/lib/generated/types.gen'
import {
  AlignmentEnum,
  CodeEnum,
  CurrencyCode,
  DirectionEnum,
  IconPositionEnum,
  SymbolPositionEnum,
} from '@/lib/generated/types.gen'
import type { Footer, Language, Navigation, Product } from '@/lib/types'

/**
 * Creates a mock Footer object with all required fields.
 * Accepts partial overrides for test customization.
 * @param overrides - Partial Footer object to override default values
 * @returns Complete Footer object suitable for testing
 * @example
 * const footer = createMockFooter({ copyrightText: 'Custom copyright' })
 */
export function createMockFooter(overrides: Partial<Footer> = {}): Footer {
  return {
    copyrightsLabel: {
      text: '© 2025 TheGreenBrother. All rights reserved.',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Copyright notice',
    },
    quickLinks: [],
    columns: [],
    seoMetadata: {
      metaTitle: 'Use mocks',
      metaDescription: 'Use mocks',
    },
    ...overrides,
  }
}

/**
 * Creates a mock Navigation object with all required fields.
 * Accepts partial overrides for test customization.
 * @param overrides - Partial Navigation object to override default values
 * @returns Complete Navigation object suitable for testing
 * @example
 * const nav = createMockNavigation({ brandName: 'Custom Brand' })
 */
export function createMockNavigation(overrides: Partial<Navigation> = {}): Navigation {
  return {
    siteTitle: 'TheGreenBrother',
    siteDescription: 'Your guide to sustainable living',
    brandButton: {
      label: {
        icon: 'home',
        text: 'TheGreenBrother',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Go to homepage',
      },
      url: '/',
      openInNewTab: false,
    },
    homeButton: {
      label: {
        icon: 'home',
        text: 'Home',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Go to home page',
      },
      url: '/',
      openInNewTab: false,
    },
    productsMenu: {
      menuButton: {
        label: {
          icon: 'shopping_bag',
          text: 'Products',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Browse products',
        },
        url: '/products',
        openInNewTab: false,
      },
    },
    blogButton: {
      label: {
        icon: 'article',
        text: 'Blog',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Read blog posts',
      },
      url: '/blog',
      openInNewTab: false,
    },
    aboutButton: {
      label: {
        icon: 'info',
        text: 'About',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Learn about us',
      },
      url: '/about',
      openInNewTab: false,
    },
    searchMenu: {
      menuButton: {
        label: {
          icon: 'search',
          text: 'Search',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Search products',
        },
        url: '#',
        openInNewTab: false,
      },
      textBoxPlaceholderLabel: {
        text: 'Search products...',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Enter search query',
      },
      recentSearchesLabel: {
        text: 'Recent Searches',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Your recent searches',
      },
      nowTrendingLabel: {
        text: 'Now Trending',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Trending searches',
      },
      viewAllResultsButton: {
        label: {
          icon: 'arrow_forward',
          text: 'View All Results',
          iconPosition: IconPositionEnum.AFTER_TEXT,
          ariaDescription: 'View all search results',
        },
        url: '#',
        openInNewTab: false,
      },
    },
    themeMenu: {
      menuButton: {
        label: {
          icon: 'dark_mode',
          text: 'Theme',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Change theme',
        },
        url: '#',
        openInNewTab: false,
      },
    },
    languageMenu: {
      menuButton: {
        label: {
          icon: 'language',
          text: 'Language',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Change language',
        },
        url: '#',
        openInNewTab: false,
      },
    },
    loginButton: {
      label: {
        icon: 'login',
        text: 'Login',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Log in to your account',
      },
      url: '/login',
      openInNewTab: false,
    },
    mobileMenuButton: {
      openButton: {
        label: {
          icon: 'menu',
          text: 'Menu',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Open mobile menu',
        },
        url: '#',
        openInNewTab: false,
      },
      closeButton: {
        label: {
          icon: 'close',
          text: 'Close',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Close mobile menu',
        },
        url: '#',
        openInNewTab: false,
      },
    },
    seoMetadata: {
      metaTitle: 'TheGreenBrother',
      metaDescription: 'Sustainable products curated for you.',
    },
    ...overrides,
  }
}

/**
 * Creates a mock Currency document with all required fields.
 * Accepts partial overrides for test customization.
 * @param overrides - Partial Currency document to override default values
 * @returns Complete Currency document suitable for testing
 * @example
 * const currency = createMockCurrency({ code: 'EUR', symbol: '€' })
 */
export function createMockCurrency(overrides: Partial<ApiCurrencyCurrencyDocument> = {}): ApiCurrencyCurrencyDocument {
  return {
    documentId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    id: 1,
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimalPlaces: 2,
    symbolPosition: SymbolPositionEnum.BEFORE,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    exchangeRate: 1.0,
    seoMetadata: {
      metaTitle: 'USD',
      metaDescription: 'US Dollar',
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    publishedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

/**
 * Creates a mock Product Category document with all required fields.
 * Accepts partial overrides for test customization.
 * @param overrides - Partial Category document to override default values
 * @returns Complete Category document suitable for testing
 * @example
 * const category = createMockCategory({ name: 'Tech', slug: 'tech' })
 */
export function createMockCategory(
  overrides: Partial<ApiProductCategoryProductCategoryDocument> = {}
): ApiProductCategoryProductCategoryDocument {
  return {
    documentId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    id: 1,
    content: {
      text: 'Lifestyle',
      ariaDescription: 'Lifestyle category',
    },
    slug: 'lifestyle',
    publishedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  } as ApiProductCategoryProductCategoryDocument
}

/**
 * Creates a mock Product object with all required fields.
 * Accepts partial overrides for test customization.
 * @param overrides - Partial Product object to override default values
 * @returns Complete Product object suitable for testing
 * @example
 * const product = createMockProduct({ title: 'Test Product', price: 99.99 })
 */
export function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    documentId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    id: 1,
    slug: 'eco-friendly-reusable-water-bottle',
    content: {
      header: {
        alignment: AlignmentEnum.CENTER,
        header: {
          text: 'Eco-Friendly Reusable Water Bottle',
          ariaDescription: 'Product Name',
        },
        subheader: {
          text: 'Eco-friendly hydration solution',
          ariaDescription: 'Product Excerpt',
        },
      },
      content: 'A sustainable, BPA-free water bottle made from recycled materials.',
    },
    currency: createMockCurrency(),
    seoMetadata: {
      metaTitle: 'Eco-Friendly Water Bottle - Best Sustainable Choice',
      metaDescription: 'Read our review of the best eco-friendly reusable water bottle',
      metaKeywords: ['eco-friendly', 'sustainable', 'reusable', 'water bottle'],
    },
    affiliateButton: {
      label: {
        text: 'Buy Now',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Buy product',
      },
      url: 'https://example.com/affiliate-link',
      openInNewTab: true,
    },
    price: 29.99,
    category: createMockCategory(),
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    locale: CodeEnum.EN,
    ...overrides,
  } as Product
}

/**
 * Creates a mock Language object with all required fields.
 * Accepts partial overrides for test customization.
 * @param overrides - Partial Language object to override default values
 * @returns Complete Language object suitable for testing
 * @example
 * const lang = createMockLanguage({ code: CodeEnum.IT, displayName: 'Italian' })
 */
export function createMockLanguage(overrides: Partial<Language> = {}): Language {
  return {
    code: CodeEnum.EN,
    displayName: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
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
 * @returns Array of Language objects for en, it, and he
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
      flag: '🇬🇧',
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
      flag: '🇮🇹',
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
      flag: '🇮🇱',
      direction: DirectionEnum.RTL,
      urlPrefix: '/he',
      defaultCurrency: CurrencyCode.ILS,
      localeCode: 'he-IL',
      isDefault: false,
    }),
  ]
}
