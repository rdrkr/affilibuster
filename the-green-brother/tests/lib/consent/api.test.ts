// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for consent API module.
 *
 * Verifies CMS data fetching (consent page, categories) and
 * consent recording functionality with proper error handling.
 */

import * as apiClient from '@/lib/core/client'
import { getConsentCategories, getConsentPage, recordConsent } from '@/lib/consent/api'
import { ConsentAction, ConsentType } from '@/lib/generated/types.gen'

jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, options?: Record<string, unknown>) => ({ url, ...options })),
  getBaseUrl: jest.fn(() => 'https://localhost:8000/v1'),
  getSessionId: jest.fn(() => 'test-session-123'),
}))

const mockApiRequest = apiClient.apiRequest as jest.MockedFunction<typeof apiClient.apiRequest>
const mockCreateApiRequest = apiClient.createApiRequest as jest.MockedFunction<typeof apiClient.createApiRequest>
const mockGetBaseUrl = apiClient.getBaseUrl as jest.MockedFunction<typeof apiClient.getBaseUrl>
const mockGetSessionId = apiClient.getSessionId as jest.MockedFunction<typeof apiClient.getSessionId>

const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('getConsentPage', () => {
  it('should fetch consent page content with locale', async () => {
    const mockData = {
      data: {
        documentId: 'doc-1',
        id: 1,
        publishedAt: '2026-01-01T00:00:00Z',
        consentInformation: { content: 'Cookie info' },
        acceptAllButton: { url: '#', openInNewTab: false, label: { text: 'Accept All' } },
        rejectAllButton: { url: '#', openInNewTab: false, label: { text: 'Reject All' } },
        settingsButton: { url: '#', openInNewTab: false, label: { text: 'Settings' } },
        saveButton: { url: '#', openInNewTab: false, label: { text: 'Save' } },
      },
      meta: {},
    }
    mockApiRequest.mockResolvedValueOnce(mockData as unknown as Awaited<ReturnType<typeof apiClient.apiRequest>>)

    const result = await getConsentPage('en')

    expect(mockCreateApiRequest).toHaveBeenCalledWith('/consent', {
      query: { locale: 'en', customPopulate: 'nested' },
    })
    expect(mockApiRequest).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockData)
  })

  it('should fetch consent page for different locales', async () => {
    const mockData = { data: { documentId: 'doc-1', id: 1 }, meta: {} }
    mockApiRequest.mockResolvedValueOnce(mockData as unknown as Awaited<ReturnType<typeof apiClient.apiRequest>>)

    await getConsentPage('he')

    expect(mockCreateApiRequest).toHaveBeenCalledWith('/consent', {
      query: { locale: 'he', customPopulate: 'nested' },
    })
  })

  it('should return null and log error on failure', async () => {
    const error = new Error('Network error')
    mockApiRequest.mockRejectedValueOnce(error)

    const result = await getConsentPage('en')

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Failed to fetch consent page:', error)
  })
})

describe('getConsentCategories', () => {
  it('should fetch consent categories with locale', async () => {
    const mockData = {
      data: [
        { documentId: 'cat-1', id: 1, uid: 'necessary', required: true, content: { content: 'Required' } },
        { documentId: 'cat-2', id: 2, uid: 'analytics', required: false, content: { content: 'Analytics' } },
      ],
      meta: {},
    }
    mockApiRequest.mockResolvedValueOnce(mockData as unknown as Awaited<ReturnType<typeof apiClient.apiRequest>>)

    const result = await getConsentCategories('it')

    expect(mockCreateApiRequest).toHaveBeenCalledWith('/consent-categories', {
      query: { locale: 'it', customPopulate: 'nested' },
    })
    expect(result).toEqual(mockData)
  })

  it('should return null and log error on failure', async () => {
    const error = new Error('API error')
    mockApiRequest.mockRejectedValueOnce(error)

    const result = await getConsentCategories('en')

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Failed to fetch consent categories:', error)
  })
})

describe('recordConsent', () => {
  it('should post consent record to backend', async () => {
    const responseBody = { success: true, consentId: 'uuid-123', message: 'Recorded' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(responseBody),
    } as Response)

    const body = {
      consentType: ConsentType.COOKIE,
      action: ConsentAction.ACCEPT_ALL,
      categories: { necessary: true, analytics: true, marketing: true },
      consentVersion: '1.0',
    }

    const result = await recordConsent(body)

    expect(mockFetch).toHaveBeenCalledWith('https://localhost:8000/v1/consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': 'test-session-123',
      },
      body: JSON.stringify(body),
    })
    expect(result).toEqual(responseBody)
  })

  it('should omit session header when no session ID', async () => {
    mockGetSessionId.mockReturnValueOnce('')
    const responseBody = { success: true, consentId: 'uuid-456', message: 'Recorded' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(responseBody),
    } as Response)

    const body = {
      consentType: ConsentType.COOKIE,
      action: ConsentAction.REJECT_ALL,
      categories: { necessary: true },
    }

    await recordConsent(body)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('should return null and log error on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
    } as Response)

    const body = {
      consentType: ConsentType.COOKIE,
      action: ConsentAction.CUSTOM,
      categories: { necessary: true, analytics: false },
    }

    const result = await recordConsent(body)

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Failed to record consent:', expect.any(Error))
  })

  it('should return null and log error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'))

    const body = {
      consentType: ConsentType.COOKIE,
      action: ConsentAction.REVOKE,
      categories: { necessary: true },
    }

    const result = await recordConsent(body)

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Failed to record consent:', expect.any(Error))
  })

  it('should use correct base URL', async () => {
    mockGetBaseUrl.mockReturnValueOnce('https://api.example.com/v1')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, consentId: 'id', message: 'ok' }),
    } as Response)

    await recordConsent({
      consentType: ConsentType.COOKIE,
      action: ConsentAction.ACCEPT_ALL,
      categories: { necessary: true },
    })

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/v1/consent', expect.any(Object))
  })
})
