// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Navigation Component
 * Reference: T115 (Navigation component - multi-language aware)
 * Main navigation bar with language-aware links
 * Fetches nav labels from Strapi CMS
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { CurrencySelector } from './CurrencySelector'
import { ThemeSelector } from './ThemeSelector'
import { useEffect, useState } from 'react'
import { contentAPI } from '@/lib/api'

interface NavLink {
  href: string
  label: string
}

interface NavigationData {
  brandName?: string
  homeLabel?: string
  productsLabel?: string
  aboutLabel?: string
  contactLabel?: string
  languageSelectorLabel?: string
  currencySelectorLabel?: string
  themeSelectorLabel?: string
  themeLightLabel?: string
  themeDarkLabel?: string
  themeSystemLabel?: string
  mobileMenuLabel?: string
  mobileMenuCloseLabel?: string
  twitterLabel?: string
  facebookLabel?: string
  currencySelectorAriaLabel?: string
  languageSelectorAriaLabel?: string
  themeSelectorAriaLabel?: string
  browseProductsButton?: string
  promptTitleTemplate?: string
  promptMessageTemplate?: string
  yesButtonTemplate?: string
  noButtonText?: string
}

export function Navigation() {
  const pathname = usePathname()
  const [navData, setNavData] = useState<NavigationData | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Extract current language prefix
  const pathParts = pathname.split('/').filter(Boolean)
  const lang = pathParts[0] === 'it' || pathParts[0] === 'he' || pathParts[0] === 'en' ? pathParts[0] : 'en'
  const langPrefix = pathParts[0] === 'it' || pathParts[0] === 'he' || pathParts[0] === 'en' ? `/${pathParts[0]}` : ''

  // Fetch navigation labels from CMS
  useEffect(() => {
    async function fetchNavigation() {
      try {
        const data = await contentAPI.getSingleType(lang, 'navigation')
        const navContent = data?.data || data
        if (navContent) {
          setNavData(navContent)
        }
      } catch (error) {
        console.error('Failed to fetch navigation:', error)
        setNavData(null)
      }
    }
    fetchNavigation()
  }, [lang])

  // Don't render navigation if data is unavailable
  if (!navData) {
    return null
  }

  const navLinks: NavLink[] = [
    { href: '/', label: navData.homeLabel || '' },
    { href: '/products', label: navData.productsLabel || '' },
    { href: '/about', label: navData.aboutLabel || '' },
    { href: '/contact', label: navData.contactLabel || '' },
  ]

  return (
    <nav className="bg-primary-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={langPrefix || '/'}
            className="text-2xl font-bold text-white hover:text-secondary-400 transition-colors flex items-center gap-2"
            dir="ltr"
          >
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" rx="20" fill="currentColor" />
              <text
                x="50"
                y="72"
                fontFamily="Arial, sans-serif"
                fontSize="60"
                fontWeight="bold"
                fill="#5B21B6"
                textAnchor="middle"
              >
                A
              </text>
            </svg>
            {navData.brandName}
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => {
              const fullHref = `${langPrefix}${link.href}`
              const isActive = pathname === fullHref

              return (
                <Link
                  key={link.href}
                  href={fullHref}
                  className={`px-4 py-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all border-b-2 ${
                    isActive
                      ? 'bg-primary-700 text-white border-tertiary-400'
                      : 'text-neutral-200 hover:bg-primary-700 hover:text-white border-b-2 border-transparent hover:border-tertiary-400'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Language, Currency & Theme Selectors */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <CurrencySelector />
            <ThemeSelector />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-white hover:bg-primary-700"
              aria-label={isMobileMenuOpen ? navData.mobileMenuCloseLabel : navData.mobileMenuLabel}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-xl mt-2 mx-4">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(link => {
                const fullHref = `${langPrefix}${link.href}`
                const isActive = pathname === fullHref

                return (
                  <Link
                    key={link.href}
                    href={fullHref}
                    className={`block px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-primary-900'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
