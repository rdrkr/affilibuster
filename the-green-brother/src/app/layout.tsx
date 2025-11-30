// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getNavigation } from '@/lib/content/api'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

/**
 * Generate metadata for the root layout from navigation data.
 * @returns Metadata object with title and description
 */
export async function generateMetadata(): Promise<Metadata> {
  const navigation = await getNavigation()
  return {
    title: navigation?.siteTitle ?? 'TheGreenBrother - Sustainable Products',
    description: navigation?.siteDescription ?? 'Your trusted source for curated sustainable products.',
  }
}

/**
 * Root layout component that wraps all pages.
 * @param root0 - Root props object
 * @param root0.children - Child components to render
 * @returns Root HTML layout with children
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body
        className={`
          ${inter.className}
          bg-background-dark font-sans text-text-main-dark
          selection:bg-primary selection:text-black
        `}
      >
        {children}
      </body>
    </html>
  )
}
