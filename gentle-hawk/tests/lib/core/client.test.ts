// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * GentleHawk API Client Tests
 *
 * Tests for the GentleHawk API client wrapper including:
 * - apiRequest function (delegates to shared client)
 * - createApiRequest helper
 * - getBaseUrl function
 * - getSessionId function
 * - Re-exported ApiError
 */

import { ApiError, apiRequest, createApiRequest, getBaseUrl, getSessionId } from '@/lib/core/client'

// Mock fetch globally
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('GentleHawk API Client', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    mockFetch.mockReset()
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  describe('apiRequest', () => {
    it('delegates to shared client and returns response', async () => {
      const mockResponseData = { data: 'test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseData,
      } as Response)

      const request = { url: '/test' } as any
      const result = await apiRequest(request)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'GET' })
      )
      expect(result).toEqual(mockResponseData)
    })

    it('passes options to underlying fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      const request = { url: '/test' } as any
      const options = { method: 'POST' as const }
      await apiRequest(request, options)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('createApiRequest', () => {
    it('creates request object with URL', () => {
      const result = createApiRequest('/homepage', { query: { locale: 'en' } } as any)

      expect(result).toEqual({ url: '/homepage', query: { locale: 'en' } })
    })
  })

  describe('re-exports', () => {
    it('re-exports getBaseUrl from shared client', () => {
      const url = getBaseUrl()
      // Default fallback when NEXT_PUBLIC_API_URL is not set
      expect(typeof url).toBe('string')
      expect(url).toContain('localhost:8000')
    })

    it('re-exports getSessionId from shared client', () => {
      const sessionId = getSessionId()
      expect(typeof sessionId).toBe('string')
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
    })

    it('re-exports ApiError class', () => {
      const error = new ApiError('Test error', 500)
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(500)
    })
  })
})
