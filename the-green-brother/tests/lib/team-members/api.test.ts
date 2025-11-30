// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for team-members API module
 */

import { apiRequest } from '@/lib/core/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import { getTeamMemberById, getTeamMembers } from '@/lib/team-members/api'

// Mock the core client module
jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, data: Record<string, unknown>) => ({ url, ...data })),
}))

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>

describe('team-members API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(
      /* no-op */ () => {
        return
      }
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getTeamMembers', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { data: [{ id: '1', name: 'John Doe' }] }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await getTeamMembers()

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/team-members',
          query: expect.objectContaining({ customPopulate: 'nested' }),
        })
      )
    })

    it('should pass query parameters with customPopulate', async () => {
      const mockResponse = { data: [] }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      await getTeamMembers({ locale: CodeEnum.EN })

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ locale: CodeEnum.EN, customPopulate: 'nested' }),
        })
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getTeamMembers()

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch team members:', error)
    })
  })

  describe('getTeamMemberById', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { data: { id: '1', name: 'John Doe' } }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await getTeamMemberById('member-123')

      expect(result).toEqual({ id: '1', name: 'John Doe' })
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/team-members/member-123',
          path: { id: 'member-123' },
          query: expect.objectContaining({ customPopulate: 'nested' }),
        })
      )
    })

    it('should pass query parameters with customPopulate', async () => {
      const mockResponse = { data: { id: '1' } }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      await getTeamMemberById('member-123', { locale: CodeEnum.IT })

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ locale: CodeEnum.IT, customPopulate: 'nested' }),
        })
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getTeamMemberById('member-456')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch team member member-456:', error)
    })
  })
})
