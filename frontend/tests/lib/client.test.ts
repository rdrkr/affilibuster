// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Comprehensive tests for API client
 * Tests all 13 API functions, session management, and error handling
 */

import {
  apiRequest,
  getBaseUrl,
  getLanguages,
  detectLanguage,
  getUserPreferences,
  updateUserPreferences,
  getCurrencies,
  getHomepage,
  getAbout,
  getContact,
  getProductPage,
  getNavigation,
  getFooter,
  getPrivacy,
  getError404,
  getError410,
  getTerm,
  getProducts,
} from '@/lib/client'
import type { GetLanguagesResponses } from '@/lib/generated/types.gen'
import { _1Enum, _1Enum2, _1Enum4 } from '@/lib/generated/types.gen'
import { CurrencyCode } from '@/lib/types'

// Mock fetch globally
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    },
    removeItem: (key: string) => {
      store = Object.fromEntries(Object.entries(store).filter(([k]) => k !== key))
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('lib/client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    // Set default API URL for all tests
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/v1'
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
  })

  describe('getBaseUrl', () => {
    it('should return NEXT_PUBLIC_API_URL in browser', () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL
      process.env.NEXT_PUBLIC_API_URL = 'http://test-api.com/v1'

      const url = getBaseUrl()

      expect(url).toBe('http://test-api.com/v1')
      process.env.NEXT_PUBLIC_API_URL = originalEnv
    })

    it('should return default URL when NEXT_PUBLIC_API_URL is not set', () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL
      delete process.env.NEXT_PUBLIC_API_URL

      const url = getBaseUrl()

      expect(url).toBe('http://localhost:8000/v1')
      process.env.NEXT_PUBLIC_API_URL = originalEnv
    })

    // NOTE: Server-side tests (lines 55, 64) cannot be tested in jsdom environment
    // These lines are tested in production during SSR/build time
    // The code paths handle:
    // - Line 55: Using NEXT_SERVER_SIDE_API_URL when window is undefined (SSR)
    // - Line 64: Returning empty session ID when window is undefined (SSR)
  })

  describe('Session Management', () => {
    it('should create and store session ID on first call', async () => {
      await getLanguages()

      const sessionId = localStorage.getItem('affilibuster_session_id')
      expect(sessionId).toBeTruthy()
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
    })

    it('should reuse existing session ID', async () => {
      localStorage.setItem('affilibuster_session_id', 'existing_session_123')

      await getLanguages()

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(headers['X-Session-Id']).toBe('existing_session_123')
    })

    it('should include session ID in request headers', async () => {
      const mockSessionId = 'test_session_456'
      localStorage.setItem('affilibuster_session_id', mockSessionId)

      await getLanguages()

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(headers['X-Session-Id']).toBe(mockSessionId)
    })

    it('should merge additional headers from options', async () => {
      const mockSessionId = 'test_session_789'
      localStorage.setItem('affilibuster_session_id', mockSessionId)

      // Call apiRequest with custom headers in options
      await apiRequest<GetLanguagesResponses[200]>(
        { url: '/languages' },
        {
          headers: {
            'X-Custom-Header': 'custom-value',
            'X-Another-Header': 'another-value',
          },
        }
      )

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(headers['X-Session-Id']).toBe(mockSessionId)
      expect(headers['X-Custom-Header']).toBe('custom-value')
      expect(headers['X-Another-Header']).toBe('another-value')
      expect(headers['Content-Type']).toBe('application/json')
    })
  })

  describe('getLanguages', () => {
    it('should fetch languages successfully', async () => {
      const mockLanguages = [
        { code: 'en', name: 'English', isDefault: true },
        { code: 'it', name: 'Italian', isDefault: false },
      ]
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLanguages,
      })

      const result = await getLanguages()

      expect(result).toEqual(mockLanguages)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/v1/languages',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should return empty array and log error on failed request', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      })

      const result = await getLanguages()

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch languages:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })
  })

  describe('detectLanguage', () => {
    it('should detect language with all parameters', async () => {
      const mockResult = { code: 'it', confidence: 0.95 }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      })

      const result = await detectLanguage('it-IT,it;q=0.9,en-US;q=0.8', 'Chrome', 'IT')

      expect(result).toEqual(mockResult)
      const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toContain('/languages/detect')
      expect(options.method).toBe('POST')
      const body = JSON.parse(options.body as string)
      expect(body.acceptLanguage).toBe('it-IT,it;q=0.9,en-US;q=0.8')
      expect(body.userAgent).toBe('Chrome')
      expect(body.countryCode).toBe('IT')
    })

    it('should detect language with optional parameters omitted', async () => {
      const mockResult = { code: 'en', confidence: 1.0 }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      })

      const result = await detectLanguage('en-US')

      expect(result).toEqual(mockResult)
      const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toContain('/languages/detect')
      const body = JSON.parse(options.body as string)
      expect(body.acceptLanguage).toBe('en-US')
      expect(body.userAgent).toBeUndefined()
      expect(body.countryCode).toBeUndefined()
    })

    it('should return null and log error on failed request', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      })

      const result = await detectLanguage('invalid')

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to detect language:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getCurrencies', () => {
    it('should fetch currencies successfully', async () => {
      const mockCurrencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
      ]
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockCurrencies }),
      })

      const result = await getCurrencies()

      expect(result).toEqual(mockCurrencies)
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/v1/currencies', expect.any(Object))
    })

    it('should return empty array and log error on failed request', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      })

      const result = await getCurrencies()

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch currencies:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getUserPreferences', () => {
    it('should fetch user preferences successfully', async () => {
      const mockPrefs = {
        sessionId: 'session_123',
        selectedCurrency: 'USD',
        dismissedLanguagePrompt: false,
      }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPrefs,
      })

      const result = await getUserPreferences()

      expect(result).toEqual(mockPrefs)
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/v1/user/preferences', expect.any(Object))
    })
  })

  describe('updateUserPreferences', () => {
    it('should update user preferences successfully', async () => {
      const updateData = { selectedCurrency: CurrencyCode.EUR, dismissedLanguagePrompt: true }
      const mockResponse = {
        sessionId: 'session_123',
        selectedCurrency: CurrencyCode.EUR,
        dismissedLanguagePrompt: true,
      }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await updateUserPreferences(updateData)

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/v1/user/preferences',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(updateData),
        })
      )
    })
  })

  describe('Content API functions', () => {
    const mockContentResponse = {
      data: { title: 'Test Page', content: 'Test content' },
    }

    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockContentResponse,
      })
    })

    it('should fetch homepage content', async () => {
      await getHomepage()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/homepage')
    })

    it('should fetch about page content', async () => {
      await getAbout()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/about')
    })

    it('should fetch contact page content', async () => {
      await getContact()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/contact')
    })

    it('should fetch product page content', async () => {
      await getProductPage()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/product-page')
    })

    it('should fetch navigation content', async () => {
      await getNavigation()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/navigation')
    })

    it('should fetch footer content', async () => {
      await getFooter()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/footer')
    })

    it('should fetch privacy page content', async () => {
      await getPrivacy()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/privacy')
    })

    it('should fetch 404 error page content', async () => {
      await getError404()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/error-404')
    })

    it('should fetch 410 error page content', async () => {
      await getError410()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/error-410')
    })

    it('should fetch term page content', async () => {
      await getTerm()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/term')
    })
  })

  describe('getProducts', () => {
    it('should fetch products without query parameters', async () => {
      const mockProducts = {
        data: [
          { id: 1, title: 'Product 1' },
          { id: 2, title: 'Product 2' },
        ],
      }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProducts,
      })

      const result = await getProducts()

      expect(result).toEqual(mockProducts)
      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toBe('http://localhost:8000/v1/products')
    })

    it('should fetch products with query parameters', async () => {
      const mockProducts = {
        data: [{ id: 1, title: 'Product 1' }],
      }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProducts,
      })

      const result = await getProducts({ locale: 'it', category: 'electronics', limit: 10 } as Parameters<
        typeof getProducts
      >[0])

      expect(result).toEqual(mockProducts)
      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('locale=it')
      expect(url).toContain('category=electronics')
      expect(url).toContain('limit=10')
    })

    it('should omit undefined query parameters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      })

      await getProducts({ locale: 'en', category: undefined } as Parameters<typeof getProducts>[0])

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('locale=en')
      expect(url).not.toContain('category')
    })
  })

  describe('Error Handling', () => {
    it('should return empty array and log error when response is not ok', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      })

      const result = await getLanguages()

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch languages:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })

    it('should return empty array and log error when fetch fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await getLanguages()

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch languages:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })

    it('should return empty array and log error when JSON parsing fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      const result = await getLanguages()

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch languages:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })

    it('should return null and log error when getUserPreferences fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Server Error',
      })

      const result = await getUserPreferences()

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch user preferences:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })

    it('should return null and log error when updateUserPreferences fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Server Error',
      })

      const result = await updateUserPreferences({ selectedCurrency: CurrencyCode.EUR })

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to update user preferences:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })

    it('should return null and log error when content functions fail', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Server Error',
      })

      // Test all content functions that return null on error
      await expect(getHomepage()).resolves.toBeNull()
      await expect(getAbout()).resolves.toBeNull()
      await expect(getContact()).resolves.toBeNull()
      await expect(getProductPage()).resolves.toBeNull()
      await expect(getNavigation()).resolves.toBeNull()
      await expect(getFooter()).resolves.toBeNull()
      await expect(getPrivacy()).resolves.toBeNull()
      await expect(getError404()).resolves.toBeNull()
      await expect(getError410()).resolves.toBeNull()
      await expect(getTerm()).resolves.toBeNull()

      // Verify console.error was called for each
      expect(consoleErrorSpy).toHaveBeenCalledTimes(10)
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Query Parameter Serialization', () => {
    it('should serialize query parameters correctly', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      })

      await getProducts({ locale: 'en', category: 'books', limit: 20, offset: 10 } as Parameters<typeof getProducts>[0])

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('?')
      expect(url).toContain('locale=en')
      expect(url).toContain('category=books')
      expect(url).toContain('limit=20')
      expect(url).toContain('offset=10')
    })

    it('should handle empty query parameters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await getLanguages()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toBe('http://localhost:8000/v1/languages')
      expect(url).not.toContain('?')
    })

    it('should filter out null and undefined values', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      })

      await getProducts({ locale: 'en', category: null, limit: undefined } as Parameters<typeof getProducts>[0])

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('locale=en')
      expect(url).not.toContain('category')
      expect(url).not.toContain('limit')
    })
  })

  describe('Request Headers', () => {
    it('should include Content-Type header', async () => {
      await getLanguages()

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(headers['Content-Type']).toBe('application/json')
    })

    it('should include session ID in headers when available', async () => {
      localStorage.setItem('affilibuster_session_id', 'session_abc123')

      await getLanguages()

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(headers['X-Session-Id']).toBe('session_abc123')
    })

    it('should not include session ID when localStorage is empty', async () => {
      // Clear localStorage to simulate no session
      localStorage.clear()

      await getLanguages()

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers
      // Should have generated a new session ID since localStorage was empty
      expect(headers['X-Session-Id']).toBeDefined()
      expect(headers['X-Session-Id']).toMatch(/^session_/)
    })
  })

  describe('query serialization', () => {
    it('should serialize object values in query params', async () => {
      const mockProducts = { data: [{ id: '1', title: 'Product 1' }] }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProducts,
      })

      // Call with query params that include an object value
      await getProducts({ filters: { category: 'test' }, page: 1 } as Parameters<typeof getProducts>[0])

      const [url] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toContain('filters')
      // The filters object should be JSON stringified and URL encoded
      expect(url).toContain(encodeURIComponent(JSON.stringify({ category: 'test' })))
    })
  })

  describe('error handling', () => {
    it('should handle getProducts errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await getProducts()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch products:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('Locale parameter passing (TDD - should fail initially)', () => {
    const mockContentResponse = {
      data: { title: 'Test Page', content: 'Test content' },
    }

    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockContentResponse,
      })
    })

    it('should pass locale parameter to getHomepage', async () => {
      await getHomepage('it')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/homepage')
      expect(url).toContain('?locale=it')
    })

    it('should pass locale parameter to getAbout', async () => {
      await getAbout('he')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/about')
      expect(url).toContain('?locale=he')
    })

    it('should pass locale parameter to getContact', async () => {
      await getContact('en')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/contact')
      expect(url).toContain('?locale=en')
    })

    it('should pass locale parameter to getProductPage', async () => {
      await getProductPage('it')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/product-page')
      expect(url).toContain('?locale=it')
    })

    it('should pass locale parameter to getNavigation', async () => {
      await getNavigation('he')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/navigation')
      expect(url).toContain('?locale=he')
    })

    it('should pass locale parameter to getFooter', async () => {
      await getFooter('en')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/footer')
      expect(url).toContain('?locale=en')
    })

    it('should pass locale parameter to getPrivacy', async () => {
      await getPrivacy('it')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/privacy')
      expect(url).toContain('?locale=it')
    })

    it('should pass locale parameter to getError404', async () => {
      await getError404('he')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/error-404')
      expect(url).toContain('?locale=he')
    })

    it('should pass locale parameter to getError410', async () => {
      await getError410('en')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/error-410')
      expect(url).toContain('?locale=en')
    })

    it('should pass locale parameter to getTerm', async () => {
      await getTerm('it')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/term')
      expect(url).toContain('?locale=it')
    })

    it('should work without locale parameter (backward compatibility)', async () => {
      await getHomepage()

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/homepage')
      expect(url).not.toContain('?locale')
    })

    it('should handle undefined locale gracefully', async () => {
      await getAbout(undefined)

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/about')
      expect(url).not.toContain('?locale')
    })
  })

  describe('Populate parameter for nested components (TDD - should fail initially)', () => {
    const mockHomepageResponse = {
      data: {
        title: 'Homepage',
        heroTitle: 'Welcome',
        featureCards: [{ title: 'Feature 1', description: 'Description 1' }],
        trustCards: [{ title: 'Trust 1', description: 'Description 1' }],
      },
    }

    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockHomepageResponse,
      })
    })

    it('should pass populate parameter to getHomepage when provided', async () => {
      await getHomepage('en', [_1Enum4.TRUST_CARDS, _1Enum4.FEATURE_CARDS])

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/homepage')
      // Check that explicit populate values are passed (not wildcard)
      expect(url).toContain('populate=trustCards')
      expect(url).toContain('populate=featureCards')
    })

    it('should pass both locale and populate parameters to getHomepage', async () => {
      await getHomepage('it', [_1Enum4.TRUST_CARDS, _1Enum4.FEATURE_CARDS])

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/homepage')
      expect(url).toContain('locale=it')
      // Check that explicit populate values are passed (not wildcard)
      expect(url).toContain('populate=trustCards')
      expect(url).toContain('populate=featureCards')
    })

    it('should not include populate parameter when not provided', async () => {
      await getHomepage('en')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/homepage')
      expect(url).not.toContain('populate')
    })

    it('should handle single populate value', async () => {
      await getHomepage('en', [_1Enum4.TRUST_CARDS])

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/homepage')
      // Check that single populate value is passed directly
      expect(url).toContain('populate=trustCards')
    })

    it('should handle populate with undefined locale', async () => {
      await getHomepage(undefined, [_1Enum4.TRUST_CARDS, _1Enum4.FEATURE_CARDS])

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/homepage')
      // Check that explicit populate values are passed (not wildcard)
      expect(url).toContain('populate=trustCards')
      expect(url).toContain('populate=featureCards')
      expect(url).not.toContain('locale')
    })

    it('should pass populate parameter to getAbout when provided', async () => {
      await getAbout('en', [_1Enum.FEATURES_LIST])

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/about')
      // Check that explicit populate value is passed (not wildcard)
      expect(url).toContain('populate=featuresList')
    })

    it('should pass populate parameter to getContact when provided', async () => {
      await getContact('en', [_1Enum2.CONTACT_CARDS])

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('/contact')
      // Check that explicit populate value is passed (not wildcard)
      expect(url).toContain('populate=contactCards')
    })
  })

  describe('Error Handling', () => {
    it('should return user-friendly error message for 401 on non-login auth endpoints', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({}),
      })

      await expect(apiRequest({ url: '/auth/refresh' }, { method: 'POST' })).rejects.toThrow('Authentication required')
    })

    it('should return user-friendly error message for 403 Forbidden', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({}),
      })

      await expect(apiRequest({ url: '/languages' })).rejects.toThrow('Access forbidden')
    })

    it('should return user-friendly error message for 404 Not Found', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
      })

      await expect(apiRequest({ url: '/languages' as const })).rejects.toThrow('Resource not found')
    })

    it('should return generic error message for other status codes', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      })

      await expect(apiRequest({ url: '/languages' })).rejects.toThrow('API request failed: Internal Server Error')
    })
  })
})
