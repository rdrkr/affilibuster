// Copyright (c) 2025 Affilibuster by Ronen Druker.

import '@/styles/globals.css'
import type { Metadata } from 'next'

/**
 * Generate base-level metadata for the application.
 * Only includes metadataBase and manifest; per-page metadata is handled
 * by the [lang] layout and individual page generateMetadata functions.
 * @returns Metadata object with metadataBase and manifest
 */
export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    manifest: '/manifest.webmanifest',
  }
}

/**
 * Root layout pass-through. The HTML shell (html, body, theme, font)
 * is rendered by the [lang]/layout.tsx which has access to the locale
 * for setting the html lang and dir attributes.
 * @param root0 - Root props object
 * @param root0.children - Child components to render
 * @returns Children without additional wrapping
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
