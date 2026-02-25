// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for root layout component.
 * Root layout is a pass-through that delegates HTML shell to [lang]/layout.tsx.
 */

import RootLayout, { generateMetadata } from '@/app/layout'

describe('RootLayout', () => {
  it('should be a valid React component', () => {
    expect(typeof RootLayout).toBe('function')
  })

  it('should pass through children directly', () => {
    const child = <div>Test</div>
    const result = RootLayout({ children: child })

    expect(result).toBe(child)
  })
})

describe('generateMetadata', () => {
  it('should return metadataBase and manifest', () => {
    const metadata = generateMetadata()

    expect(metadata.metadataBase).toBeInstanceOf(URL)
    expect(metadata.metadataBase?.toString()).toBe(
      new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').toString()
    )
    expect(metadata.manifest).toBe('/manifest.webmanifest')
  })

  it('should not include title or description', () => {
    const metadata = generateMetadata()

    expect(metadata.title).toBeUndefined()
    expect(metadata.description).toBeUndefined()
  })
})
