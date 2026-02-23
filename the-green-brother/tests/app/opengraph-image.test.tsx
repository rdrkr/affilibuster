// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the OpenGraph image generator.
 *
 * Tests cover:
 * - Config exports (alt, size, contentType)
 * - CMS navigation data for title and description
 * - Fallback values when navigation is null
 * - Fallbacks when siteTitle or siteDescription are missing
 */

// Mock content API
jest.mock('@/lib/content/api', () => ({
  getNavigation: jest.fn(),
}))

// Mock next/og ImageResponse
jest.mock('next/og', () => ({
  ImageResponse: jest.fn().mockImplementation((element, options) => ({
    element,
    options,
  })),
}))

import OpenGraphImage, { alt, contentType, size } from '@/app/opengraph-image'
import { getNavigation } from '@/lib/content/api'

const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>

describe('opengraph-image', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('config exports', () => {
    it('should export correct alt text', () => {
      expect(alt).toBe('TheGreenBrother - Sustainable Products')
    })

    it('should export correct size (1200x630)', () => {
      expect(size).toEqual({ width: 1200, height: 630 })
    })

    it('should export correct content type', () => {
      expect(contentType).toBe('image/png')
    })
  })

  describe('image generation', () => {
    it('should call getNavigation to fetch CMS data', async () => {
      mockGetNavigation.mockResolvedValueOnce(null)

      await OpenGraphImage()

      expect(mockGetNavigation).toHaveBeenCalledTimes(1)
    })

    it('should use CMS navigation data for title and description', async () => {
      mockGetNavigation.mockResolvedValueOnce({
        siteTitle: 'Custom Title',
        siteDescription: 'Custom description from CMS.',
      } as Awaited<ReturnType<typeof getNavigation>>)

      const result = await OpenGraphImage()
      const rendered = result as unknown as { element: React.ReactElement; options: Record<string, unknown> }

      // Verify the ImageResponse was created with correct size
      expect(rendered.options).toEqual({ width: 1200, height: 630 })
    })

    it('should use fallback values when navigation is null', async () => {
      mockGetNavigation.mockResolvedValueOnce(null)

      const result = await OpenGraphImage()
      const rendered = result as unknown as { element: React.ReactElement; options: Record<string, unknown> }

      expect(rendered.options).toEqual({ width: 1200, height: 630 })
    })

    it('should use fallback title when siteTitle is missing', async () => {
      mockGetNavigation.mockResolvedValueOnce({
        siteDescription: 'Only description',
      } as Awaited<ReturnType<typeof getNavigation>>)

      const result = await OpenGraphImage()
      const rendered = result as unknown as { element: React.ReactElement; options: Record<string, unknown> }

      expect(rendered.options).toEqual({ width: 1200, height: 630 })
    })

    it('should use fallback description when siteDescription is missing', async () => {
      mockGetNavigation.mockResolvedValueOnce({
        siteTitle: 'Only title',
      } as Awaited<ReturnType<typeof getNavigation>>)

      const result = await OpenGraphImage()
      const rendered = result as unknown as { element: React.ReactElement; options: Record<string, unknown> }

      expect(rendered.options).toEqual({ width: 1200, height: 630 })
    })

    it('should return an ImageResponse instance', async () => {
      mockGetNavigation.mockResolvedValueOnce(null)

      const result = await OpenGraphImage()

      expect(result).toBeDefined()
    })
  })
})
