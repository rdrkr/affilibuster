// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for the robots.txt generator.
 *
 * Tests cover:
 * - Crawl rules (allow/disallow)
 * - Sitemap URL generation
 */

import robots from '@/app/robots'

describe('robots', () => {
  it('should allow all user agents to crawl /', () => {
    const result = robots()
    expect(result.rules).toBeDefined()

    const rules = result.rules
    const singleRule = Array.isArray(rules) ? rules[0] : rules
    expect(singleRule?.userAgent).toBe('*')
    expect(singleRule?.allow).toBe('/')
  })

  it('should disallow auth and private paths', () => {
    const result = robots()

    const rules = result.rules
    const singleRule = Array.isArray(rules) ? rules[0] : rules
    const disallow = Array.isArray(singleRule?.disallow) ? singleRule.disallow : [singleRule?.disallow]

    expect(disallow).toContain('/*/login')
    expect(disallow).toContain('/*/signup')
    expect(disallow).toContain('/*/profile/')
    expect(disallow).toContain('/*/style-guide')
  })

  describe('environment variables', () => {
    const originalEnv = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should use custom NEXT_PUBLIC_SITE_URL', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-site.com'
      let robotsModule!: typeof import('@/app/robots').default
      jest.isolateModules(() => {
        robotsModule = require('@/app/robots').default
      })
      const result = robotsModule()
      expect(result.sitemap).toBe('https://custom-site.com/sitemap.xml')
    })

    it('should use fallback URL when NEXT_PUBLIC_SITE_URL is undefined', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL
      let robotsModule!: typeof import('@/app/robots').default
      jest.isolateModules(() => {
        robotsModule = require('@/app/robots').default
      })
      const result = robotsModule()
      expect(result.sitemap).toBe('https://thegreenbrother.com/sitemap.xml')
    })
  })

  it('should include sitemap URL ending with /sitemap.xml', () => {
    const result = robots()
    expect(result.sitemap).toContain('/sitemap.xml')
  })

  it('should return a valid MetadataRoute.Robots object', () => {
    const result = robots()
    expect(result).toHaveProperty('rules')
    expect(result).toHaveProperty('sitemap')
  })
})
