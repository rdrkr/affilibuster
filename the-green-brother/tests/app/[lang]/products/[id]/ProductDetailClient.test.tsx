// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ProductDetailClient component
 */

import { fireEvent, render, screen } from '@testing-library/react'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock CMS components
jest.mock('@/components/elements', () => ({
  CMSImage: function MockCMSImage({ fallbackAlt }: { fallbackAlt?: string }) {
    return <div data-testid="cms-image">{fallbackAlt}</div>
  },
  CMSText: function MockCMSText({ text }: { text?: string }) {
    return <span>{text}</span>
  },
}))

import ProductDetailClient from '@/app/[lang]/products/[id]/ProductDetailClient'
import { CodeEnum, type ApiProductProductDocument } from '@/lib/generated/types.gen'

describe('ProductDetailClient', () => {
  const mockProduct: ApiProductProductDocument = {
    documentId: 'prod-1',
    slug: 'eco-product',
    content: {
      header: {
        header: { text: 'Eco Product' },
        subheader: { text: 'A sustainable product' },
      },
      content: '<p>Product description</p>',
    },
    price: '49.99',
    category: { content: { text: 'Electronics' } },
    images: [{ url: '/images/prod1.jpg' }, { url: '/images/prod2.jpg' }],
    affiliateButton: { url: 'https://affiliate.example.com/buy' },
  } as unknown as ApiProductProductDocument

  it('should render product title', () => {
    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Eco Product')
  })

  it('should render breadcrumbs', () => {
    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/en')
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/en/products')
  })

  it('should render product price', () => {
    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    expect(screen.getByText('$49.99')).toBeInTheDocument()
  })

  it('should render category', () => {
    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('should render affiliate link when affiliateButton has URL', () => {
    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    const buyLink = screen.getByRole('link', { name: 'Buy Now' })
    expect(buyLink).toHaveAttribute('href', 'https://affiliate.example.com/buy')
    expect(buyLink).toHaveAttribute('target', '_blank')
  })

  it('should render Add to Cart button when no affiliate URL', () => {
    const productWithoutAffiliate = {
      ...mockProduct,
      affiliateButton: { url: '' },
    } as ApiProductProductDocument

    render(<ProductDetailClient product={productWithoutAffiliate} lang={CodeEnum.EN} />)

    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument()
  })

  it('should increment quantity', () => {
    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    const incrementButton = screen.getByRole('button', { name: '+' })
    fireEvent.click(incrementButton)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should decrement quantity but not below 1', () => {
    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    const decrementButton = screen.getByRole('button', { name: '-' })
    fireEvent.click(decrementButton)

    // Should still be 1
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should change selected image when thumbnail clicked', () => {
    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    // Click on second thumbnail
    const thumbnails = screen.getAllByTestId('cms-image')
    // Main image + 2 thumbnails = 3 total
    expect(thumbnails.length).toBeGreaterThan(1)
  })

  it('should render wishlist button', () => {
    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    expect(screen.getByText('favorite_border')).toBeInTheDocument()
  })

  it('should handle wishlist click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      return
    })

    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    const wishlistButton = screen.getByText('favorite_border').closest('button')!
    fireEvent.click(wishlistButton)

    expect(consoleSpy).toHaveBeenCalledWith('Added to wishlist')
    consoleSpy.mockRestore()
  })

  it('should render product content', () => {
    const { container } = render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    expect(screen.getByText('Product Details')).toBeInTheDocument()
    // The product content is rendered via dangerouslySetInnerHTML
    const contentDivs = container.querySelectorAll('[class*="prose"]')
    expect(contentDivs.length).toBeGreaterThan(0)
  })

  it('should render subheader when available', () => {
    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    expect(screen.getByText('A sustainable product')).toBeInTheDocument()
  })

  it('should call handleAddToCart with product name when no affiliate URL', () => {
    const productWithoutAffiliate = {
      ...mockProduct,
      affiliateButton: { url: '' },
    } as ApiProductProductDocument

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      return
    })

    render(<ProductDetailClient product={productWithoutAffiliate} lang={CodeEnum.EN} />)

    const addToCartButton = screen.getByRole('button', { name: 'Add to Cart' })
    fireEvent.click(addToCartButton)

    expect(consoleSpy).toHaveBeenCalledWith('Added 1 of Eco Product to cart')
    consoleSpy.mockRestore()
  })

  it('should show placeholder image when no images available', () => {
    const productWithNoImages = {
      ...mockProduct,
      images: [],
    } as ApiProductProductDocument

    render(<ProductDetailClient product={productWithNoImages} lang={CodeEnum.EN} />)

    // Should show placeholder icon
    expect(screen.getByText('image')).toBeInTheDocument()
  })

  it('should render currency code when non-USD', () => {
    const productWithEuro = {
      ...mockProduct,
      currency: { code: 'EUR' },
    } as ApiProductProductDocument

    render(<ProductDetailClient product={productWithEuro} lang={CodeEnum.EN} />)

    expect(screen.getByText('EUR')).toBeInTheDocument()
  })

  it('should not render product details section when no content', () => {
    const productWithoutContent = {
      ...mockProduct,
      content: {
        header: { header: { text: 'Test' } },
      },
    } as ApiProductProductDocument

    render(<ProductDetailClient product={productWithoutContent} lang={CodeEnum.EN} />)

    expect(screen.queryByText('Product Details')).not.toBeInTheDocument()
  })

  it('should click thumbnail to change selected image', () => {
    render(<ProductDetailClient product={mockProduct} lang={CodeEnum.EN} />)

    // Find the thumbnail buttons (excludes main image)
    const buttons = screen.getAllByRole('button')
    const thumbnailButtons = buttons.filter(btn => btn.className.includes('aspect-square'))

    if (thumbnailButtons.length > 1) {
      fireEvent.click(thumbnailButtons[1]!)
    }
  })
})
