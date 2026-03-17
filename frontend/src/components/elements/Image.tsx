// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * CMS Image Component
 *
 * Wrapper around Next.js Image that automatically resolves CMS image URLs
 * and extracts alt text from CMS media objects. Falls back to placeholder
 * when images fail to load.
 */

'use client'

import type { PluginUploadFileDocument } from '@/lib/generated/types.gen'
import NextImage, { ImageProps as NextImageProps } from 'next/image'
import { useState } from 'react'

import { getAltText, PLACEHOLDER_IMAGE, resolveImageUrl } from '@/components/elements/imageUtils'

/**
 * Props for the Image component
 */
export interface ImageProps extends Omit<NextImageProps, 'src' | 'alt'> {
  /** CMS media object */
  image: PluginUploadFileDocument | undefined | null
  /** Controls visibility - when false, element is hidden from layout */
  visible?: boolean
  /** Whether to preload image with high fetch priority (for LCP optimization) */
  preload?: boolean
}

/**
 * Image component that automatically resolves CMS media URLs and alt text.
 * Falls back to placeholder on load errors (404, network issues, etc).
 * @param props - Component props with CMS image data
 * @param props.image - CMS media object
 * @param props.visible - Controls visibility (false = hidden from layout)
 * @param props.preload - Whether to preload image with high fetch priority (for LCP optimization)
 * @returns Next.js Image with resolved src and alt, or null if not visible
 * @example
 * ```tsx
 * <Image image={product.images[0]} fill className="object-cover" />
 * <Image image={hero.image} fetchPriority="high" loading="eager" sizes="100vw" />
 * <Image image={thumbnail} visible={showThumbnail} />
 * ```
 */
export function Image({ image, visible, preload, ...props }: ImageProps) {
  const [hasError, setHasError] = useState(false)

  if (visible === false) {
    return null
  }

  const resolvedSrc = resolveImageUrl(image)
  const src = hasError ? PLACEHOLDER_IMAGE : resolvedSrc
  const alt = getAltText(image)

  /**
   * Handles image load errors by switching to placeholder.
   */
  const handleError = () => {
    if (!hasError) {
      setHasError(true)
    }
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      onError={handleError}
      {...(preload ? { fetchPriority: 'high' as const, loading: 'eager' as const } : {})}
      {...props}
    />
  )
}

export default Image
