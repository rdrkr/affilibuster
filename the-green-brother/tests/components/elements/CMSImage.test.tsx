// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for CMSImage component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { CMSImage, type CMSMedia } from '@/components/elements/CMSImage'

// Mock next/image to capture onError callback
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    className,
    fill,
    sizes,
    priority,
    onError,
  }: {
    src: string
    alt: string
    className?: string
    fill?: boolean
    sizes?: string
    priority?: boolean
    onError?: () => void
  }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        data-testid="mock-image"
        data-fill={fill ? 'true' : undefined}
        data-sizes={sizes}
        data-priority={priority ? 'true' : undefined}
        onError={onError}
      />
    )
  },
}))

describe('CMSImage', () => {
  it('should render placeholder for undefined image', () => {
    render(<CMSImage image={undefined} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should render placeholder for null image', () => {
    render(<CMSImage image={null} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should render placeholder for media object without URL', () => {
    render(<CMSImage image={{ url: undefined } as unknown as CMSMedia} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should render placeholder for media object with empty URL', () => {
    render(<CMSImage image={{ url: '' }} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should render string URL directly', () => {
    render(<CMSImage image="/images/test.png" />)
    const img = screen.getByTestId('mock-image')
    // Relative URLs get CMS prefix
    expect(img).toHaveAttribute('src', expect.stringContaining('/images/test.png'))
  })

  it('should render absolute URL without modification', () => {
    render(<CMSImage image="https://example.com/image.png" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', 'https://example.com/image.png')
  })

  it('should prepend CMS URL to relative paths from media object', () => {
    render(<CMSImage image={{ url: '/uploads/test.png' }} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', expect.stringMatching(/localhost:1337\/uploads\/test\.png$/))
  })

  it('should use alternativeText from media object', () => {
    render(<CMSImage image={{ url: '/test.png', alternativeText: 'Test alt text' }} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('alt', 'Test alt text')
  })

  it('should use fallbackAlt when alternativeText is null', () => {
    render(<CMSImage image={{ url: '/test.png', alternativeText: null }} fallbackAlt="Fallback alt" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('alt', 'Fallback alt')
  })

  it('should use fallbackAlt when alternativeText is missing', () => {
    render(<CMSImage image={{ url: '/test.png' }} fallbackAlt="Fallback alt" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('alt', 'Fallback alt')
  })

  it('should use fallbackAlt for string image', () => {
    render(<CMSImage image="/test.png" fallbackAlt="Fallback text" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('alt', 'Fallback text')
  })

  it('should use empty string as alt when no alt text available', () => {
    render(<CMSImage image={{ url: '/test.png' }} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('alt', '')
  })

  it('should pass through className prop', () => {
    // eslint-disable-next-line better-tailwindcss/no-unknown-classes
    render(<CMSImage image="/test.png" className="custom-class" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveClass('custom-class')
  })

  it('should pass through fill prop', () => {
    render(<CMSImage image="/test.png" fill />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('data-fill', 'true')
  })

  it('should pass through sizes prop', () => {
    render(<CMSImage image="/test.png" sizes="(max-width: 768px) 100vw, 50vw" fill />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('data-sizes', '(max-width: 768px) 100vw, 50vw')
  })

  it('should pass through priority prop', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    render(<CMSImage image="/test.png" priority fill />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('data-priority', 'true')
  })

  it('should handle http URLs correctly', () => {
    render(<CMSImage image="http://example.com/image.png" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', 'http://example.com/image.png')
  })

  describe('error handling', () => {
    it('should switch to placeholder on error', () => {
      render(<CMSImage image="https://example.com/broken.jpg" />)
      const img = screen.getByTestId('mock-image')

      // Initially shows the original URL
      expect(img).toHaveAttribute('src', 'https://example.com/broken.jpg')

      // Trigger error event
      fireEvent.error(img)

      // After error, should show placeholder
      expect(img).toHaveAttribute('src', '/images/placeholder.svg')
    })

    it('should not update state if already in error state', () => {
      render(<CMSImage image="https://example.com/broken.jpg" />)
      const img = screen.getByTestId('mock-image')

      // Trigger first error
      fireEvent.error(img)
      expect(img).toHaveAttribute('src', '/images/placeholder.svg')

      // Trigger second error - should not cause additional state updates
      fireEvent.error(img)
      expect(img).toHaveAttribute('src', '/images/placeholder.svg')
    })
  })
})
