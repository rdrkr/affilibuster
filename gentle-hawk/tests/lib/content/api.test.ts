// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getHomepage, getNavigation, getFooter, getError404 } from '@/lib/content/api'

jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((_url: string, data: Record<string, unknown>) => ({
    url: _url,
    ...data,
  })),
}))

const { apiRequest } = jest.requireMock<{ apiRequest: jest.Mock }>('@/lib/core/client')

let savedConsoleError: typeof console.error

beforeEach(() => {
  savedConsoleError = console.error
  console.error = jest.fn()
})

afterEach(() => {
  console.error = savedConsoleError
  jest.clearAllMocks()
})

describe('Content API', () => {
  describe('getHomepage', () => {
    it('returns homepage data on success', async () => {
      const mockData = { sections: [] }
      apiRequest.mockResolvedValue({ data: mockData })

      const result = await getHomepage('en')
      expect(result).toBe(mockData)
    })

    it('returns null on error', async () => {
      apiRequest.mockRejectedValue(new Error('fail'))

      const result = await getHomepage('en')
      expect(result).toBeNull()
    })

    it('passes locale and customPopulate', async () => {
      apiRequest.mockResolvedValue({ data: {} })

      await getHomepage('it')
      expect(apiRequest).toHaveBeenCalled()
    })

    it('works without locale', async () => {
      apiRequest.mockResolvedValue({ data: {} })

      await getHomepage()
      expect(apiRequest).toHaveBeenCalled()
    })

    it('passes additional params', async () => {
      apiRequest.mockResolvedValue({ data: {} })

      await getHomepage('en', { status: 'draft' as any })
      expect(apiRequest).toHaveBeenCalled()
    })
  })

  describe('getNavigation', () => {
    it('returns navigation data on success', async () => {
      const mockData = { siteTitle: 'GentleHawk' }
      apiRequest.mockResolvedValue({ data: mockData })

      const result = await getNavigation('en')
      expect(result).toBe(mockData)
    })

    it('returns null on error', async () => {
      apiRequest.mockRejectedValue(new Error('fail'))

      const result = await getNavigation('en')
      expect(result).toBeNull()
    })

    it('works without locale', async () => {
      apiRequest.mockResolvedValue({ data: {} })

      await getNavigation()
      expect(apiRequest).toHaveBeenCalled()
    })
  })

  describe('getFooter', () => {
    it('returns footer data on success', async () => {
      const mockData = { columns: [] }
      apiRequest.mockResolvedValue({ data: mockData })

      const result = await getFooter('en')
      expect(result).toBe(mockData)
    })

    it('returns null on error', async () => {
      apiRequest.mockRejectedValue(new Error('fail'))

      const result = await getFooter('en')
      expect(result).toBeNull()
    })

    it('works without locale', async () => {
      apiRequest.mockResolvedValue({ data: {} })

      await getFooter()
      expect(apiRequest).toHaveBeenCalled()
    })
  })

  describe('getError404', () => {
    it('returns error page data on success', async () => {
      const mockData = { content: {} }
      apiRequest.mockResolvedValue({ data: mockData })

      const result = await getError404('en')
      expect(result).toBe(mockData)
    })

    it('returns null on error', async () => {
      apiRequest.mockRejectedValue(new Error('fail'))

      const result = await getError404('en')
      expect(result).toBeNull()
    })

    it('works without locale', async () => {
      apiRequest.mockResolvedValue({ data: {} })

      await getError404()
      expect(apiRequest).toHaveBeenCalled()
    })
  })
})
