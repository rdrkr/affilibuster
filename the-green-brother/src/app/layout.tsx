// Copyright (c) 2025 Affilibuster by Ronen Druker.

import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Heebo, Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const heebo = Heebo({ subsets: ['hebrew', 'latin'], display: 'swap', variable: '--font-heebo' })

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
 * Inline script that creates a default Trusted Types policy.
 * Required when CSP includes `require-trusted-types-for 'script'` to
 * prevent React's `dangerouslySetInnerHTML` from being blocked.
 * The default policy is a pass-through that satisfies the Trusted Types
 * requirement while maintaining compatibility with React internals.
 */
const trustedTypesScript = `
  (function() {
    try {
      if (typeof window !== 'undefined' && window.trustedTypes && window.trustedTypes.createPolicy) {
        window.trustedTypes.createPolicy('default', {
          createHTML: function(s) { return s; },
          createScript: function(s) { return s; },
          createScriptURL: function(s) { return s; }
        });
      }
    } catch (e) {}
  })();
`

/**
 * Inline script that sets the correct lang and dir attributes on the
 * html element based on the URL pathname. Runs before React hydrates
 * to avoid a flash of incorrect language/direction.
 */
const localeScript = `
  (function() {
    try {
      var path = window.location.pathname;
      var match = path.match(/^\\/([a-z]{2})(?:\\/|$)/);
      if (match) {
        var lang = match[1];
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
      }
    } catch (e) {}
  })();
`

/**
 * Inline script that prevents FOUC by setting the theme data attribute
 * before React hydrates. Reads from localStorage or falls back to
 * the system color scheme preference.
 */
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('theme-preference');
      var theme = stored === 'light' || stored === 'dark' ? stored : null;
      if (!theme) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  })();
`

/**
 * Root layout providing the HTML shell with default lang/dir attributes,
 * font CSS variables, and inline scripts for locale and theme detection.
 * The [lang]/layout.tsx provides locale-specific providers and content.
 * @param root0 - Root props object
 * @param root0.children - Child components to render
 * @returns Full HTML document shell wrapping children
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: trustedTypesScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`
          ${inter.variable} ${heebo.variable}
          font-sans text-foreground caret-caret transition-colors
          duration-300 selection:bg-selection selection:text-selection-foreground
        `}
      >
        {children}
      </body>
    </html>
  )
}
