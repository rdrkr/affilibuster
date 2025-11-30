// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for CMSIcon component
 */

import { render, screen } from '@testing-library/react'

import { CMSIcon, resolveIcon } from '@/components/elements/CMSIcon'

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
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} className={className} data-testid="mock-image" />
  },
}))

describe('resolveIcon', () => {
  it('should return null for undefined', () => {
    expect(resolveIcon(undefined)).toBeNull()
  })

  it('should return null for null', () => {
    expect(resolveIcon(null)).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(resolveIcon('')).toBeNull()
  })

  it('should return null for whitespace-only string', () => {
    expect(resolveIcon('   ')).toBeNull()
  })

  it('should resolve SVG file as local icon', () => {
    const result = resolveIcon('brand.svg')
    expect(result).toEqual({ type: 'local', value: '/icons/brand.svg' })
  })

  it('should resolve PNG file as local icon', () => {
    const result = resolveIcon('logo.png')
    expect(result).toEqual({ type: 'local', value: '/icons/logo.png' })
  })

  it('should resolve JPG file as local icon', () => {
    const result = resolveIcon('photo.jpg')
    expect(result).toEqual({ type: 'local', value: '/icons/photo.jpg' })
  })

  it('should resolve JPEG file as local icon', () => {
    const result = resolveIcon('photo.jpeg')
    expect(result).toEqual({ type: 'local', value: '/icons/photo.jpeg' })
  })

  it('should resolve GIF file as local icon', () => {
    const result = resolveIcon('animation.gif')
    expect(result).toEqual({ type: 'local', value: '/icons/animation.gif' })
  })

  it('should resolve WebP file as local icon', () => {
    const result = resolveIcon('image.webp')
    expect(result).toEqual({ type: 'local', value: '/icons/image.webp' })
  })

  it('should resolve ICO file as local icon', () => {
    const result = resolveIcon('favicon.ico')
    expect(result).toEqual({ type: 'local', value: '/icons/favicon.ico' })
  })

  it('should be case-insensitive for file extensions', () => {
    expect(resolveIcon('LOGO.SVG')).toEqual({ type: 'local', value: '/icons/LOGO.SVG' })
    expect(resolveIcon('Image.PNG')).toEqual({ type: 'local', value: '/icons/Image.PNG' })
  })

  it('should resolve simple name as material symbol', () => {
    const result = resolveIcon('home')
    expect(result).toEqual({ type: 'material', value: 'home' })
  })

  it('should convert spaces to underscores for material symbols', () => {
    const result = resolveIcon('Account Circle')
    expect(result).toEqual({ type: 'material', value: 'account_circle' })
  })

  it('should convert PascalCase to snake_case for material symbols', () => {
    const result = resolveIcon('ViewList')
    expect(result).toEqual({ type: 'material', value: 'view_list' })
  })

  it('should handle mixed format names', () => {
    const result = resolveIcon('Arrow Forward')
    expect(result).toEqual({ type: 'material', value: 'arrow_forward' })
  })

  it('should trim whitespace', () => {
    const result = resolveIcon('  home  ')
    expect(result).toEqual({ type: 'material', value: 'home' })
  })
})

describe('CMSIcon', () => {
  it('should render null for undefined icon', () => {
    const { container } = render(<CMSIcon icon={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render null for null icon', () => {
    const { container } = render(<CMSIcon icon={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render null for empty string icon', () => {
    const { container } = render(<CMSIcon icon="" />)
    expect(container.firstChild).toBeNull()
  })

  it('should render Image for local SVG icon', () => {
    render(<CMSIcon icon="brand.svg" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/icons/brand.svg')
  })

  it('should render Material Symbol for text icon name', () => {
    render(<CMSIcon icon="home" />)
    const icon = screen.getByText('home')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('material-symbols-outlined-bold')
  })

  it('should apply default size (lg = 24px)', () => {
    render(<CMSIcon icon="home" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '24px' })
  })

  it('should apply sm size (16px)', () => {
    render(<CMSIcon icon="home" size="sm" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '16px' })
  })

  it('should apply md size (20px)', () => {
    render(<CMSIcon icon="home" size="md" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '20px' })
  })

  it('should apply xl size (32px)', () => {
    render(<CMSIcon icon="home" size="xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '32px' })
  })

  it('should apply 2xl size (40px)', () => {
    render(<CMSIcon icon="home" size="2xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '40px' })
  })

  it('should apply 3xl size (48px)', () => {
    render(<CMSIcon icon="home" size="3xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '48px' })
  })

  it('should apply 4xl size (56px)', () => {
    render(<CMSIcon icon="home" size="4xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '56px' })
  })

  it('should apply 5xl size (64px)', () => {
    render(<CMSIcon icon="home" size="5xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '64px' })
  })

  it('should apply 6xl size (72px)', () => {
    render(<CMSIcon icon="home" size="6xl" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveStyle({ fontSize: '72px' })
  })

  it('should set correct dimensions for local image', () => {
    render(<CMSIcon icon="brand.svg" size="xl" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('width', '32')
    expect(img).toHaveAttribute('height', '32')
  })

  it('should apply custom className', () => {
    // eslint-disable-next-line better-tailwindcss/no-unregistered-classes
    render(<CMSIcon icon="home" className="custom-icon" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveClass('custom-icon')
  })

  it('should set aria-label when provided', () => {
    render(<CMSIcon icon="home" ariaLabel="Home icon" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveAttribute('aria-label', 'Home icon')
  })

  it('should set aria-hidden when no ariaLabel', () => {
    render(<CMSIcon icon="home" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('should not set aria-hidden when ariaLabel is provided', () => {
    render(<CMSIcon icon="home" ariaLabel="Home icon" />)
    const icon = screen.getByText('home')
    expect(icon).toHaveAttribute('aria-hidden', 'false')
  })

  it('should use alt text for local images', () => {
    render(<CMSIcon icon="brand.svg" ariaLabel="Brand logo" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('alt', 'Brand logo')
  })

  it('should use empty alt for local images without ariaLabel', () => {
    render(<CMSIcon icon="brand.svg" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('alt', '')
  })
})
