// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { ThemeProvider } from '@/components/providers'
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
    manifest: '/manifest.webmanifest',
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
  // Inline script to prevent FOUC by setting theme before React hydrates
  const themeScript = `
    (function() {
      try {
        var stored = localStorage.getItem('theme-preference');
        var theme = stored === 'light' || stored === 'dark' ? stored : null;
        if (!theme && stored !== 'light' && stored !== 'dark') {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  `

  return (
    <html suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body
        className={`
          ${inter.className}
          font-sans transition-colors duration-300
          selection:bg-primary selection:text-black
        `}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
