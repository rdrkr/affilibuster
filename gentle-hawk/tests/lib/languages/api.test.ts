// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getLanguages } from '@/lib/languages/api'

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

describe('getLanguages', () => {
  it('returns languages data on success', async () => {
    const mockData = [{ code: 'en', name: 'English' }]
    apiRequest.mockResolvedValue(mockData)

    const result = await getLanguages()
    expect(result).toEqual(mockData)
  })

  it('returns null on error', async () => {
    apiRequest.mockRejectedValue(new Error('fail'))

    const result = await getLanguages()
    expect(result).toBeNull()
  })
})
