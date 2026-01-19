// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Core API Client Tests
 *
 * Tests for the core API client infrastructure including:
 * - apiRequest function
 * - createApiRequest helper
 * - getBaseUrl function
 * - getSessionId function
 * - Error handling
 */

import { ApiError, apiRequest, createApiRequest, getBaseUrl, getSessionId } from '@/lib/core/client'
import { CodeEnum } from '@/lib/generated/types.gen'

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

describe('getBaseUrl', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return NEXT_PUBLIC_API_URL when defined', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/v1'
    const url = getBaseUrl()
    expect(url).toBe('https://api.example.com/v1')
  })

  it('should return default localhost URL when NEXT_PUBLIC_API_URL is undefined', () => {
    delete process.env.NEXT_PUBLIC_API_URL
    const url = getBaseUrl()
    expect(url).toBe('http://localhost:8000/v1')
  })

  it('should return localhost URL by default in browser', () => {
    delete process.env.NEXT_PUBLIC_API_URL
    const url = getBaseUrl()
    // The function returns default localhost URL
    expect(url).toBe('http://localhost:8000/v1')
  })
})

describe('getSessionId', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('should return existing session ID from localStorage', () => {
    const existingSessionId = 'session_12345_abcdef'
    localStorageMock.setItem('affilibuster_session_id', existingSessionId)

    const sessionId = getSessionId()
    expect(sessionId).toBe(existingSessionId)
    expect(localStorageMock.getItem).toHaveBeenCalledWith('affilibuster_session_id')
  })

  it('should generate and store new session ID if none exists', () => {
    const sessionId = getSessionId()

    expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('affilibuster_session_id', sessionId)
  })

  // Note: Testing server-side behavior (typeof window === 'undefined') is not possible in Jest
  // as it always runs in a jsdom environment. This is tested in actual SSR scenarios.
})

describe('createApiRequest', () => {
  it('should create request object with URL filled in', () => {
    const request = createApiRequest('/homepage', {
      query: { locale: CodeEnum.EN, customPopulate: 'nested' },

    } as any)

    expect(request).toEqual({
      url: '/homepage',
      query: { locale: CodeEnum.EN, customPopulate: 'nested' },
    })
  })

  it('should create request object without query', () => {
    const request = createApiRequest('/homepage', {})

    expect(request).toEqual({
      url: '/homepage',
    })
  })

  it('should create request object with query parameters', () => {

    const request = createApiRequest('/products', { query: { customPopulate: 'nested' } } as any)

    expect(request).toEqual({
      url: '/products',
      query: { customPopulate: 'nested' },
    })
  })

  it('should create request object with path parameters', () => {
    const request = createApiRequest('/products/product-1', { path: { slug: 'product-1' } })

    expect(request).toEqual({
      url: '/products/product-1',
      path: { slug: 'product-1' },
    })
  })
  it('should flatten nested filters in query', () => {
    const request = createApiRequest('/products', {
      query: {
        filters: {
          category: {
            name: {
              $eq: 'electronics',
            },
          },
        },
      },
    } as any)

    expect(request).toEqual({
      url: '/products',
      query: {
        'filters[category][name][$eq]': 'electronics',
      },
    })
  })

  it('should flatten nested pagination in query', () => {
    const request = createApiRequest('/products', {
      query: {
        pagination: {
          page: 1,
          pageSize: 10,
        },
      },
    } as any)

    expect(request).toEqual({
      url: '/products',
      query: {
        'pagination[page]': 1,
        'pagination[pageSize]': 10,
      },
    })
  })

  it('should flatten nested sort in query', () => {
    const request = createApiRequest('/products', {
      query: {
        sort: {
          name: 'asc',
        },
      },
    } as any)

    expect(request).toEqual({
      url: '/products',
      query: {
        'sort[name]': 'asc',
      },
    })
  })
})

