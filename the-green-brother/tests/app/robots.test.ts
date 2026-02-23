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

  it('should include sitemap URL using base URL from env or default', () => {
    const result = robots()
    const expectedBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thegreenbrother.com'
    expect(result.sitemap).toBe(`${expectedBase}/sitemap.xml`)
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
