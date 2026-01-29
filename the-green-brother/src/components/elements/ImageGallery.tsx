// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * ImageGallery Component
 *
 * Reusable image gallery component for product detail pages.
 * Features a main image display with thumbnail grid for image selection.
 * Supports RTL layout and dark mode.
 */

'use client'

import { useState } from 'react'

import { DirectionEnum, type PluginUploadFileDocument } from '@/lib/generated/types.gen'

import { Icon } from './Icon'
import { Image } from './Image'

/**
 * Props for the ImageGallery component
 */
export interface ImageGalleryProps {
  /** Images from CMS */
  images: PluginUploadFileDocument[]
  /** Text direction for RTL layout */
  direction: DirectionEnum
  /** Additional CSS classes */
  className?: string
  /** Preload first image for LCP optimization */
  preload?: boolean
  /** Image sizes attribute for responsive images */
  sizes?: string
  /** Number of columns for thumbnail grid (default: 4) */
  thumbnailCols?: 3 | 4 | 5
  /** Placeholder icon when no image available (Material Icon name, default: 'image') */
  placeholderIcon?: string
  /** Aria label for the gallery region */
  ariaLabel?: string
}

/**
 * Maps thumbnail column count to Tailwind grid class
 */
const thumbnailColsMap = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
} as const

/**
 * Renders an image gallery with main image and thumbnail selection.
 *
 * Features:
 * - Main image display with aspect-square container
 * - Thumbnail grid for image selection
 * - RTL support via direction prop
 * - Dark mode support via Tailwind dark: variants
 * - Accessibility with role="region" and aria-labels
 * - Placeholder icon for missing images
 * @param props - Component properties
 * @param props.images - Array of images from CMS
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.className - Additional CSS classes
 * @param props.preload - Whether to preload the first image
 * @param props.sizes - Responsive image sizes attribute
 * @param props.thumbnailCols - Number of columns for thumbnail grid
 * @param props.placeholderIcon - Icon to show when no images available
 * @param props.ariaLabel - Accessibility label for the gallery
 * @returns Image gallery component
 */
export function ImageGallery({
  images,
  direction: _direction,
  className = '',
  preload = false,
  sizes = '(max-width: 768px) 100vw, 600px',
  thumbnailCols = 4,
  placeholderIcon = 'image',
  ariaLabel = 'Image gallery',
}: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const selectedImage = images[selectedImageIndex]
  const showThumbnails = images.length > 1

  /**
   * Handles thumbnail click to select a new image
   * @param index - Index of the clicked thumbnail
   */
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  return (
    <div role="region" aria-label={ariaLabel} className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div
        className={`
          relative aspect-square overflow-hidden rounded-xl border
          border-neutral-200 bg-white
          dark:border-tertiary-700 dark:bg-tertiary-800
        `}
      >
        {selectedImage ? (
          // eslint-disable-next-line @typescript-eslint/no-deprecated -- Using priority prop for LCP optimization
          <Image image={selectedImage} className="object-cover" fill sizes={sizes} priority={preload} />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Icon icon={placeholderIcon} size="6xl" className="text-tertiary-600" />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && (
        <div className={`grid ${thumbnailColsMap[thumbnailCols]} gap-4`}>
          {images.map((img, index) => (
            <button
              key={img.documentId}
              type="button"
              onClick={() => {
                handleThumbnailClick(index)
              }}
              className={`
                aspect-square overflow-hidden rounded-xl border-2
                ${index === selectedImageIndex ? 'border-primary-500' : 'border-transparent'}
                relative bg-white transition-colors hover:border-primary-500/50
                dark:bg-tertiary-800
              `}
              aria-label={img.alternativeText ?? `View image ${String(index + 1)}`}
              aria-pressed={index === selectedImageIndex}
            >
              <Image image={img} className="object-cover" fill sizes="100px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
