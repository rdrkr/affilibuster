// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for the health check API route
 */

import { GET } from '@/app/api/health/route'

// Mock NextResponse
jest.mock('next/server', () => {
  const mockJsonFn = jest.fn((data: unknown) => ({
    status: 200,
    json: async (): Promise<unknown> => data,
    data,
  }))
  return {
    NextResponse: {
      json: mockJsonFn,
    },
  }
})

// Import NextResponse to get the mock reference
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { NextResponse } = require('next/server')

describe('/api/health route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return a healthy status', () => {
      const response = GET()

      expect(NextResponse.json).toHaveBeenCalledTimes(1)
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
        })
      )
      expect(response).toBeDefined()
    })

    it('should return a timestamp in ISO format', () => {
      const mockDate = new Date('2025-01-01T12:00:00.000Z')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate)

      GET()

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: '2025-01-01T12:00:00.000Z',
        })
      )

      jest.restoreAllMocks()
    })

    it('should return JSON response', () => {
      const result = GET()

      expect(result).toBeDefined()
      expect(result).toHaveProperty('data')
    })
  })
})
