// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for proxy middleware configuration
 */

// Mock next-intl/middleware
jest.mock('next-intl/middleware', () => ({
  __esModule: true,
  default: jest.fn((config: unknown) => ({ mockMiddleware: true, config })),
}))

import { CodeEnum } from '@/lib/generated/types.gen'
import proxyMiddleware, { config } from '@/proxy'

describe('proxy middleware configuration', () => {
  it('should export a middleware function', () => {
    expect(proxyMiddleware).toBeDefined()
  })

  it('should create middleware with correct locales', () => {
    const middleware = proxyMiddleware as unknown as { mockMiddleware: boolean; config: { locales: string[] } }
    expect(middleware.config.locales).toEqual([CodeEnum.EN, CodeEnum.IT, CodeEnum.HE])
  })

  it('should have en as default locale', () => {
    const middleware = proxyMiddleware as unknown as { config: { defaultLocale: string } }
    expect(middleware.config.defaultLocale).toBe(CodeEnum.EN)
  })

  it('should export config with matcher pattern', () => {
    expect(config).toBeDefined()
    expect(config.matcher).toBeDefined()
    expect(Array.isArray(config.matcher)).toBe(true)
    expect(config.matcher[0]).toContain('(?!_next')
  })
})
