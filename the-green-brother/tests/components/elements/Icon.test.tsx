// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Icon component
 */

import { render, screen } from '@testing-library/react'

import { Icon } from '@/components/elements/Icon'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string
    alt: string
    width: number
    height: number
    className?: string
  }) {
    return <img src={src} alt={alt} width={width} height={height} className={className} data-testid="mock-image" />
  },
}))

// resolveIcon tests removed - function is now private

describe('Icon', () => {
  it('should render null for undefined icon', () => {
    const { container } = render(<Icon icon={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render null for null icon', () => {
    const { container } = render(<Icon icon={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render null for empty string icon', () => {
    const { container } = render(<Icon icon="" />)
    expect(container.firstChild).toBeNull()
  })

  it('should render null for whitespace-only icon', () => {
    const { container } = render(<Icon icon="   " />)
    expect(container.firstChild).toBeNull()
  })

  it('should render Image for local SVG icon', () => {
    render(<Icon icon="brand.svg" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/icons/brand.svg')
  })

  it('should render Material Symbol for text icon name', () => {
    render(<Icon icon="home" />)
    const icon = screen.getByText('home')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('material-symbols-outlined-bold')
  })

  it('should apply default size (lg = 24px)', () => {
    render(<Icon icon="home" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '24px' })
  })

  it('should apply sm size (16px)', () => {
    render(<Icon icon="home" size="sm" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '16px' })
  })

  it('should apply md size (20px)', () => {
    render(<Icon icon="home" size="md" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '20px' })
  })

  it('should apply xl size (32px)', () => {
    render(<Icon icon="home" size="xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '32px' })
  })

  it('should apply 2xl size (40px)', () => {
    render(<Icon icon="home" size="2xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '40px' })
  })

  it('should apply 3xl size (48px)', () => {
    render(<Icon icon="home" size="3xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '48px' })
  })

  it('should apply 4xl size (56px)', () => {
    render(<Icon icon="home" size="4xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '56px' })
  })

  it('should apply 5xl size (64px)', () => {
    render(<Icon icon="home" size="5xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '64px' })
  })

  it('should apply 6xl size (72px)', () => {
    render(<Icon icon="home" size="6xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '72px' })
  })

  it('should set correct dimensions for local image', () => {
    render(<Icon icon="brand.svg" size="xl" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('width', '32')
    expect(img).toHaveAttribute('height', '32')
  })

  it('should apply custom className', () => {
    render(<Icon icon="home" className="custom-icon" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveClass('custom-icon')
  })

  it('should set aria-label when provided', () => {
    render(<Icon icon="home" ariaLabel="Home icon" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveAttribute('aria-label', 'Home icon')
  })

  it('should set aria-hidden when no ariaLabel', () => {
    render(<Icon icon="home" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('should not set aria-hidden when ariaLabel is provided', () => {
    render(<Icon icon="home" ariaLabel="Home icon" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveAttribute('aria-hidden', 'false')
  })

  it('should use alt text for local images', () => {
    render(<Icon icon="brand.svg" ariaLabel="Brand logo" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('alt', 'Brand logo')
  })

  it('should use empty alt for local images without ariaLabel', () => {
    render(<Icon icon="brand.svg" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('alt', '')
  })

  it('should render promoted material icon with circular background', () => {
    const { container } = render(<Icon icon="home" promoted />)
    const icon = screen.getByText('home')
    expect(icon).toHaveClass('text-primary')
    // Should be wrapped in a span with circular background
    const wrapper = container.querySelector('.rounded-full')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toHaveClass('bg-primary/10')
  })

  it('should render promoted local icon with circular background', () => {
    const { container } = render(<Icon icon="brand.svg" promoted />)
    const wrapper = container.querySelector('.rounded-full')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toHaveClass('bg-primary/10')
    // Image should be inside the wrapper
    const img = screen.getByTestId('mock-image')
    expect(wrapper).toContainElement(img)
  })

  it('should use larger size when promoted', () => {
    render(<Icon icon="home" promoted />)
    const icon = screen.getByText('home')
    // Promoted uses xl (32px) size
    expect(icon).toHaveStyle({ fontSize: '32px' })
  })

  describe('visible prop', () => {
    it('should render null when visible is false', () => {
      const { container } = render(<Icon icon="home" visible={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render icon when visible is true', () => {
      render(<Icon icon="home" visible={true} />)
      expect(screen.getByText('home')).toBeInTheDocument()
    })

    it('should render icon when visible is not provided', () => {
      render(<Icon icon="home" />)
      expect(screen.getByText('home')).toBeInTheDocument()
    })
  })

  it('should render masked icon as span with bg-current', () => {
    render(<Icon icon="social.svg" masked ariaLabel="Social Icon" />)
    // Should render a span with role="img" instead of img tag
    const mask = screen.getByRole('img', { name: 'Social Icon' })
    expect(mask.tagName).toBe('SPAN')
    expect(mask).toHaveClass('bg-current')
    expect(mask.style.backgroundColor.toLowerCase()).toBe('currentcolor')
    // Check mask-image via style attribute or property
    expect(mask.getAttribute('style')).toContain('mask-image: url(/icons/social.svg)')
  })
})
