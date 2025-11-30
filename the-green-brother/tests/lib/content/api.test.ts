// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Content API Tests
 *
 * Tests for all content API wrapper functions including:
 * - Single-type content (Homepage, About, Contact, etc.)
 * - Collection types (Products, BlogPosts, Authors, etc.)
 * - Upload operations (Files)
 * - Language operations (Locales)
 */

import {
  getAbout,
  getAuthorById,
  getAuthors,
  getAuthPage,
  getBlog,
  getBlogPostById,
  getBlogPosts,
  getContactUs,
  getError404,
  getError410,
  getFaq,
  getFileById,
  getFiles,
  getFooter,
  getHomepage,
  getNavigation,
  getPrivacy,
  getProductById,
  getProductCategories,
  getProductCategoriesPage,
  getProductCategoryById,
  getProducts,
  getProfile,
  getTerm,
} from '@/lib/content/api'
import * as apiClient from '@/lib/core/client'
import { CodeEnum } from '@/lib/generated/types.gen'

// Mock the apiRequest and createApiRequest functions
jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, options?: Record<string, unknown>) => ({ url, ...options })),
}))

const mockApiRequest = apiClient.apiRequest as jest.MockedFunction<typeof apiClient.apiRequest>
const mockCreateApiRequest = apiClient.createApiRequest as jest.MockedFunction<typeof apiClient.createApiRequest>

