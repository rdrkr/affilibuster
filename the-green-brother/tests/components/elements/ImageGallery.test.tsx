// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ImageGallery component
 */

import { fireEvent, screen } from '@testing-library/react'

import ImageGallery from '@/components/elements/ImageGallery'
import { DirectionEnum, type PluginUploadFileDocument } from '@/lib/generated/types.gen'
import { renderWithLayout } from '../../utils/renderWithLayout'

// Mock the Image component
jest.mock('@/components/elements/Image', () => ({
  Image: function MockImage({ image, className }: { image: PluginUploadFileDocument; className?: string }) {
    return <div data-testid={`mock-image-${image.url}`} className={className} />
  },
}))

// Mock the Icon component
jest.mock('@/components/elements/Icon', () => ({
  Icon: function MockIcon({ icon, size, className }: { icon: string; size?: string; className?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
        {icon}
      </span>
    )
  },
}))

describe('ImageGallery', () => {
  const mockImages: PluginUploadFileDocument[] = [
    {
      documentId: 'img-1',
      id: 1,
      url: '/images/product1.jpg',
      alternativeText: 'Product image 1',
      name: 'product1.jpg',
      hash: 'hash1',
      ext: '.jpg',
      mime: 'image/jpeg',
      size: 100,
      provider: 'local',
      publishedAt: '2025-01-01',
    } as PluginUploadFileDocument,
    {
      documentId: 'img-2',
      id: 2,
      url: '/images/product2.jpg',
      alternativeText: 'Product image 2',
      name: 'product2.jpg',
      hash: 'hash2',
      ext: '.jpg',
      mime: 'image/jpeg',
      size: 100,
      provider: 'local',
      publishedAt: '2025-01-01',
    } as PluginUploadFileDocument,
    {
      documentId: 'img-3',
      id: 3,
      url: '/images/product3.jpg',
      alternativeText: 'Product image 3',
      name: 'product3.jpg',
      hash: 'hash3',
      ext: '.jpg',
      mime: 'image/jpeg',
      size: 100,
      provider: 'local',
      publishedAt: '2025-01-01',
    } as PluginUploadFileDocument,
  ]

  describe('Rendering', () => {
    it('should render main image when images are provided', () => {
      renderWithLayout(<ImageGallery images={mockImages} direction={DirectionEnum.LTR} />)

      // First image appears both as main image and thumbnail
      const firstImageInstances = screen.getAllByTestId('mock-image-/images/product1.jpg')
      expect(firstImageInstances.length).toBeGreaterThanOrEqual(1)
    })

    it('should render placeholder icon when no images are provided', () => {
      renderWithLayout(<ImageGallery images={[]} direction={DirectionEnum.LTR} placeholderIcon="image" />)

      const icon = screen.getByTestId('mock-icon')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('data-icon', 'image')
    })

    it('should render thumbnails when multiple images are provided', () => {
      renderWithLayout(<ImageGallery images={mockImages} direction={DirectionEnum.LTR} />)

      // Image 1 appears twice (main + thumbnail), images 2 and 3 appear as thumbnails
      const firstImageInstances = screen.getAllByTestId('mock-image-/images/product1.jpg')
      expect(firstImageInstances).toHaveLength(2) // main + thumbnail
      expect(screen.getByTestId('mock-image-/images/product2.jpg')).toBeInTheDocument()
      expect(screen.getByTestId('mock-image-/images/product3.jpg')).toBeInTheDocument()
    })

    it('should not render thumbnails when only one image is provided', () => {
      renderWithLayout(<ImageGallery images={[mockImages[0]!]} direction={DirectionEnum.LTR} />)

      // Main image should be rendered
      expect(screen.getByTestId('mock-image-/images/product1.jpg')).toBeInTheDocument()

      // No thumbnail buttons should exist
      const thumbnailButtons = screen.queryAllByRole('button')
      expect(thumbnailButtons).toHaveLength(0)
    })

    it('should apply custom className', () => {
      const { container } = renderWithLayout(
        <ImageGallery images={mockImages} direction={DirectionEnum.LTR} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Image Selection', () => {
    it('should change selected image when thumbnail is clicked', () => {
      renderWithLayout(<ImageGallery images={mockImages} direction={DirectionEnum.LTR} />)

      // Click on second thumbnail
      const thumbnailButtons = screen.getAllByRole('button')
      const secondThumbnail = thumbnailButtons[1]!
      fireEvent.click(secondThumbnail)

      // The selected thumbnail should now have the active border class
      expect(secondThumbnail).toHaveClass('border-primary-500')
    })

    it('should highlight first thumbnail by default', () => {
      renderWithLayout(<ImageGallery images={mockImages} direction={DirectionEnum.LTR} />)

      const thumbnailButtons = screen.getAllByRole('button')
      expect(thumbnailButtons[0]!).toHaveClass('border-primary-500')
      expect(thumbnailButtons[1]!).not.toHaveClass('border-primary-500')
    })
  })

  describe('RTL Support', () => {
    it('should render with RTL direction', () => {
      renderWithLayout(<ImageGallery images={mockImages} direction={DirectionEnum.RTL} />)

      // Component should render without errors
      expect(screen.getByRole('region')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role="region" and aria-label', () => {
      renderWithLayout(<ImageGallery images={mockImages} direction={DirectionEnum.LTR} ariaLabel="Product images" />)

      const gallery = screen.getByRole('region')
      expect(gallery).toHaveAttribute('aria-label', 'Product images')
    })

    it('should have default aria-label when not provided', () => {
      renderWithLayout(<ImageGallery images={mockImages} direction={DirectionEnum.LTR} />)

      const gallery = screen.getByRole('region')
      expect(gallery).toHaveAttribute('aria-label', 'Image gallery')
    })
  })

  describe('Thumbnail Configuration', () => {
    it('should use default 4 columns for thumbnails', () => {
      const { container } = renderWithLayout(<ImageGallery images={mockImages} direction={DirectionEnum.LTR} />)

      const thumbnailGrid = container.querySelector('.grid-cols-4')
      expect(thumbnailGrid).toBeInTheDocument()
    })

    it('should use 3 columns when thumbnailCols is 3', () => {
      const { container } = renderWithLayout(
        <ImageGallery images={mockImages} direction={DirectionEnum.LTR} thumbnailCols={3} />
      )

      const thumbnailGrid = container.querySelector('.grid-cols-3')
      expect(thumbnailGrid).toBeInTheDocument()
    })

    it('should use 5 columns when thumbnailCols is 5', () => {
      const { container } = renderWithLayout(
        <ImageGallery images={mockImages} direction={DirectionEnum.LTR} thumbnailCols={5} />
      )

      const thumbnailGrid = container.querySelector('.grid-cols-5')
      expect(thumbnailGrid).toBeInTheDocument()
    })
  })

  describe('Thumbnail Accessibility', () => {
    it('should use fallback aria-label when image has no alternativeText', () => {
      const imagesWithoutAlt: PluginUploadFileDocument[] = [
        {
          documentId: 'img-no-alt-1',
          id: 10,
          url: '/images/no-alt1.jpg',
          alternativeText: null,
          name: 'no-alt1.jpg',
          hash: 'hash-no-alt1',
          ext: '.jpg',
          mime: 'image/jpeg',
          size: 100,
          provider: 'local',
          publishedAt: '2025-01-01',
        } as unknown as PluginUploadFileDocument,
        {
          documentId: 'img-no-alt-2',
          id: 11,
          url: '/images/no-alt2.jpg',
          alternativeText: null,
          name: 'no-alt2.jpg',
          hash: 'hash-no-alt2',
          ext: '.jpg',
          mime: 'image/jpeg',
          size: 100,
          provider: 'local',
          publishedAt: '2025-01-01',
        } as unknown as PluginUploadFileDocument,
      ]

      renderWithLayout(<ImageGallery images={imagesWithoutAlt} direction={DirectionEnum.LTR} />)

      // Thumbnails should use fallback aria-label "View image N"
      const buttons = screen.getAllByRole('button')
      expect(buttons[0]).toHaveAttribute('aria-label', 'View image 1')
      expect(buttons[1]).toHaveAttribute('aria-label', 'View image 2')
    })
  })

  describe('Placeholder', () => {
    it('should render placeholder icon when images array is empty', () => {
      renderWithLayout(<ImageGallery images={[]} direction={DirectionEnum.LTR} placeholderIcon="image" />)

      const icon = screen.getByTestId('mock-icon')
      expect(icon).toHaveAttribute('data-icon', 'image')
      expect(icon).toHaveAttribute('data-size', '6xl')
    })

    it('should render default placeholder icon when not specified', () => {
      renderWithLayout(<ImageGallery images={[]} direction={DirectionEnum.LTR} />)

      const icon = screen.getByTestId('mock-icon')
      expect(icon).toHaveAttribute('data-icon', 'image')
    })
  })
})
