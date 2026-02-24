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
}))

const mockApiRequest = apiClient.apiRequest as jest.MockedFunction<typeof apiClient.apiRequest>
const mockCreateApiRequest = apiClient.createApiRequest as jest.MockedFunction<typeof apiClient.createApiRequest>

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
  it('should post consent record via apiRequest', async () => {
    const responseBody = { success: true, consentId: 'uuid-123', message: 'Recorded' }
    mockApiRequest.mockResolvedValueOnce(responseBody as unknown as Awaited<ReturnType<typeof apiClient.apiRequest>>)

    const body = {
      consentType: ConsentType.COOKIE,
      action: ConsentAction.ACCEPT_ALL,
      categories: { necessary: true, analytics: true, marketing: true },
      consentVersion: '1.0',
    }

    const result = await recordConsent(body)

    expect(mockCreateApiRequest).toHaveBeenCalledWith('/consent', { body })
    expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/consent', body }), { method: 'POST' })
    expect(result).toEqual(responseBody)
  })

  it('should post consent record with reject all action', async () => {
    const responseBody = { success: true, consentId: 'uuid-456', message: 'Recorded' }
    mockApiRequest.mockResolvedValueOnce(responseBody as unknown as Awaited<ReturnType<typeof apiClient.apiRequest>>)

    const body = {
      consentType: ConsentType.COOKIE,
      action: ConsentAction.REJECT_ALL,
      categories: { necessary: true },
    }

    const result = await recordConsent(body)

    expect(mockCreateApiRequest).toHaveBeenCalledWith('/consent', { body })
    expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/consent', body }), { method: 'POST' })
    expect(result).toEqual(responseBody)
  })

  it('should return null and log error on API failure', async () => {
    const error = new Error('API request failed: Bad Request')
    mockApiRequest.mockRejectedValueOnce(error)

    const body = {
      consentType: ConsentType.COOKIE,
      action: ConsentAction.CUSTOM,
      categories: { necessary: true, analytics: false },
    }

    const result = await recordConsent(body)

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Failed to record consent:', error)
  })

  it('should return null and log error on network failure', async () => {
    const error = new Error('Network failure')
    mockApiRequest.mockRejectedValueOnce(error)

    const body = {
      consentType: ConsentType.COOKIE,
      action: ConsentAction.REVOKE,
      categories: { necessary: true },
    }

    const result = await recordConsent(body)

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Failed to record consent:', error)
  })
})
