// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the preview API route handler.
 * Tests secret validation, slug requirement, draft mode toggling,
 * redirect behavior, and SameSite cookie handling for Strapi content preview integration.
 */

/**
 * Minimal Response polyfill for jsdom test environment.
 * jsdom does not provide the Web API Response class needed by Next.js route handlers.
 */
class MockResponse {
  /** The response body text. */
  private readonly body: string

  /** The HTTP status code. */
  readonly status: number

  /**
   * Create a mock Response.
   * @param body - The response body string
   * @param init - Optional response init with status code
   * @param init.status - HTTP status code
   */
  constructor(body: string, init?: { status?: number }) {
    this.body = body
    this.status = init?.status ?? 200
  }

  /**
   * Read the response body as text.
   * @returns Promise resolving to the body string
   */
  async text(): Promise<string> {
    return this.body
  }
}

if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = MockResponse as unknown as typeof Response
}

const mockEnable = jest.fn()
const mockDisable = jest.fn()
const mockDraftMode = jest.fn().mockResolvedValue({
  enable: mockEnable,
  disable: mockDisable,
})

/** Mock cookie store data. */
const mockCookieMap = new Map<string, { value: string }>()
const mockCookies = jest.fn().mockResolvedValue({
  get: jest.fn((name: string) => mockCookieMap.get(name)),
})

/** Mock NextResponse.redirect cookies. */
interface MockRedirectCookie {
  /** Cookie name. */
  name: string
  /** Cookie value. */
  value: string
  /** Cookie options. */
  options: Record<string, unknown>
}

const mockRedirectCookies: MockRedirectCookie[] = []
const mockRedirectResponse = {
  status: 307,
  cookies: {
    set: jest.fn((name: string, value: string, options: Record<string, unknown>) => {
      mockRedirectCookies.push({ name, value, options })
    }),
  },
  headers: new Map(),
}

jest.mock('next/headers', () => ({
  draftMode: (...args: unknown[]) => mockDraftMode(...args),
  cookies: (...args: unknown[]) => mockCookies(...args),
}))

jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    /** The request URL. */
    url: string

    /**
     * Create a mock NextRequest.
     * @param input - URL string or URL object
     */
    constructor(input: string | URL) {
      this.url = typeof input === 'string' ? input : input.toString()
    }
  },
  NextResponse: {
    redirect: jest.fn(() => mockRedirectResponse),
  },
}))

import { GET } from '@/app/api/preview/route'
import { NextRequest, NextResponse } from 'next/server'

const VALID_SECRET = 'test-preview-secret'

/**
 * Create a NextRequest with the given query parameters.
 * @param params - URL search parameters to include in the request
 * @returns A NextRequest instance with the specified query parameters
 */
function createRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/preview')
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return new NextRequest(url)
}

describe('/api/preview route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    mockCookieMap.clear()
    mockRedirectCookies.length = 0
    process.env = { ...originalEnv, PREVIEW_SECRET: VALID_SECRET }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('GET', () => {
    it('should return 401 when secret is invalid', async () => {
      const request = createRequest({ secret: 'wrong-secret', slug: '/en/blog/test' })

      const response = await GET(request)

      expect(response.status).toBe(401)
      expect(await response.text()).toBe('Invalid token')
      expect(mockDraftMode).not.toHaveBeenCalled()
    })

    it('should return 401 when slug is missing', async () => {
      const request = createRequest({ secret: VALID_SECRET })

      const response = await GET(request)

      expect(response.status).toBe(401)
      expect(await response.text()).toBe('Invalid token')
      expect(mockDraftMode).not.toHaveBeenCalled()
    })

    it('should return 401 when both secret and slug are missing', async () => {
      const request = createRequest({})

      const response = await GET(request)

      expect(response.status).toBe(401)
      expect(await response.text()).toBe('Invalid token')
      expect(mockDraftMode).not.toHaveBeenCalled()
    })

    it('should enable draft mode and redirect for status=draft', async () => {
      mockCookieMap.set('__prerender_bypass', { value: 'bypass-token-123' })
      const request = createRequest({
        secret: VALID_SECRET,
        slug: '/en/blog/test-post',
        status: 'draft',
      })

      const response = await GET(request)

      expect(mockDraftMode).toHaveBeenCalled()
      expect(mockEnable).toHaveBeenCalledTimes(1)
      expect(mockDisable).not.toHaveBeenCalled()
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL(
          '/en/blog/test-post',
          'http://localhost:3000/api/preview?secret=test-preview-secret&slug=%2Fen%2Fblog%2Ftest-post&status=draft'
        )
      )
      expect(response).toBe(mockRedirectResponse)
    })

    it('should disable draft mode and redirect for status=published', async () => {
      const request = createRequest({
        secret: VALID_SECRET,
        slug: '/en/blog/test-post',
        status: 'published',
      })

      const response = await GET(request)

      expect(mockDraftMode).toHaveBeenCalled()
      expect(mockDisable).toHaveBeenCalledTimes(1)
      expect(mockEnable).not.toHaveBeenCalled()
      expect(NextResponse.redirect).toHaveBeenCalled()
      expect(response).toBe(mockRedirectResponse)
    })

    it('should enable draft mode when status is not provided', async () => {
      mockCookieMap.set('__prerender_bypass', { value: 'bypass-token-456' })
      const request = createRequest({
        secret: VALID_SECRET,
        slug: '/en/blog/test-post',
      })

      const response = await GET(request)

      expect(mockDraftMode).toHaveBeenCalled()
      expect(mockEnable).toHaveBeenCalledTimes(1)
      expect(mockDisable).not.toHaveBeenCalled()
      expect(response).toBe(mockRedirectResponse)
    })

    it('should set SameSite=None cookie when draft mode bypass cookie exists', async () => {
      mockCookieMap.set('__prerender_bypass', { value: 'bypass-token-789' })
      const request = createRequest({
        secret: VALID_SECRET,
        slug: '/en/blog/test-post',
        status: 'draft',
      })

      await GET(request)

      expect(mockRedirectResponse.cookies.set).toHaveBeenCalledWith('__prerender_bypass', 'bypass-token-789', {
        sameSite: 'none',
        secure: true,
        httpOnly: true,
        path: '/',
      })
    })

    it('should not set cookie when bypass cookie does not exist', async () => {
      const request = createRequest({
        secret: VALID_SECRET,
        slug: '/en/blog/test-post',
        status: 'draft',
      })

      await GET(request)

      expect(mockRedirectResponse.cookies.set).not.toHaveBeenCalled()
    })

    it('should not set SameSite cookie for published status', async () => {
      mockCookieMap.set('__prerender_bypass', { value: 'bypass-token-pub' })
      const request = createRequest({
        secret: VALID_SECRET,
        slug: '/en/blog/test-post',
        status: 'published',
      })

      await GET(request)

      // Published status disables draft mode, cookie override not needed
      expect(mockRedirectResponse.cookies.set).not.toHaveBeenCalled()
    })
  })
})
