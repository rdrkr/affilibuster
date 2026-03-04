// Copyright (c) 2025 Affilibuster by Ronen Druker.

import type { PluginUploadFileDocument } from '@/lib/generated/types.gen'

/** Default placeholder image for missing images */
export const PLACEHOLDER_IMAGE = '/images/placeholder.svg'

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

/**
 * Resolves an image URL from CMS.
 * @param source - CMS media object
 * @returns Resolved full image URL or placeholder
 */
export function resolveImageUrl(source: PluginUploadFileDocument | undefined | null): string {
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

  const cmsPort = process.env.NEXT_PUBLIC_CMS_PORT ?? '1337'
  const cmsProtocol = process.env.NEXT_PUBLIC_CMS_PROTOCOL ?? 'https'
  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL ?? `${cmsProtocol}://localhost:${cmsPort}`

  // CMS relative URLs - prepend CMS base URL
  return `${cmsUrl}${url}`
}

/**
 * Gets alternative text from a CMS media object.
 * @param media - CMS media object
 * @returns Alternative text or fallback
 */
export function getAltText(media: PluginUploadFileDocument | undefined | null): string {
  return media?.alternativeText ?? ''
}
