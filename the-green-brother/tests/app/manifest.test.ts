// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the web app manifest generator.
 *
 * Tests cover:
 * - CMS navigation data populating name/description
 * - Fallback values when navigation returns null
 * - Static properties (start_url, display, icons, colors)
 */

// Mock content API
jest.mock('@/lib/content/api', () => ({
  getNavigation: jest.fn(),
}))

import manifest from '@/app/manifest'
import { getNavigation } from '@/lib/content/api'

const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>

describe('manifest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should use CMS navigation data for name and description', async () => {
    mockGetNavigation.mockResolvedValueOnce({
      siteTitle: 'TheGreenBrother - Eco Shop',
      siteDescription: 'Sustainable products for a greener world.',
    } as Awaited<ReturnType<typeof getNavigation>>)

    const result = await manifest()

    expect(result.name).toBe('TheGreenBrother - Eco Shop')
    expect(result.short_name).toBe('TheGreenBrother - Eco Shop')
    expect(result.description).toBe('Sustainable products for a greener world.')
  })

  it('should use fallback values when navigation is null', async () => {
    mockGetNavigation.mockResolvedValueOnce(null)

    const result = await manifest()

    expect(result.name).toBe('TheGreenBrother')
    expect(result.short_name).toBe('TheGreenBrother')
    expect(result.description).toBe('Your trusted source for curated sustainable products.')
  })

  it('should use fallback title when navigation has no siteTitle', async () => {
    mockGetNavigation.mockResolvedValueOnce({
      siteDescription: 'Custom description',
    } as Awaited<ReturnType<typeof getNavigation>>)

    const result = await manifest()

    expect(result.name).toBe('TheGreenBrother')
    expect(result.description).toBe('Custom description')
  })

  it('should use fallback description when navigation has no siteDescription', async () => {
    mockGetNavigation.mockResolvedValueOnce({
      siteTitle: 'Custom Title',
    } as Awaited<ReturnType<typeof getNavigation>>)

    const result = await manifest()

    expect(result.name).toBe('Custom Title')
    expect(result.description).toBe('Your trusted source for curated sustainable products.')
  })

  it('should set start_url to /', async () => {
    mockGetNavigation.mockResolvedValueOnce(null)
    const result = await manifest()
    expect(result.start_url).toBe('/')
  })

  it('should set display to standalone', async () => {
    mockGetNavigation.mockResolvedValueOnce(null)
    const result = await manifest()
    expect(result.display).toBe('standalone')
  })

  it('should include favicon icon', async () => {
    mockGetNavigation.mockResolvedValueOnce(null)
    const result = await manifest()

    expect(result.icons).toBeDefined()
    expect(result.icons).toHaveLength(1)
    expect(result.icons?.[0]).toEqual({
      src: '/favicon.ico',
      sizes: 'any',
      type: 'image/x-icon',
    })
  })

  it('should include theme and background colors', async () => {
    mockGetNavigation.mockResolvedValueOnce(null)
    const result = await manifest()

    expect(result.background_color).toBe('#1e1e2e')
    expect(result.theme_color).toBe('#a6e3a1')
  })
})
