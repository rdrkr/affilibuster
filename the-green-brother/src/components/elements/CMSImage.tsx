// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * CMS Image Component
 *
 * Wrapper around Next.js Image that automatically resolves CMS image URLs
 * and extracts alt text from CMS media objects. Falls back to placeholder
 * when images fail to load.
 */

'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

/** Default placeholder image for missing images */
const PLACEHOLDER_IMAGE = '/images/placeholder.svg'

/** CMS base URL for image resolution */
const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? 'https://localhost:1337'

/**
 * Represents a CMS media object with a URL field.
 */
export interface CMSMedia {
  url?: string
  alternativeText?: string | null
}

/**
 * Props for the CMSImage component
 */
export interface CMSImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  /** CMS media object or URL string */
  image: string | CMSMedia | undefined | null
  /** Fallback alt text if not provided in media object */
  fallbackAlt?: string
}

/**
 * Resolves an image URL from CMS.
 * @param source - Image URL string or CMS media object
 * @returns Resolved full image URL or placeholder
 */
function resolveImageUrl(source: string | CMSMedia | undefined | null): string {
  if (!source) {
    return PLACEHOLDER_IMAGE
  }

  const url = typeof source === 'string' ? source : source.url

  if (!url) {
    return PLACEHOLDER_IMAGE
  }

  // Absolute URLs (external) - return as-is
  if (url.startsWith('http')) {
    return url
  }

  // Local public folder paths (e.g., /images/, /icons/) - return as-is
  if (url.startsWith('/images/') || url.startsWith('/icons/')) {
    return url
  }

  // CMS relative URLs - prepend CMS base URL
  return `${CMS_URL}${url}`
}

/**
 * Gets alternative text from a CMS media object.
 * @param media - CMS media object
 * @param fallback - Fallback text if alternativeText is not set
 * @returns Alternative text or fallback
 */
function getAltText(media: CMSMedia | undefined | null, fallback = ''): string {
  return media?.alternativeText ?? fallback
}

/**
 * Image component that automatically resolves CMS media URLs and alt text.
 * Falls back to placeholder on load errors (404, network issues, etc).
 * @param props - Component props with CMS image data
 * @param props.image - CMS media object or URL string
 * @param props.fallbackAlt - Fallback alt text if not provided in media object
 * @returns Next.js Image with resolved src and alt
 * @example
 * ```tsx
 * <CMSImage image={product.images[0]} fill className="object-cover" />
 * <CMSImage image={hero.image} priority sizes="100vw" />
 * ```
 */
export function CMSImage({ image, fallbackAlt = '', ...props }: CMSImageProps) {
  const [hasError, setHasError] = useState(false)
  const resolvedSrc = resolveImageUrl(image)
  const src = hasError ? PLACEHOLDER_IMAGE : resolvedSrc
  const alt = typeof image === 'object' && image ? getAltText(image, fallbackAlt) : fallbackAlt

  /**
   * Handles image load errors by switching to placeholder.
   */
  const handleError = () => {
    if (!hasError) {
      setHasError(true)
    }
  }

  return <Image src={src} alt={alt} onError={handleError} {...props} />
}

export default CMSImage
