// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for proxy middleware configuration and CSP headers
 */

const mockHeaders = new Map<string, string>()
const mockResponse = {
  headers: {
    set: jest.fn((key: string, value: string) => mockHeaders.set(key, value)),
    get: jest.fn((key: string) => mockHeaders.get(key)),
  },
}

// Mock next-intl/middleware
jest.mock('next-intl/middleware', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn(() => mockResponse)),
}))

jest.mock('next/server', () => ({
  NextResponse: {},
}))

import { LanguageCode } from '@/lib/generated/types.gen'
import createMiddleware from 'next-intl/middleware'

describe('proxy middleware configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    mockHeaders.clear()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should create intl middleware with correct locales', () => {
    // Re-import triggers createMiddleware at module level
    jest.isolateModules(() => {
      require('@/proxy')
    })

    expect(createMiddleware).toHaveBeenCalledWith({
      locales: Object.values(LanguageCode),
      defaultLocale: LanguageCode.EN,
    })
  })

  it('should export config with matcher pattern', async () => {
    const proxyModule = await import('@/proxy')
    const { config: proxyConfig } = proxyModule

    expect(proxyConfig).toBeDefined()
    expect(proxyConfig.matcher).toBeDefined()
    expect(Array.isArray(proxyConfig.matcher)).toBe(true)
    expect(proxyConfig.matcher[0]).toContain('(?!_next')
  })

  it('should set CSP frame-ancestors header with default CMS URL', async () => {
    delete process.env.NEXT_PUBLIC_CMS_URL

    jest.resetModules()
    jest.mock('next-intl/middleware', () => ({
      __esModule: true,
      default: jest.fn(() => jest.fn(() => mockResponse)),
    }))
    jest.mock('next/server', () => ({
      NextResponse: {},
    }))

    const proxyModule = await import('@/proxy')
    const middleware = proxyModule.default
    const request = { url: 'http://localhost:3000/en' } as never

    middleware(request)

    expect(mockResponse.headers.set).toHaveBeenCalledWith(
      'Content-Security-Policy',
      "frame-ancestors 'self' https://localhost:1337"
    )
  })

  it('should set X-Frame-Options header with default CMS URL', async () => {
    delete process.env.NEXT_PUBLIC_CMS_URL

    jest.resetModules()
    jest.mock('next-intl/middleware', () => ({
      __esModule: true,
      default: jest.fn(() => jest.fn(() => mockResponse)),
    }))
    jest.mock('next/server', () => ({
      NextResponse: {},
    }))

    const proxyModule = await import('@/proxy')
    const middleware = proxyModule.default
    const request = { url: 'http://localhost:3000/en' } as never

    middleware(request)

    expect(mockResponse.headers.set).toHaveBeenCalledWith('X-Frame-Options', 'ALLOW-FROM https://localhost:1337')
  })

  it('should use NEXT_PUBLIC_CMS_URL env var when set', async () => {
    process.env.NEXT_PUBLIC_CMS_URL = 'https://cms.example.com'

    jest.resetModules()
    jest.mock('next-intl/middleware', () => ({
      __esModule: true,
      default: jest.fn(() => jest.fn(() => mockResponse)),
    }))
    jest.mock('next/server', () => ({
      NextResponse: {},
    }))

    const proxyModule = await import('@/proxy')
    const middleware = proxyModule.default
    const request = { url: 'http://localhost:3000/en' } as never

    middleware(request)

    expect(mockResponse.headers.set).toHaveBeenCalledWith(
      'Content-Security-Policy',
      "frame-ancestors 'self' https://cms.example.com"
    )
    expect(mockResponse.headers.set).toHaveBeenCalledWith('X-Frame-Options', 'ALLOW-FROM https://cms.example.com')
  })

  it('should return the response from intl middleware', async () => {
    jest.resetModules()
    jest.mock('next-intl/middleware', () => ({
      __esModule: true,
      default: jest.fn(() => jest.fn(() => mockResponse)),
    }))
    jest.mock('next/server', () => ({
      NextResponse: {},
    }))

    const proxyModule = await import('@/proxy')
    const middleware = proxyModule.default
    const request = { url: 'http://localhost:3000/en' } as never

    const result = middleware(request)

    expect(result).toBe(mockResponse)
  })
})
