// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Image component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { Image } from '@/components/elements/Image'
import type { PluginUploadFileDocument } from '@/lib/generated/types.gen'

// Mock next/image to capture onError callback
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    className,
    fill,
    sizes,
    preload,
    onError,
  }: {
    src: string
    alt: string
    className?: string
    fill?: boolean
    sizes?: string
    preload?: boolean
    onError?: () => void
  }) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        data-testid="mock-image"
        data-fill={fill ? 'true' : undefined}
        data-sizes={sizes}
        data-preload={preload ? 'true' : undefined}
        onError={onError}
      />
    )
  },
}))

describe('Image', () => {
  it('should render placeholder for undefined image', () => {
    render(<Image image={undefined} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should render placeholder for null image', () => {
    render(<Image image={null} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should render placeholder for media object without URL', () => {
    render(<Image image={{ url: undefined } as unknown as PluginUploadFileDocument} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should render placeholder for media object with empty URL', () => {
    render(<Image image={{ url: '' } as unknown as PluginUploadFileDocument} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should prepend CMS URL to relative paths from media object', () => {
    render(<Image image={{ url: '/uploads/test.png' } as unknown as PluginUploadFileDocument} />)
    const img = screen.getByTestId('mock-image')
    // CMS URL is based on NEXT_PUBLIC_CMS_URL env var - match pattern with any hostname
    expect(img).toHaveAttribute('src', expect.stringMatching(/https?:\/\/.+(:\d+)?\/uploads\/test\.png$/))
  })

  it('should use alternativeText from media object', () => {
    render(
      <Image image={{ url: '/test.png', alternativeText: 'Test alt text' } as unknown as PluginUploadFileDocument} />
    )
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('alt', 'Test alt text')
  })

  it('should use empty string as alt when no alt text available', () => {
    render(<Image image={{ url: '/test.png' } as unknown as PluginUploadFileDocument} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('alt', '')
  })

  it('should pass through className prop', () => {
    render(<Image image={{ url: '/test.png' } as unknown as PluginUploadFileDocument} className="custom-class" />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveClass('custom-class')
  })

  it('should pass through fill prop', () => {
    render(<Image image={{ url: '/test.png' } as unknown as PluginUploadFileDocument} fill />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('data-fill', 'true')
  })

  it('should pass through sizes prop', () => {
    render(
      <Image
        image={{ url: '/test.png' } as unknown as PluginUploadFileDocument}
        sizes="(max-width: 768px) 100vw, 50vw"
        fill
      />
    )
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('data-sizes', '(max-width: 768px) 100vw, 50vw')
  })

  it('should pass through preload prop', () => {
    render(<Image image={{ url: '/test.png' } as unknown as PluginUploadFileDocument} preload fill />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('data-preload', 'true')
  })

  it('should handle http URLs correctly', () => {
    render(<Image image={{ url: 'http://example.com/image.png' } as unknown as PluginUploadFileDocument} />)
    const img = screen.getByTestId('mock-image')
    expect(img).toHaveAttribute('src', 'http://example.com/image.png')
  })

  describe('error handling', () => {
    it('should switch to placeholder on error', () => {
      render(<Image image={{ url: 'https://example.com/broken.jpg' } as unknown as PluginUploadFileDocument} />)
      const img = screen.getByTestId('mock-image')

      // Initially shows the original URL
      expect(img).toHaveAttribute('src', 'https://example.com/broken.jpg')

      // Trigger error event
      fireEvent.error(img)

      // After error, should show placeholder
      expect(img).toHaveAttribute('src', '/images/placeholder.svg')
    })

    it('should not update state if already in error state', () => {
      render(<Image image={{ url: 'https://example.com/broken.jpg' } as unknown as PluginUploadFileDocument} />)
      const img = screen.getByTestId('mock-image')

      // Trigger first error
      fireEvent.error(img)
      expect(img).toHaveAttribute('src', '/images/placeholder.svg')

      // Trigger second error - should not cause additional state updates
      fireEvent.error(img)
      expect(img).toHaveAttribute('src', '/images/placeholder.svg')
    })
  })

  describe('visible prop', () => {
    it('should return null when visible is false', () => {
      const { container } = render(
        <Image
          image={{ url: '/uploads/test.jpg', alternativeText: 'Test' } as unknown as PluginUploadFileDocument}
          visible={false}
        />
      )

      // Should not render anything
      expect(container.firstChild).toBeNull()
    })

    it('should render normally when visible is true', () => {
      render(
        <Image
          image={{ url: '/uploads/test.jpg', alternativeText: 'Test' } as unknown as PluginUploadFileDocument}
          visible={true}
        />
      )

      const img = screen.getByTestId('mock-image')
      expect(img).toBeInTheDocument()
    })

    it('should render normally when visible is undefined (default)', () => {
      render(
        <Image image={{ url: '/uploads/test.jpg', alternativeText: 'Test' } as unknown as PluginUploadFileDocument} />
      )

      const img = screen.getByTestId('mock-image')
      expect(img).toBeInTheDocument()
    })
  })

  describe('URL resolution', () => {
    it('should handle /icons/ paths correctly', () => {
      render(
        <Image image={{ url: '/icons/star.svg', alternativeText: 'Star' } as unknown as PluginUploadFileDocument} />
      )

      const img = screen.getByTestId('mock-image')
      expect(img).toHaveAttribute('src', '/icons/star.svg')
    })

    it('should handle /images/ paths correctly', () => {
      render(
        <Image image={{ url: '/images/logo.png', alternativeText: 'Logo' } as unknown as PluginUploadFileDocument} />
      )

      const img = screen.getByTestId('mock-image')
      expect(img).toHaveAttribute('src', '/images/logo.png')
    })
  })

  describe('CMS_URL resolution fallback', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should fallback to protocol://localhost:port when NEXT_PUBLIC_CMS_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_CMS_URL
      process.env.NEXT_PUBLIC_CMS_PROTOCOL = 'http'
      process.env.NEXT_PUBLIC_CMS_PORT = '1338'

      render(<Image image={{ url: '/uploads/fallback_test.jpg' } as unknown as PluginUploadFileDocument} />)
      const img = screen.getByTestId('mock-image')
      expect(img).toHaveAttribute('src', 'http://localhost:1338/uploads/fallback_test.jpg')
    })
  })
})
