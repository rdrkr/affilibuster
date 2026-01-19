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
import NextImage, { type ImageProps as NextImageProps } from 'next/image'
import { useState } from 'react'

/** Default placeholder image for missing images */
const PLACEHOLDER_IMAGE = '/images/placeholder.svg'

/** Default Image Object for Fallback */
export const DEFAULT_IMAGE: PluginUploadFileDocument = {
  documentId: 'default-placeholder',
  id: 'default-placeholder',
  name: 'Default Placeholder',
  hash: 'placeholder',
  ext: '.svg',
  mime: 'image/svg+xml',
  size: 0,
  url: PLACEHOLDER_IMAGE,
  provider: 'local',
  publishedAt: new Date().toISOString(),
  alternativeText: 'Placeholder Image',
}

/** CMS port from environment */
const CMS_PORT = process.env.NEXT_PUBLIC_CMS_PORT ?? '1337'

/** CMS protocol from environment */
const CMS_PROTOCOL = process.env.NEXT_PUBLIC_CMS_PROTOCOL ?? 'https'

/** CMS base URL for image resolution */
const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? `${CMS_PROTOCOL}://localhost:${CMS_PORT}`

/**
 * Props for the Image component
 */
export interface ImageProps extends Omit<NextImageProps, 'src' | 'alt'> {
  /** CMS media object */
  image: PluginUploadFileDocument | undefined | null
  /** Controls visibility - when false, element is hidden from layout */
  visible?: boolean
}

/**
 * Resolves an image URL from CMS.
 * @param source - CMS media object
 * @returns Resolved full image URL or placeholder
 */
function resolveImageUrl(source: PluginUploadFileDocument | undefined | null): string {
  if (!source?.url) {
    return PLACEHOLDER_IMAGE
  }

  const url = source.url

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
 * @returns Alternative text or fallback
 */
function getAltText(media: PluginUploadFileDocument | undefined | null): string {
  return media?.alternativeText ?? ''
}

/**
 * Image component that automatically resolves CMS media URLs and alt text.
 * Falls back to placeholder on load errors (404, network issues, etc).
 * @param props - Component props with CMS image data
 * @param props.image - CMS media object
 * @param props.visible - Controls visibility (false = hidden from layout)
 * @returns Next.js Image with resolved src and alt, or null if not visible
 * @example
 * ```tsx
 * <Image image={product.images[0]} fill className="object-cover" />
 * <Image image={hero.image} priority sizes="100vw" />
 * <Image image={thumbnail} visible={showThumbnail} />
 * ```
 */
export function Image({ image, visible, ...props }: ImageProps) {
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

  return <NextImage src={src} alt={alt} onError={handleError} {...props} />
}

export default Image