describe('apiRequest', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    mockFetch.mockReset()
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('should make GET request with query params', async () => {
    const mockResponseData = { data: { title: 'Test Homepage' } }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponseData,
    } as Response)

    const request = createApiRequest('/homepage', {
      query: { locale: CodeEnum.EN, customPopulate: 'nested' },
    } as any)
    const response = await apiRequest(request)

    const callUrl = (mockFetch.mock.calls[0]?.[0] as string) || ''
    expect(callUrl).toContain('/homepage')
    expect(callUrl).toContain('locale=en')
    expect(callUrl).toContain('customPopulate=nested')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )
    expect(response).toEqual(mockResponseData)
  })

  it('should make request with query parameters', async () => {
    const mockResponseData = { data: [{ id: 1, title: 'Product 1' }] }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponseData,
    } as Response)


    const request = createApiRequest('/products', { query: { customPopulate: 'nested' } } as any)
    const response = await apiRequest(request)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/products?'),
      expect.objectContaining({
        method: 'GET',
      })
    )
    expect(response).toEqual(mockResponseData)
  })

  it('should include session ID in headers', async () => {
    const sessionId = 'session_test_12345'
    localStorageMock.setItem('affilibuster_session_id', sessionId)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    const request = createApiRequest('/homepage', {})
    await apiRequest(request)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Session-Id': sessionId,
        }),
      })
    )
  })

  it('should merge additional headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    const request = createApiRequest('/homepage', {})
    await apiRequest(request, {
      headers: {
        'X-Custom-Header': 'test-value',
      },
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Custom-Header': 'test-value',
        }),
      })
    )
  })

  it('should set credentials mode when specified', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    const request = createApiRequest('/homepage', {})
    await apiRequest(request, { credentials: 'include' })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        credentials: 'include',
      })
    )
  })

  it('should throw ApiError on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)

    const request = createApiRequest('/homepage', {})

    await expect(apiRequest(request)).rejects.toThrow(ApiError)
    await expect(apiRequest(request)).rejects.toThrow('Resource not found')
  })

  it('should provide user-friendly message for 401 on non-auth endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as Response)

    const request = createApiRequest('/profile', {})

    await expect(apiRequest(request)).rejects.toThrow('API request failed: Unauthorized')
  })

  it('should provide generic 401 message for non-auth endpoints', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as Response)

    const request = createApiRequest('/homepage', {})

    await expect(apiRequest(request)).rejects.toThrow('API request failed: Unauthorized')
  })

  it('should provide user-friendly message for 403', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    } as Response)

    const request = createApiRequest('/profile', {})

    await expect(apiRequest(request)).rejects.toThrow('Access forbidden')
  })

  it('should serialize array query params correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response)

    const request = createApiRequest('/products', {
      query: {
        fields: ['name', 'price', 'description'],
      },

    } as any)
    await apiRequest(request)

    const callUrl = (mockFetch.mock.calls[0]?.[0] as string) || ''
    expect(callUrl).toContain('fields=name')
    expect(callUrl).toContain('fields=price')
    expect(callUrl).toContain('fields=description')
  })

  it('should serialize object query params as JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response)


    const request = createApiRequest('/products', {
      query: {
        metadata: { category: 'electronics', price: { $gte: 100 } },
      },

    } as any)
    await apiRequest(request)

    const callUrl = (mockFetch.mock.calls[0]?.[0] as string) || ''
    expect(callUrl).toContain('metadata=')
    expect(decodeURIComponent(callUrl)).toContain(JSON.stringify({ category: 'electronics', price: { $gte: 100 } }))
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const request = createApiRequest('/homepage', {})

    await expect(apiRequest(request)).rejects.toThrow('Network error')
  })

  it('should serialize number and boolean query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response)

    const request = createApiRequest('/products', {
      query: {
        page: 2,
        featured: true,
      },

    } as any)
    await apiRequest(request)

    const callUrl = (mockFetch.mock.calls[0]?.[0] as string) || ''
    expect(callUrl).toContain('page=2')
    expect(callUrl).toContain('featured=true')
  })

  it('should include headers from request object', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    const request = {
      url: '/products',
      headers: {
        'X-Custom-From-Request': 'value1',
      },
    } as unknown as Parameters<typeof apiRequest>[0]
    await apiRequest(request)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Custom-From-Request': 'value1',
        }),
      })
    )
  })

  it('should serialize request body as JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    const request = {
      url: '/auth/login',
      body: { email: 'test@example.com', password: 'secret' },
    } as unknown as Parameters<typeof apiRequest>[0]
    await apiRequest(request, { method: 'POST' })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'secret' }),
      })
    )
  })

  it('should provide login-specific message for 401 on /auth/login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as Response)

    const request = { url: '/auth/login' } as unknown as Parameters<typeof apiRequest>[0]

    await expect(apiRequest(request, { method: 'POST' })).rejects.toThrow('Invalid email or password')
  })

  it('should provide authentication-required message for 401 on other /auth endpoints', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as Response)

    const request = { url: '/auth/verify' } as unknown as Parameters<typeof apiRequest>[0]

    await expect(apiRequest(request)).rejects.toThrow('Authentication required')
  })

  it('should handle null and undefined values in query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response)

    const request = createApiRequest('/products', {
      query: {
        name: 'test',
        undefinedParam: undefined,
        nullParam: null,
      },

    } as any)
    await apiRequest(request)

    const callUrl = (mockFetch.mock.calls[0]?.[0] as string) || ''
    expect(callUrl).toContain('name=test')
    expect(callUrl).not.toContain('undefinedParam')
    expect(callUrl).not.toContain('nullParam')
  })

  it('should handle null items in array query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response)


    const request = createApiRequest('/products', {
      query: {
        fields: ['name', null, undefined, 'price'],
      },

    } as any)
    await apiRequest(request)

    const callUrl = (mockFetch.mock.calls[0]?.[0] as string) || ''
    expect(callUrl).toContain('fields=name')
    expect(callUrl).toContain('fields=price')
    // Should skip null and undefined in arrays
    expect(callUrl.match(/fields=/g)?.length).toBe(2)
  })

  it('should handle request with body set to undefined', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    const request = {
      url: '/auth/login',
      body: undefined,
    } as unknown as Parameters<typeof apiRequest>[0]
    await apiRequest(request, { method: 'POST' })

    const fetchCall = mockFetch.mock.calls[0]
    const fetchOptions = fetchCall![1]!
    // Body should not be set in fetchOptions when request.body is undefined
    expect(fetchOptions.body).toBeUndefined()
  })
  it('should ignore unsupported types in query params (symbol, function)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response)


    const request = createApiRequest('/products', {
      query: {
        valid: 'yes',
        sym: Symbol('test'),
        func: () => { console.log('test') },
      },

    } as any)
    await apiRequest(request)

    const callUrl = (mockFetch.mock.calls[0]?.[0] as string) || ''
    expect(callUrl).toContain('valid=yes')
    expect(callUrl).not.toContain('sym')
    expect(callUrl).not.toContain('func')
  })

  it('should pass cache and next options to fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    const request = createApiRequest('/homepage', {})
    await apiRequest(request, {
      cache: 'force-cache',
      next: { revalidate: 3600, tags: ['home'] },
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        cache: 'force-cache',
        next: { revalidate: 3600, tags: ['home'] },
      })
    )
  })

  it('should handle 404 Not Found error with specific message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)

    const request = createApiRequest('/missing', {})

    await expect(apiRequest(request)).rejects.toThrow('Resource not found')
  })
})

describe('ApiError', () => {
  it('should create ApiError with message, status, and response', () => {
    const mockResponse = { status: 404, statusText: 'Not Found' } as Response
    const error = new ApiError('Resource not found', 404, mockResponse)

    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('Resource not found')
    expect(error.status).toBe(404)
    expect(error.response).toBe(mockResponse)
  })

  it('should create ApiError without status and response', () => {
    const error = new ApiError('Unknown error')

    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('Unknown error')
    expect(error.status).toBeUndefined()
    expect(error.response).toBeUndefined()
  })

  it('should be instanceof Error and ApiError', () => {
    const error = new ApiError('Test error')

    expect(error instanceof Error).toBe(true)
    expect(error instanceof ApiError).toBe(true)
  })
})
