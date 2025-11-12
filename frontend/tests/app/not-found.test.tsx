// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for 404 Not Found page
 * Tests both normal and edge cases including missing params
 */

import { render, screen } from '@testing-library/react'
import NotFoundPage from '@/app/[lang]/not-found'
import * as client from '@/lib/client'
import { CodeEnum, type ApiError404Error404Document } from '@/lib/generated/types.gen'
import { useAuth } from '@/lib/auth'
import { createMockNavigation } from '../helpers/mockFactories'

// Mock next-intl
jest.mock('next-intl', () => ({
  NextIntlClientProvider: jest.fn(({ children }: { children: React.ReactNode }): React.ReactNode => children),
  useLocale: jest.fn((): string => 'en'),
}))

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getMessages: jest.fn(() => Promise.resolve({})),
}))

// Mock the client module
jest.mock('@/lib/client', () => {
  const actual = jest.requireActual('@/lib/client')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...actual,
    getError404: jest.fn(),
    getNavigation: jest.fn(),
  }
})

// Mock useAuth hook and AuthProvider
jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
  AuthProvider: jest.fn(({ children }: { children: React.ReactNode }): React.ReactNode => children),
}))

describe('404 Not Found Page', () => {
  const mockError404Data: ApiError404Error404Document = {
    documentId: 'test-404-id',
    id: 1,
    entryTitle: '404 Error',
    title: 'Page Not Found',
    subtitle: 'Oops! The page you are looking for does not exist.',
    message: 'It might have been moved or deleted.',
    ctaText: 'Back to Home',
    secondaryCtaText: 'Browse Products',
    content: '<p>Additional help information</p>',
    metaTitle: '404 - Page Not Found',
    metaDescription: 'The requested page could not be found.',
    locale: CodeEnum.EN,
    publishedAt: '2024-01-01T00:00:00.000Z',
  }

  const mockNavigationData = createMockNavigation()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(client.getError404 as jest.Mock).mockResolvedValue(mockError404Data)
    ;(client.getNavigation as jest.Mock).mockResolvedValue(mockNavigationData)
    // Mock useAuth to return not authenticated state
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: jest.fn(),
    })
  })

  describe('Normal cases with params', () => {
    it('should render 404 heading', async () => {
      const component = await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('should render error title and messages from CMS', async () => {
      const component = await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
      expect(screen.getByText('Oops! The page you are looking for does not exist.')).toBeInTheDocument()
      expect(screen.getByText('It might have been moved or deleted.')).toBeInTheDocument()
    })

    it('should fetch error content with English locale when lang is "en"', async () => {
      await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })

      expect(client.getError404).toHaveBeenCalledWith(CodeEnum.EN)
    })

    it('should fetch error content with Italian locale when lang is "it"', async () => {
      await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.IT }) })

      expect(client.getError404).toHaveBeenCalledWith(CodeEnum.IT)
    })

    it('should fetch error content with Hebrew locale when lang is "he"', async () => {
      await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.HE }) })

      expect(client.getError404).toHaveBeenCalledWith(CodeEnum.HE)
    })

    it('should render link to homepage with correct language', async () => {
      const component = await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.IT }) })
      render(component)

      expect(screen.getByText('Back to Home')).toBeInTheDocument()
      // Link should have correct href
      const link = screen.getByRole('link', { name: /Back to Home/i })
      expect(link).toHaveAttribute('href', '/it')
    })

    it('should render link to products page with correct language', async () => {
      const component = await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.HE }) })
      render(component)

      expect(screen.getByText('Browse Products')).toBeInTheDocument()
      // Link should have correct href
      const link = screen.getByRole('link', { name: /Browse Products/i })
      expect(link).toHaveAttribute('href', '/he/products')
    })

    it('should render HTML content from CMS', async () => {
      const component = await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      const { container } = render(component)

      expect(screen.getByText('404')).toBeInTheDocument()
      const htmlContent = container.querySelector('.prose')
      expect(htmlContent).toBeInTheDocument()
      expect(htmlContent?.innerHTML).toContain('Additional help information')
    })
  })

  describe('Edge cases - Missing or invalid params', () => {
    it('should not crash when params is undefined', async () => {
      const component = await NotFoundPage({})
      render(component)

      expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('should fallback to English when params is undefined', async () => {
      await NotFoundPage({})

      // Should call getError404 with default CodeEnum.EN locale
      expect(client.getError404).toHaveBeenCalledWith(CodeEnum.EN)
    })

    it('should handle params promise that resolves to null', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = await NotFoundPage({ params: Promise.resolve(null as any) })
      render(component)

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(client.getError404).toHaveBeenCalledWith(CodeEnum.EN)
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })

    it('should handle params promise that resolves to undefined', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = await NotFoundPage({ params: Promise.resolve(undefined as any) })
      render(component)

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(client.getError404).toHaveBeenCalledWith(CodeEnum.EN)
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })

    it('should handle params promise that resolves without lang property', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = await NotFoundPage({ params: Promise.resolve({} as any) })
      render(component)

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(client.getError404).toHaveBeenCalledWith(CodeEnum.EN)
    })

    it('should handle params promise rejection', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const rejectingParams = Promise.reject(new Error('Params error'))

      const component = await NotFoundPage({ params: rejectingParams })
      render(component)

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(client.getError404).toHaveBeenCalledWith(CodeEnum.EN)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to resolve params:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Error handling for CMS data', () => {
    it('should handle getError404 failure gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(client.getError404 as jest.Mock).mockRejectedValue(new Error('CMS Error'))

      const component = await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch 404 error page:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })

    it('should handle null CMS data gracefully', async () => {
      ;(client.getError404 as jest.Mock).mockResolvedValue(null)

      const component = await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      render(component)

      expect(screen.getByText('404')).toBeInTheDocument()
      // CTA buttons should not render when data is null
      expect(screen.queryByText('Back to Home')).not.toBeInTheDocument()
    })
  })

  describe('Styling and structure', () => {
    it('should have proper styling classes', async () => {
      const component = await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      const { container } = render(component)

      expect(screen.getByText('404')).toBeInTheDocument()
      const mainDiv = container.firstChild
      expect(mainDiv).toHaveClass('min-h-screen')
      expect(mainDiv).toHaveClass('flex')
      expect(mainDiv).toHaveClass('flex-col')
    })

    it('should render gradient text for 404 number', async () => {
      const component = await NotFoundPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
      const { container } = render(component)

      expect(screen.getByText('404')).toBeInTheDocument()

      const heading = container.querySelector('.text-6xl')
      expect(heading).toHaveClass('text-transparent')
      expect(heading).toHaveClass('bg-clip-text')
      expect(heading).toHaveClass('bg-gradient-to-r')
    })
  })
})
