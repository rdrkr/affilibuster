// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for LocaleProvider component
 */
import { CodeEnum, DirectionEnum } from '@/lib/generated/types.gen'
import { CurrencyCode } from '@/lib/types'

import { render, screen, waitFor, renderHook } from '@testing-library/react'
import { LocaleProvider, useLocale } from '@/components/LocaleProvider'
import * as client from '@/lib/client'
import type { Language } from '@/lib/types'

// Mock API
jest.mock('@/lib/client', () => ({
  getLanguages: jest.fn(),
}))

const mockGetLanguages = client.getLanguages as jest.MockedFunction<typeof client.getLanguages>

describe('LocaleProvider', () => {
  const mockLanguages: Language[] = [
    {
      code: CodeEnum.EN,
      displayName: 'English',
      nativeName: 'English',
      direction: DirectionEnum.LTR,
      urlPrefix: '/en',
      defaultCurrency: CurrencyCode.USD,
      localeCode: 'en-US',
      isDefault: true,
    },
    {
      code: CodeEnum.HE,
      displayName: 'Hebrew',
      nativeName: 'עברית',
      direction: DirectionEnum.RTL,
      urlPrefix: '/he',
      defaultCurrency: CurrencyCode.ILS,
      localeCode: 'he-IL',
      isDefault: false,
    },
    {
      code: CodeEnum.IT,
      displayName: 'Italian',
      nativeName: 'Italiano',
      direction: DirectionEnum.LTR,
      urlPrefix: '/it',
      defaultCurrency: CurrencyCode.EUR,
      localeCode: 'it-IT',
      isDefault: false,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default locale', () => {
      mockGetLanguages.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      expect(result.current.locale).toBe(CodeEnum.EN)
    })

    it('should initialize with custom locale', () => {
      mockGetLanguages.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider initialLocale="it">{children}</LocaleProvider>,
      })

      expect(result.current.locale).toBe(CodeEnum.IT)
    })

    it('should default to ltr direction before language loads', () => {
      // Mock promise that never resolves to test loading state
      mockGetLanguages.mockReturnValue(
        new Promise<never>(() => {
          // Intentionally empty - testing loading/pending state
        })
      )

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      expect(result.current.direction).toBe('ltr')
    })
  })

  describe('language loading', () => {
    it('should fetch language details on mount', async () => {
      mockGetLanguages.mockResolvedValue(mockLanguages)

      renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(mockGetLanguages).toHaveBeenCalled()
      })
    })

    it('should set language from API response', async () => {
      mockGetLanguages.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.language).toEqual(mockLanguages[0])
      })
    })

    it('should set rtl direction for Hebrew', async () => {
      mockGetLanguages.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider initialLocale="he">{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.direction).toBe('rtl')
      })
    })

    it('should set ltr direction for Italian', async () => {
      mockGetLanguages.mockResolvedValue(mockLanguages)

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
      mockGetLanguages.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.locale).toBe(CodeEnum.EN)
      })

      result.current.setLocale(CodeEnum.IT)

      await waitFor(() => {
        expect(result.current.locale).toBe(CodeEnum.IT)
      })
    })

    it('should update language when locale changes', async () => {
      mockGetLanguages.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.language?.code).toBe(CodeEnum.EN)
      })

      result.current.setLocale(CodeEnum.HE)

      await waitFor(() => {
        expect(result.current.language?.code).toBe(CodeEnum.HE)
      })
    })

    it('should update direction when changing to rtl language', async () => {
      mockGetLanguages.mockResolvedValue(mockLanguages)

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => <LocaleProvider>{children}</LocaleProvider>,
      })

      await waitFor(() => {
        expect(result.current.direction).toBe('ltr')
      })

      result.current.setLocale(CodeEnum.HE)

      await waitFor(() => {
        expect(result.current.direction).toBe('rtl')
      })
    })
  })

  describe('error handling', () => {
    it('should handle API error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockGetLanguages.mockRejectedValue(new Error('API error'))

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
      mockGetLanguages.mockResolvedValue(mockLanguages)

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
    it('should render children', () => {
      mockGetLanguages.mockResolvedValue(mockLanguages)

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
      expect(result.current.locale).toBe(CodeEnum.EN)
      expect(result.current.direction).toBe('ltr')
    })

    it('should call default setLocale without throwing when used outside provider', () => {
      const { result } = renderHook(() => useLocale())

      // Default setLocale is a no-op but should not throw
      expect(() => {
        result.current.setLocale('it')
      }).not.toThrow()

      // Locale should not change since default setLocale is a no-op
      expect(result.current.locale).toBe(CodeEnum.EN)
    })
  })
})
