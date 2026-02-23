// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Dynamic OpenGraph image generator using Next.js metadata file convention.
 * Generates a 1200×630 PNG with the site title and description from CMS.
 * Uses `ImageResponse` from `next/og` for server-side image generation.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */

import { getNavigation } from '@/lib/content/api'
import { ImageResponse } from 'next/og'

/** Alt text for the OpenGraph image. */
export const alt = 'TheGreenBrother - Sustainable Products'

/** Image dimensions for OpenGraph (1200×630 is the standard). */
export const size = {
  width: 1200,
  height: 630,
}

/** MIME type of the generated image. */
export const contentType = 'image/png'

/**
 * Generate the OpenGraph image for social sharing.
 * Fetches site title and description from CMS navigation data.
 * @returns ImageResponse with branded OG image
 */
export default async function OpenGraphImage(): Promise<ImageResponse> {
  const navigation = await getNavigation()

  const title = navigation?.siteTitle ?? 'TheGreenBrother'
  const description = navigation?.siteDescription ?? 'Your trusted source for curated sustainable products.'

  return new ImageResponse(
    <div
      style={{
        background: '#1e1e2e',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#a6e3a1',
            textAlign: 'center',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: '28px',
            color: '#cdd6f4',
            textAlign: 'center',
            lineHeight: 1.5,
            margin: 0,
            maxWidth: '900px',
          }}
        >
          {description}
        </p>
      </div>
    </div>,
    { ...size }
  )
}
