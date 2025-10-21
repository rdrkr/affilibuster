// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for LocaleProvider component
 */

import { render, screen, waitFor, renderHook } from '@testing-library/react'
import { LocaleProvider, useLocale } from '@/components/LocaleProvider'
import { languagesAPI } from '@/lib/api'
import { Language } from '@/types/api'

// Mock API
jest.mock('@/lib/api', () => ({
  languagesAPI: {
    getAll: jest.fn(),
  },
}))

const mockLanguagesAPI = languagesAPI as jest.Mocked<typeof languagesAPI>

describe('LocaleProvider', () => {
  const mockLanguages: Language[] = [
    {
      code: 'en',
      displayName: 'English',
      nativeName: 'English',
      direction: 'ltr',
      urlPrefix: '/en',
      defaultCurrency: 'USD',
      isDefault: true,
    },
    {
      code: 'he',
      displayName: 'Hebrew',
      nativeName: 'עברית',
      direction: 'rtl',
      urlPrefix: '/he',
      defaultCurrency: 'ILS',
      isDefault: false,
    },
    {
      code: 'it',
      displayName: 'Italian',
      nativeName: 'Italiano',
      direction: 'ltr',
      urlPrefix: '/it',
      defaultCurrency: 'EUR',
      isDefault: false,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default locale', async () => {
      mockLanguagesAPI.getAll.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      expect(result.current.locale).toBe('en')
    })

    it('should initialize with custom locale', async () => {
      mockLanguagesAPI.getAll.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider initialLocale="it">{children}</LocaleProvider>,
      })

      expect(result.current.locale).toBe('it')
    })

    it('should default to ltr direction before language loads', () => {
      mockLanguagesAPI.getAll.mockReturnValue(new Promise(() => {})) // Never resolves

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      expect(result.current.direction).toBe('ltr')
    })
  })

  describe('language loading', () => {
    it('should fetch language details on mount', async () => {
      mockLanguagesAPI.getAll.mockResolvedValue(mockLanguages)

      renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(mockLanguagesAPI.getAll).toHaveBeenCalled()
      })
    })

    it('should set language from API response', async () => {
      mockLanguagesAPI.getAll.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.language).toEqual(mockLanguages[0])
      })
    })

    it('should set rtl direction for Hebrew', async () => {
      mockLanguagesAPI.getAll.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider initialLocale="he">{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.direction).toBe('rtl')
      })
    })

    it('should set ltr direction for Italian', async () => {
      mockLanguagesAPI.getAll.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider initialLocale="it">{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.direction).toBe('ltr')
      })
    })
  })

  describe('setLocale', () => {
    it('should update locale when setLocale is called', async () => {
      mockLanguagesAPI.getAll.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.locale).toBe('en')
      })

      result.current.setLocale('it')

      await waitFor(() => {
        expect(result.current.locale).toBe('it')
      })
    })

    it('should update language when locale changes', async () => {
      mockLanguagesAPI.getAll.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.language?.code).toBe('en')
      })

      result.current.setLocale('he')

      await waitFor(() => {
        expect(result.current.language?.code).toBe('he')
      })
    })

    it('should update direction when changing to rtl language', async () => {
      mockLanguagesAPI.getAll.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.direction).toBe('ltr')
      })

      result.current.setLocale('he')

      await waitFor(() => {
        expect(result.current.direction).toBe('rtl')
      })
    })
  })

  describe('error handling', () => {
    it('should handle API error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockLanguagesAPI.getAll.mockRejectedValue(new Error('API error'))

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled()
      })

      expect(result.current.language).toBeNull()
      consoleSpy.mockRestore()
    })

    it('should handle missing language in API response', async () => {
      mockLanguagesAPI.getAll.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider initialLocale="fr">{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.language).toBeNull()
      })

      expect(result.current.direction).toBe('ltr')
    })
  })

  describe('children rendering', () => {
    it('should render children', async () => {
      mockLanguagesAPI.getAll.mockResolvedValue(mockLanguages)

      render(
        <LocaleProvider>
          <div data-testid="child">Test Child</div>
        </LocaleProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })
  })

  describe('useLocale hook', () => {
    it('should provide default context when used outside provider', () => {
      const { result } = renderHook(() => useLocale())

      // Context has default values, so it doesn't throw
      expect(result.current.locale).toBe('en')
      expect(result.current.direction).toBe('ltr')
    })
  })
})
