// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for wishlist page
 */

import Wishlist, { generateMetadata } from '@/app/[lang]/profile/wishlist/page'
import { getProfile } from '@/lib/content/api'
import { render, screen } from '@testing-library/react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img src={src} alt={alt} />
  },
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock next/navigation
const mockPush = jest.fn()
const mockNotFound = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  notFound: (...args: unknown[]) => mockNotFound(...args),
}))

// Mock API
jest.mock('@/lib/content/api', () => ({
  getProfile: jest.fn(),
}))

const mockProfileData = {
  wishlistHeader: { text: 'Wishlist' },
  wishlistRemoveButton: { label: { text: 'Remove' } }, // Changed from 'delete' to avoid clash with icon text
  wishlistAddButton: { label: { text: 'Add to Cart' } },
  goBackButton: { label: { text: 'Back' } },
}

describe('Wishlist', () => {
  beforeEach(() => {
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileData)
  })

  it('should render wishlist page', async () => {
    const ui = await Wishlist({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Wishlist')
  })

  it('should render back button linking to profile', async () => {
    const ui = await Wishlist({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('link', { name: /arrow_back/i })).toHaveAttribute('href', '/en/profile')
  })

  it('should render wishlist items', async () => {
    const ui = await Wishlist({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByText('Bamboo Toothbrush Set')).toBeInTheDocument()
    expect(screen.getByText('Reusable Coffee Cup')).toBeInTheDocument()
    expect(screen.getByText('Solar Powered Charger')).toBeInTheDocument()
  })

  it('should render item prices', async () => {
    const ui = await Wishlist({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByText('$12.99')).toBeInTheDocument()
    expect(screen.getByText('$25.00')).toBeInTheDocument()
    expect(screen.getByText('$49.50')).toBeInTheDocument()
  })

  it('should render product images', async () => {
    const ui = await Wishlist({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const images = screen.getAllByRole('img')
    expect(images.length).toBe(3)
  })

  it('should render delete buttons', async () => {
    const ui = await Wishlist({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    // Tests for the icon text 'delete'
    const deleteIcons = screen.getAllByText('delete')
    expect(deleteIcons.length).toBe(3)

    // Test for the label text 'Remove'
    const removeLabels = screen.getAllByText('Remove')
    expect(removeLabels.length).toBe(3)
  })

  it('should render add to cart buttons', async () => {
    const ui = await Wishlist({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const addToCartButtons = screen.getAllByRole('button', { name: /Add to Cart/i })
    expect(addToCartButtons.length).toBe(3)
  })

  it('should handle missing header and labels gracefully', async () => {
    const mockDataMissing = {
      ...mockProfileData,
      wishlistHeader: { header: undefined },
      wishlistRemoveButton: { label: undefined },
      wishlistAddButton: { label: undefined },
    }
    ;(getProfile as jest.Mock).mockResolvedValueOnce(mockDataMissing)

    const ui = await Wishlist({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Wishlist') // Default
    expect(screen.getAllByText('Remove').length).toBe(3) // Default
    expect(screen.getAllByText('Add to Cart').length).toBe(3) // Default
  })

  it('should render correctly in RTL', async () => {
    const ui = await Wishlist({ params: Promise.resolve({ lang: 'he' }) })
    render(ui)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should call notFound when profile data is missing', async () => {
    ;(getProfile as jest.Mock).mockResolvedValueOnce(null)
    try {
      await Wishlist({ params: Promise.resolve({ lang: 'en' }) })
    } catch {
      // notFound throws an error
    }

    expect(mockNotFound).toHaveBeenCalled()
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return noindex metadata from CMS data', async () => {
    ;(getProfile as jest.Mock).mockResolvedValue({
      seoMetadata: { metaTitle: 'Wishlist', metaDescription: 'Your saved items' },
    })

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

    expect(metadata.title).toBe('Wishlist')
    expect(metadata.description).toBe('Your saved items')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('should handle null profile data gracefully', async () => {
    ;(getProfile as jest.Mock).mockResolvedValue(null)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

    expect(metadata.title).toBeUndefined()
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})
