// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Card component
 */

import { render, screen } from '@testing-library/react'

import { Card, type CardProps } from '@/components/elements/Card'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: {
    src: string
    alt: string
    className?: string
    fill?: boolean
    onError?: (e: { target: HTMLImageElement }) => void
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} className={props.className} data-fill={props.fill} />
  },
}))

// Mock CMSImage directly (Card uses relative import)
jest.mock('@/components/elements/CMSImage', () => ({
  __esModule: true,
  default: function MockCMSImage({
    image,
    fallbackAlt,
  }: {
    image?: { url?: string; alternativeText?: string } | string | null
    fallbackAlt?: string
  }) {
    const getImageUrl = () => {
      if (!image) return '/images/placeholder.svg'
      if (typeof image === 'string') return image
      if (!image.url) return '/images/placeholder.svg'
      return image.url.startsWith('http') ? image.url : `https://localhost:1337${image.url}`
    }
    const alt = typeof image === 'object' && image?.alternativeText ? image.alternativeText : (fallbackAlt ?? '')
    // eslint-disable-next-line @next/next/no-img-element
    return <img data-testid="mock-image" src={getImageUrl()} alt={alt} />
  },
  CMSImage: function MockCMSImage({
    image,
    fallbackAlt,
  }: {
    image?: { url?: string; alternativeText?: string } | string | null
    fallbackAlt?: string
  }) {
    const getImageUrl = () => {
      if (!image) return '/images/placeholder.svg'
      if (typeof image === 'string') return image
      if (!image.url) return '/images/placeholder.svg'
      return image.url.startsWith('http') ? image.url : `https://localhost:1337${image.url}`
    }
    const alt = typeof image === 'object' && image?.alternativeText ? image.alternativeText : (fallbackAlt ?? '')
    // eslint-disable-next-line @next/next/no-img-element
    return <img data-testid="mock-image" src={getImageUrl()} alt={alt} />
  },
}))

describe('Card', () => {
  const defaultProps: CardProps = {
    href: '/test-path',
    image: { url: '/test-image.jpg', alternativeText: 'Test image' },
    imageAlt: 'Fallback alt',
    children: <p>Test content</p>,
  }

  it('should render as a link by default', () => {
    render(<Card {...defaultProps} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test-path')
  })

  it('should render as a div when asLink is false', () => {
    const { container } = render(<Card {...defaultProps} asLink={false} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    const card = container.querySelector('[data-href="/test-path"]')
    expect(card).toBeInTheDocument()
  })

  it('should render image with alt text', () => {
    render(<Card {...defaultProps} />)

    const image = screen.getByTestId('mock-image')
    expect(image).toBeInTheDocument()
  })

  it('should render tag when provided', () => {
    render(<Card {...defaultProps} tag="Featured" />)

    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('should not render tag when not provided', () => {
    render(<Card {...defaultProps} />)

    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
  })

  it('should render children content', () => {
    render(<Card {...defaultProps} />)

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should apply product variant classes by default', () => {
    const { container } = render(<Card {...defaultProps} />)

    const card = container.querySelector('a')
    expect(card?.className).toContain('h-card')
    expect(card?.className).toContain('w-carousel-mobile')
  })

  it('should apply blog variant classes', () => {
    const { container } = render(<Card {...defaultProps} variant="blog" />)

    const card = container.querySelector('a')
    expect(card?.className).toContain('w-blog-carousel-mobile')
  })

  it('should apply additional className', () => {
    const { container } = render(<Card {...defaultProps} className="mt-4" />)

    const card = container.querySelector('a')
    expect(card?.className).toContain('mt-4')
  })

  it('should handle null image', () => {
    render(<Card {...defaultProps} image={null} />)

    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should handle undefined image', () => {
    render(<Card {...defaultProps} image={undefined} />)

    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should apply group class for hover effects', () => {
    const { container } = render(<Card {...defaultProps} />)

    const card = container.querySelector('a')
    expect(card?.className).toContain('group')
  })

  it('should render with empty tag string (falsy but not undefined)', () => {
    const { container } = render(<Card {...defaultProps} tag="" />)

    // Empty tag should not render a tag span (Card checks for falsy)
    const tagSpan = container.querySelector('.text-primary.uppercase')
    expect(tagSpan).not.toBeInTheDocument()
  })

  it('should apply profile variant classes', () => {
    const { container } = render(<Card {...defaultProps} variant="profile" />)

    const card = container.querySelector('a')
    expect(card?.className).toContain('h-auto')
    expect(card?.className).toContain('text-center')
    expect(card?.className).toContain('w-carousel-mobile')

    const imageWrapper = container.querySelector('.rounded-full')
    expect(imageWrapper).toBeInTheDocument()
    expect(imageWrapper?.className).toContain('w-40')
    expect(imageWrapper?.className).toContain('h-40')
  })

  it('should return null when visible is false', () => {
    const { container } = render(<Card {...defaultProps} visible={false} />)

    expect(container.firstChild).toBeNull()
  })

  it('should render imageOverlay when provided', () => {
    render(<Card {...defaultProps} imageOverlay={<span data-testid="overlay">Overlay</span>} />)

    expect(screen.getByTestId('overlay')).toBeInTheDocument()
  })
})
