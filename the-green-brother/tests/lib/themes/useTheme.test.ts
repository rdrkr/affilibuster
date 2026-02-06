// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for useTheme hook
 */

import { act, renderHook } from '@testing-library/react'

import { useTheme } from '@/lib/themes/useTheme'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      store = Object.fromEntries(Object.entries(store).filter(([k]) => k !== key))
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  const listeners: ((e: MediaQueryListEvent) => void)[] = []

  const mediaQuery = {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        listeners.push(listener)
      }
    }),
    removeEventListener: jest.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }),
    dispatchEvent: jest.fn(),
    // Helper to simulate media query change
    _triggerChange: (newMatches: boolean) => {
      listeners.forEach(listener => {
        listener({ matches: newMatches } as MediaQueryListEvent)
      })
    },
  }

  window.matchMedia = jest.fn().mockReturnValue(mediaQuery)
  return mediaQuery
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
    mockMatchMedia(true) // Default to dark mode preference
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme')
  })

  it('should initialize with system theme as default', () => {
    const { result } = renderHook(() => useTheme())

    // Wait for useEffect to run
    expect(result.current.theme).toBe('system')
  })

  it('should load theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce('dark')

    const { result } = renderHook(() => useTheme())

    // After effect runs, theme should be loaded from storage
    expect(result.current.theme).toBe('dark')
  })

  it('should set theme and persist to localStorage', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.theme).toBe('light')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'light')
  })

  it('should apply data-theme attribute to document', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('should resolve system theme to dark when system prefers dark', () => {
    mockMatchMedia(true) // System prefers dark

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('system')
    })

    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('should resolve system theme to light when system prefers light', () => {
    mockMatchMedia(false) // System prefers light

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('system')
    })

    expect(result.current.resolvedTheme).toBe('light')
  })

  it('should update resolved theme when system preference changes', () => {
    const mediaQuery = mockMatchMedia(true) // Start with dark preference

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('system')
    })

    expect(result.current.resolvedTheme).toBe('dark')

    // Simulate system preference change to light
    act(() => {
      mediaQuery._triggerChange(false)
    })

    expect(result.current.resolvedTheme).toBe('light')
  })

  it('should not listen for system changes when not in system mode', () => {
    const mediaQuery = mockMatchMedia(true)

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    // Try to trigger system preference change
    act(() => {
      mediaQuery._triggerChange(false)
    })

    // Should still be dark since we're not in system mode
    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('should return isLoading as false after initialization', async () => {
    const { result } = renderHook(() => useTheme())

    // After effects run, isLoading should be false
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle invalid stored theme values', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid-theme')

    const { result } = renderHook(() => useTheme())

    // Should fall back to system
    expect(result.current.theme).toBe('system')
  })

  it('should apply theme on mount', () => {
    localStorageMock.getItem.mockReturnValueOnce('light')

    renderHook(() => useTheme())

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  describe('SSR fallbacks', () => {
    it('should handle getStoredTheme when window is undefined', () => {
      const originalWindow = globalThis.window
      // @ts-expect-error -- Testing SSR scenario where window is undefined
      delete globalThis.window

      // Re-require the module in SSR context
      jest.resetModules()

      const freshModule = require('@/lib/themes/useTheme')

      // Restore window before rendering hooks (renderHook needs DOM)
      globalThis.window = originalWindow

      // The module loaded in SSR context should still export correctly
      expect(freshModule.useTheme).toBeDefined()
    })

    it('should handle applyTheme when document is undefined', () => {
      const originalDocument = globalThis.document
      // @ts-expect-error -- Testing SSR scenario where document is undefined
      delete globalThis.document

      jest.resetModules()

      const freshModule = require('@/lib/themes/useTheme')

      globalThis.document = originalDocument

      expect(freshModule.useTheme).toBeDefined()
    })
  })
})
