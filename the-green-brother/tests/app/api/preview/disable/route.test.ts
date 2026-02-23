// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the disable preview API route handler.
 * Tests that the GET handler properly disables draft mode
 * and returns a confirmation response.
 */

/**
 * Minimal Response polyfill for jsdom test environment.
 * jsdom does not provide the Web API Response class needed by Next.js route handlers.
 */
class MockResponse {
  /** The response body text. */
  private readonly body: string

  /** The HTTP status code. */
  readonly status: number

  /**
   * Create a mock Response.
   * @param body - The response body string
   * @param init - Optional response init with status code
   * @param init.status - HTTP status code
   */
  constructor(body: string, init?: { status?: number }) {
    this.body = body
    this.status = init?.status ?? 200
  }

  /**
   * Read the response body as text.
   * @returns Promise resolving to the body string
   */
  async text(): Promise<string> {
    return this.body
  }
}

if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = MockResponse as unknown as typeof Response
}

const mockDisable = jest.fn()
const mockDraftMode = jest.fn().mockResolvedValue({
  enable: jest.fn(),
  disable: mockDisable,
})

jest.mock('next/headers', () => ({
  draftMode: (...args: unknown[]) => mockDraftMode(...args),
}))

import { GET } from '@/app/api/preview/disable/route'

describe('/api/preview/disable route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should call draftMode disable', async () => {
      await GET()

      expect(mockDraftMode).toHaveBeenCalledTimes(1)
      expect(mockDisable).toHaveBeenCalledTimes(1)
    })

    it('should return response with "Draft mode disabled" body', async () => {
      const response = await GET()

      expect(await response.text()).toBe('Draft mode disabled')
    })
  })
})
