// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for locale-aware layout component
 */

import { render, screen } from '@testing-library/react'

// Mock next-intl
jest.mock('next-intl', () => ({
  NextIntlClientProvider: function MockProvider({ children }: { children: React.ReactNode }) {
    return <div data-testid="intl-provider">{children}</div>
  },
}))

jest.mock('next-intl/server', () => ({
  getMessages: jest.fn().mockResolvedValue({}),
  setRequestLocale: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

// Mock Navigation component
jest.mock('@/components/navigation', () => ({
  __esModule: true,
  default: function MockNavigation() {
    return <nav data-testid="mock-navigation">Navigation</nav>
  },
}))

// Mock BackToTopButton component
jest.mock('@/components/navigation/BackToTopButton', () => ({
  __esModule: true,
  default: function MockBackToTop() {
    return <button data-testid="mock-back-to-top">Back to top</button>
  },
}))

// Mock Footer component
jest.mock('@/components/footer', () => ({
  __esModule: true,
  default: function MockFooter() {
    return <footer data-testid="mock-footer">Footer</footer>
  },
}))

// Mock CookieConsentBanner component
jest.mock('@/components/consent', () => ({
  CookieConsentBanner: function MockCookieConsentBanner() {
    return <div data-testid="mock-cookie-consent-banner">Cookie Consent</div>
  },
}))

// Mock the content and languages APIs
jest.mock('@/lib/content/api', () => ({
  getNavigation: jest.fn(),
}))

jest.mock('@/lib/languages/api', () => ({
  getLanguages: jest.fn(),
}))

// Mock feature flags
jest.mock('@/lib/feature-flags', () => ({
  productSearchFlag: jest.fn().mockResolvedValue(false),
  userProfileFlag: jest.fn().mockResolvedValue(false),
}))

import LocaleLayout from '@/app/[lang]/layout'
import { getNavigation } from '@/lib/content/api'
import { LanguageCode } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { notFound } from 'next/navigation'

const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>

describe('LocaleLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetNavigation.mockResolvedValue({
      siteTitle: 'Test',
      siteDescription: 'Test',
    } as unknown as Awaited<ReturnType<typeof getNavigation>>)
    mockGetLanguages.mockResolvedValue([{ code: LanguageCode.EN, name: 'English' }] as unknown as Awaited<
      ReturnType<typeof getLanguages>
    >)
  })

  it('should render children within the layout', async () => {
    const Component = await LocaleLayout({
      children: <div data-testid="child">Test Child</div>,
      params: Promise.resolve({ lang: LanguageCode.EN }),
    })

    render(Component)

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('should render navigation when data is available', async () => {
    const Component = await LocaleLayout({
      children: <div>Content</div>,
      params: Promise.resolve({ lang: LanguageCode.EN }),
    })

    render(Component)

    expect(screen.getByTestId('mock-navigation')).toBeInTheDocument()
  })

  it('should render footer', async () => {
    const Component = await LocaleLayout({
      children: <div>Content</div>,
      params: Promise.resolve({ lang: LanguageCode.EN }),
    })

    render(Component)

    expect(screen.getByTestId('mock-footer')).toBeInTheDocument()
  })

  it('should render back to top button', async () => {
    const Component = await LocaleLayout({
      children: <div>Content</div>,
      params: Promise.resolve({ lang: LanguageCode.EN }),
    })

    render(Component)

    expect(screen.getByTestId('mock-back-to-top')).toBeInTheDocument()
  })

  it('should render cookie consent banner', async () => {
    const Component = await LocaleLayout({
      children: <div>Content</div>,
      params: Promise.resolve({ lang: LanguageCode.EN }),
    })

    render(Component)

    expect(screen.getByTestId('mock-cookie-consent-banner')).toBeInTheDocument()
  })

  it('should call notFound for invalid language', async () => {
    await LocaleLayout({
      children: <div>Content</div>,
      params: Promise.resolve({ lang: 'invalid' as LanguageCode }),
    })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should not render navigation when data is null', async () => {
    mockGetNavigation.mockResolvedValue(null)

    const Component = await LocaleLayout({
      children: <div>Content</div>,
      params: Promise.resolve({ lang: LanguageCode.EN }),
    })

    render(Component)

    expect(screen.queryByTestId('mock-navigation')).not.toBeInTheDocument()
  })

  it('should wrap content with NextIntlClientProvider', async () => {
    const Component = await LocaleLayout({
      children: <div>Content</div>,
      params: Promise.resolve({ lang: LanguageCode.EN }),
    })

    render(Component)

    expect(screen.getByTestId('intl-provider')).toBeInTheDocument()
  })

  it('should support Italian locale', async () => {
    const Component = await LocaleLayout({
      children: <div data-testid="italian-child">Italian Content</div>,
      params: Promise.resolve({ lang: LanguageCode.IT }),
    })

    render(Component)

    expect(screen.getByTestId('italian-child')).toBeInTheDocument()
  })

  it('should support Hebrew locale', async () => {
    const Component = await LocaleLayout({
      children: <div data-testid="hebrew-child">Hebrew Content</div>,
      params: Promise.resolve({ lang: LanguageCode.HE }),
    })

    render(Component)

    expect(screen.getByTestId('hebrew-child')).toBeInTheDocument()
  })

  it('should handle null languages response gracefully', async () => {
    mockGetLanguages.mockResolvedValue(null)

    const Component = await LocaleLayout({
      children: <div data-testid="child">Content</div>,
      params: Promise.resolve({ lang: LanguageCode.EN }),
    })

    render(Component)

    // Should still render without errors
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