describe('Content API - Single Types', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getHomepage', () => {
    it('should fetch homepage without params', async () => {
      const mockData = { documentId: 'abc', id: 1, entryTitle: 'Homepage', publishedAt: '2025-01-01' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getHomepage()

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/homepage', {
        query: { customPopulate: 'nested' },
      })
      expect(mockApiRequest).toHaveBeenCalled()
      expect(result).toEqual(mockData)
    })

    it('should fetch homepage with locale', async () => {
      const mockData = { documentId: 'abc', id: 1, entryTitle: 'Home', publishedAt: '2025-01-01' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getHomepage(CodeEnum.IT.toString())

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/homepage', {
        query: { locale: CodeEnum.IT, customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should fetch homepage with locale and populate', async () => {
      const mockData = { documentId: 'abc', id: 1, entryTitle: 'Homepage', publishedAt: '2025-01-01' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getHomepage(CodeEnum.EN)
      expect(mockCreateApiRequest).toHaveBeenCalledWith('/homepage', {
        query: { locale: CodeEnum.EN, customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('Network error'))

      const result = await getHomepage()

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch homepage:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getAbout', () => {
    it('should fetch about page without params', async () => {
      const mockData = { title: 'About Us', description: 'We are...' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getAbout()

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/about', { query: { customPopulate: 'nested' } })
      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getAbout(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getContactUs', () => {
    it('should fetch contact us page', async () => {
      const mockData = { title: 'Contact Us', email: 'test@example.com' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getContactUs(CodeEnum.EN)

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/contact-us', {
        query: { locale: CodeEnum.EN, customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })
  })

  describe('getNavigation', () => {
    it('should fetch navigation without locale', async () => {
      const mockData = { links: [] }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getNavigation()

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/navigation', {
        query: { customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should fetch navigation with locale', async () => {
      const mockData = { links: [{ title: 'Home', url: '/' }] }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getNavigation(CodeEnum.IT.toString())

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/navigation', {
        query: { locale: CodeEnum.IT, customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })
  })

  describe('getFooter', () => {
    it('should fetch footer', async () => {
      const mockData = { copyright: '2025' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getFooter(CodeEnum.EN)

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getFooter(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getPrivacy', () => {
    it('should fetch privacy page', async () => {
      const mockData = { title: 'Privacy Policy', content: '...' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getPrivacy(CodeEnum.EN)

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getPrivacy(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getTerm', () => {
    it('should fetch terms page', async () => {
      const mockData = { title: 'Terms of Service', content: '...' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getTerm(CodeEnum.EN)

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getTerm(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getError404', () => {
    it('should fetch 404 error page', async () => {
      const mockData = { title: '404', message: 'Page not found' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getError404(CodeEnum.EN)

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getError404(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getError410', () => {
    it('should fetch 410 error page', async () => {
      const mockData = { title: '410', message: 'Gone' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getError410(CodeEnum.EN)

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getError410(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getFaq', () => {
    it('should fetch FAQ page', async () => {
      const mockData = { title: 'FAQ', questions: [] }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getFaq(CodeEnum.EN)

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getFaq(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getAuthPage', () => {
    it('should fetch auth page', async () => {
      const mockData = { title: 'Sign In', loginText: 'Welcome back' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getAuthPage(CodeEnum.EN)

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getAuthPage(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getBlog', () => {
    it('should fetch blog page', async () => {
      const mockData = { title: 'Blog', description: 'Latest posts' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getBlog(CodeEnum.EN)

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getBlog(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getProductCategoriesPage', () => {
    it('should fetch product categories page', async () => {
      const mockData = { title: 'Categories', description: 'Browse categories' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getProductCategoriesPage(CodeEnum.EN)

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getProductCategoriesPage(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getProfile', () => {
    it('should fetch profile page', async () => {
      const mockData = { title: 'Profile', welcomeText: 'Welcome' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getProfile(CodeEnum.EN)

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getProfile(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getContactUs', () => {
    it('should fetch contact us page', async () => {
      const mockData = { title: 'Contact Us', email: 'test@example.com' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getContactUs(CodeEnum.EN)

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/contact-us', {
        query: { locale: CodeEnum.EN, customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getContactUs(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getNavigation error handling', () => {
    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getNavigation(CodeEnum.EN)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })
})

describe('Content API - Collection Types', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProducts', () => {
    it('should fetch products without query', async () => {
      const mockData = { data: [{ id: 1, name: 'Product 1' }], meta: { pagination: {} } }
      mockApiRequest.mockResolvedValueOnce(mockData as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getProducts()

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/products', {
        query: { customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should fetch products with filters and pagination', async () => {
      const mockData = { data: [], meta: { pagination: { page: 2 } } }
      mockApiRequest.mockResolvedValueOnce(mockData as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getProducts({
        pagination: { page: 2, pageSize: 10 },
        locale: CodeEnum.EN,
      })

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/products', {
        query: { pagination: { page: 2, pageSize: 10 }, locale: CodeEnum.EN, customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getProducts()

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch products:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getProductById', () => {
    it('should fetch single product by ID', async () => {
      const mockData = { id: 1, name: 'Product 1', price: 99.99 }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getProductById('1', { locale: CodeEnum.EN })
      expect(mockCreateApiRequest).toHaveBeenCalledWith('/products/1', {
        path: { id: '1' },
        query: { locale: CodeEnum.EN, customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('Not found'))

      const result = await getProductById('999')

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getProductCategories', () => {
    it('should fetch product categories', async () => {
      const mockData = { data: [{ id: 1, name: 'Electronics' }], meta: {} }
      mockApiRequest.mockResolvedValueOnce(mockData as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getProductCategories()
      expect(mockCreateApiRequest).toHaveBeenCalledWith('/product-categories', {
        query: { customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should fetch categories with query', async () => {
      const mockData = { data: [], meta: {} }
      mockApiRequest.mockResolvedValueOnce(mockData as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getProductCategories({ locale: CodeEnum.IT })

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getProductCategories()

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getProductCategoryById', () => {
    it('should fetch single category by ID', async () => {
      const mockData = { id: 1, name: 'Electronics', description: '...' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getProductCategoryById('123')

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getProductCategoryById('123')

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getBlogPosts', () => {
    it('should fetch blog posts', async () => {
      const mockData = { data: [{ id: 1, title: 'Post 1' }], meta: {} }
      mockApiRequest.mockResolvedValueOnce(mockData as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getBlogPosts({ locale: CodeEnum.EN.toString() })

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/blog-posts', {
        query: { locale: CodeEnum.EN, customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should fetch blog posts with pagination', async () => {
      const mockData = { data: [], meta: { pagination: { page: 2 } } }
      mockApiRequest.mockResolvedValueOnce(mockData as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getBlogPosts({
        pagination: { page: 1, pageSize: 10 },
        locale: CodeEnum.EN,
      })

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/blog-posts', {
        query: { pagination: { page: 1, pageSize: 10 }, locale: CodeEnum.EN, customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getBlogPosts()

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getBlogPostById', () => {
    it('should fetch single blog post by ID', async () => {
      const mockData = { id: 1, title: 'Post 1', content: '...' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getBlogPostById('123')

      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getBlogPostById('123')

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getAuthors', () => {
    it('should fetch authors', async () => {
      const mockData = { data: [{ id: 1, name: 'Author 1' }], meta: {} }
      mockApiRequest.mockResolvedValueOnce(mockData as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getAuthors()
      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getAuthors()

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getAuthorById', () => {
    it('should fetch single author by ID', async () => {
      const mockData = { id: 1, name: 'Author 1', bio: '...' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getAuthorById('123')
      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getAuthorById('123')

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })
})

describe('Content API - Upload Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getFiles', () => {
    it('should fetch files without query', async () => {
      const mockData = [{ id: 1, documentId: 'abc', name: 'image1.webp', url: '/uploads/image1.webp' }]
      mockApiRequest.mockResolvedValueOnce(mockData as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getFiles()
      expect(mockCreateApiRequest).toHaveBeenCalledWith('/files', { query: { customPopulate: 'nested' } })
      expect(result).toEqual(mockData)
    })

    it('should fetch files with pagination', async () => {
      const mockData = [{ id: 2, documentId: 'def', name: 'image2.webp', url: '/uploads/image2.webp' }]
      mockApiRequest.mockResolvedValueOnce(mockData as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getFiles({ pagination: { page: 2, pageSize: 25 } })

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/files', {
        query: { pagination: { page: 2, pageSize: 25 }, customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('API error'))

      const result = await getFiles()

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch files:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getFileById', () => {
    it('should fetch single file by numeric ID', async () => {
      const mockData = {
        id: 123,
        documentId: 'abc123',
        name: 'image.webp',
        url: '/uploads/image.webp',
        mime: 'image/jpeg',
      }
      mockApiRequest.mockResolvedValueOnce(mockData as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getFileById(123)

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/files/123', {
        path: { id: 123 },
        query: { customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should return null on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiRequest.mockRejectedValueOnce(new Error('Not found'))

      const result = await getFileById(999)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch file 999:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })
  })
})
