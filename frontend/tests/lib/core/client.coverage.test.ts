// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { ApiError, apiRequest, createApiRequest } from '@/lib/core/client'

// Mock fetch globally (though not used directly for createApiRequest testing)
global.fetch = jest.fn()

describe('Client Coverage Tests', () => {
  describe('flattenFilters edge cases', () => {
    it('should handle null/undefined values in filter objects', () => {
      // Cast the entire options object to any to bypass type checking for invalid properties
      const request = createApiRequest('/products', {
        query: {
          filters: {
            category: {
              name: {
                $eq: 'electronics',
                // These should be ignored or handled gracefully
                $null: null,
                $undefined: undefined,
              },
            },
            // Top level null/undefined
            ignored: null,
          },
        },
      } as any)

      // logic: null values are ignored in flattenFilters
      expect(request.query).toEqual({
        'filters[category][name][$eq]': 'electronics',
      })
    })

    it('should handle partial objects in filters', () => {
       const request = createApiRequest('/products', {
        query: {
         filters: {
           deep: {
             nested: {
               // non-object value
               val: 'value'
             }
           }
         }
        }
       } as any)
       expect(request.query).toEqual({
         'filters[deep][nested][val]': 'value',
       })
    })
  })

  describe('createApiRequest edge cases', () => {
     it('createApiRequest with undefined query', () => {
        const request = createApiRequest('/test', { query: undefined } as any)
        expect(request.url).toBe('/test')
        expect(request.query).toBeUndefined()
     })

     it('createApiRequest with empty filters', () => {
        const request = createApiRequest('/test', { query: { filters: {} } } as any)
        // Logic says: if (filters && Object.keys(filters).length > 0)
        // So it skips flattening.
        expect(request.query).toEqual({ filters: {} })
     })
  })
  describe('apiRequest edge cases', () => {
    it('should not append query string if all query params are undefined', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      const request = {
        url: '/test',
        query: { param: undefined },
      }

      await apiRequest(request as any)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/test$/), // Should NOT end with ? or ?param=
        expect.anything()
      )
    })

    it('should throw ApiError with correct message for 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      const request = { url: '/test' }

      await expect(apiRequest(request as any)).rejects.toThrow(ApiError)
      await expect(apiRequest(request as any)).rejects.toThrow('Resource not found')
    })
  })
})
