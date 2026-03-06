// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * ImageGallery Component
 *
 * Reusable image gallery component for product detail pages.
 * Features a main image display with thumbnail grid for image selection.
 * Supports RTL layout, dark mode, and auto-rotation with animated transitions.
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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
  /** Feature flag: Enable user profile features (favorites) */
  enableUserProfile?: boolean
  /** Callback when wishlist button is clicked */
  onWishlistClick?: () => void
  /** Auto-rotation interval in milliseconds (default: 5000, 0 to disable) */
  autoRotateInterval?: number
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
 * - Animated crossfade transitions between images
 * - Auto-rotation with configurable interval (default: 5 seconds)
 * - Thumbnail grid with animated border indicator
 * - RTL support via direction prop
 * - Dark mode support via Tailwind dark: variants
 * - Accessibility with role="region" and aria-labels
 * - Placeholder icon for missing images
 * - Optional wishlist button overlay (requires enableUserProfile)
 * @param props - Component properties
 * @param props.images - Array of images from CMS
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.className - Additional CSS classes
 * @param props.preload - Whether to preload the first image
 * @param props.sizes - Responsive image sizes attribute
 * @param props.thumbnailCols - Number of columns for thumbnail grid
 * @param props.placeholderIcon - Icon to show when no images available
 * @param props.ariaLabel - Accessibility label for the gallery
 * @param props.enableUserProfile - Whether to show wishlist button
 * @param props.onWishlistClick - Callback when wishlist button is clicked
 * @param props.autoRotateInterval - Auto-rotation interval in ms (default: 5000, 0 to disable)
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
  enableUserProfile = false,
  onWishlistClick,
  autoRotateInterval = 5000,
}: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [prevImage, setPrevImage] = useState<PluginUploadFileDocument | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevIndexRef = useRef(0)

  const selectedImage = images[selectedImageIndex]
  const showThumbnails = images.length > 1
  const itemCount = images.length

  /**
   * Trigger crossfade: capture outgoing image before updating index
   * @param newIndex - The new image index to switch to
   */
  const changeImage = useCallback(
    (newIndex: number) => {
      if (newIndex === prevIndexRef.current) return
      const outgoing = images[prevIndexRef.current]
      /* istanbul ignore else -- defensive fallback */
      if (outgoing) {
        setPrevImage(outgoing)
      }
      prevIndexRef.current = newIndex
      setSelectedImageIndex(newIndex)
    },
    [images]
  )

  /**
   * Navigate to the next image (wraps around)
   */
  const nextImage = useCallback(() => {
    /* istanbul ignore if -- safety check */
    if (images.length <= 1) return
    const next = (prevIndexRef.current + 1) % images.length
    changeImage(next)
  }, [images.length, changeImage])

  /**
   * Handles thumbnail click to select a new image
   * @param index - Index of the clicked thumbnail
   */
  const handleThumbnailClick = (index: number) => {
    changeImage(index)
  }

  /**
   * Handle wishlist button click
   */
  const handleWishlistClick = () => {
    onWishlistClick?.()
  }

  // Auto-rotation effect
  useEffect(() => {
    if (itemCount <= 1 || isPaused || autoRotateInterval <= 0) {
      return
    }

    timerRef.current = setTimeout(nextImage, autoRotateInterval)

    return () => {
      /* istanbul ignore else -- timeout is always set if we reach here */
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [selectedImageIndex, itemCount, autoRotateInterval, nextImage, isPaused])

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={`space-y-4 ${className}`}
      onMouseEnter={() => {
        setIsPaused(true)
      }}
      onMouseLeave={() => {
        setIsPaused(false)
      }}
    >
      {/* Main Image */}
      <div
        className={`
          relative aspect-square overflow-hidden rounded-xl border
          border-border bg-card
        `}
      >
        {selectedImage ? (
          <>
            {/* Previous image – fades out */}
            {prevImage && (
              <div
                key={`prev-${prevImage.documentId}`}
                className="absolute inset-0 z-0 animate-fade-out"
                style={{ animationFillMode: 'forwards' }}
                onAnimationEnd={() => {
                  setPrevImage(null)
                }}
                data-testid="gallery-prev-image"
              >
                <Image image={prevImage} className="object-cover" fill sizes={sizes} />
              </div>
            )}
            {/* Current image – fades in */}
            <div
              key={`current-${selectedImage.documentId}`}
              className="relative z-10 size-full animate-fade-in"
              data-testid="gallery-current-image"
            >
              {/* eslint-disable-next-line @typescript-eslint/no-deprecated -- Using priority prop for LCP optimization */}
              <Image image={selectedImage} className="object-cover" fill sizes={sizes} priority={preload} />
            </div>
          </>
        ) : (
          <div className="flex size-full items-center justify-center">
            <Icon icon={placeholderIcon} size="6xl" className="text-muted-foreground" />
          </div>
        )}

        {/* Wishlist Button Overlay */}
        {enableUserProfile && (
          <div className="absolute top-3 right-3 z-20">
            <button
              type="button"
              onClick={handleWishlistClick}
              className={`
                flex size-10 items-center justify-center rounded-full
                bg-card/50 text-foreground backdrop-blur-md
                transition-colors hover:bg-primary-hover hover:text-foreground
                active:bg-primary-active
                dark:bg-background/50
              `}
              aria-label="Add to favorites"
            >
              <Icon icon="favorite_border" size="lg" />
            </button>
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
                ${index === selectedImageIndex ? 'border-ring' : 'border-transparent'}
                relative bg-card transition-[border-color] duration-300 hover:border-primary-hover/50
                active:border-primary-active
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
