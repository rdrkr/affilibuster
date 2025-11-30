// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Navigation Component
 *
 * Main navigation bar consuming all content from CMS CMS.
 * Composes sub-components for search, theme, language, mobile menu, and product categories.
 */

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { resolveIcon } from '@/components/elements'
import type { ApiNavigationNavigationDocument } from '@/lib/generated/types.gen'
import { CodeEnum, DirectionEnum, Language } from '@/lib/generated/types.gen'

import { LanguageMenu, ProductCategoriesMenu, SearchMenu, ThemeMenu, type LanguageOption } from '@/components/menus'
import { CMSIcon, CMSText } from '../elements'
import { MobileMenu, type MobileNavLink } from './MobileMenu'

/**
 * Extracts the current language code from a pathname
 * @param pathname - The current URL pathname (e.g., '/en/products' or '/he')
 * @returns The language code (e.g., CodeEnum.EN, CodeEnum.HE, CodeEnum.IT) or CodeEnum.EN as default
 */
function getLanguageFromPathname(pathname: string): CodeEnum {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  if (firstSegment?.length === 2) {
    return firstSegment as CodeEnum
  }
  return CodeEnum.EN
}

/**
 * Creates a new pathname with the language segment replaced
 * @param pathname - The current URL pathname
 * @param newLang - The new language code to use
 * @returns The pathname with the language segment replaced
 */
function replaceLanguageInPathname(pathname: string, newLang: CodeEnum): string {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  if (firstSegment?.length === 2) {
    segments[0] = newLang
    return '/' + segments.join('/')
  }
  return `/${newLang}`
}

/**
 * Props for the Navigation component
 */
export interface NavigationProps {
  /** Navigation data from CMS */
  data: ApiNavigationNavigationDocument
  /** Languages from API */
  languages?: Language[]
  /** Text direction for RTL support */
  direction: DirectionEnum
}

/**
 * Main navigation bar component
 * @param props - Component props with CMS navigation data
 * @param props.data - Navigation data from CMS
 * @param props.languages - Languages from API
 * @param props.direction - Text direction for RTL support
 * @returns Navigation component
 */
export function Navigation({ data, languages: apiLanguages, direction }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('System')
  const isRTL = direction === DirectionEnum.RTL

  const pathname = usePathname()
  const router = useRouter()

  // Get current language from URL pathname
  const currentLang = getLanguageFromPathname(pathname)

  /**
   * Handles language change by navigating to the new locale path
   * @param langCode - The new language code to switch to
   */
  const handleLanguageChange = (langCode: CodeEnum): void => {
    if (langCode !== currentLang) {
      const newPath = replaceLanguageInPathname(pathname, langCode)
      router.push(newPath)
    }
  }

  /**
   * Check if a path is currently active
   * @param path - Path to check
   * @returns True if the path is active
   */
  const isActive = (path: string): boolean => {
    // Handle /en locale for home page
    if (path === '/' && (pathname === '/en' || pathname === '/')) return true
    if (path === '/' && pathname !== '/' && pathname !== '/en') return false
    return pathname.startsWith(path)
  }

  // Map API languages to LanguageOption format
  // displayName contains the native name (e.g., "עברית" for Hebrew)
  const languages: LanguageOption[] = apiLanguages
    ? apiLanguages.map(lang => ({
        name: lang.displayName,
        flag: lang.flag,
        code: lang.code,
      }))
    : []

  // Build mobile nav links from CMS data
  const mobileNavLinks: MobileNavLink[] = [
    { href: data.homeButton.url, text: data.homeButton.label?.text, isActive: isActive('/') },
    {
      href: data.productsMenu.menuButton.url,
      text: data.productsMenu.menuButton.label?.text,
      isActive: isActive('/products'),
    },
    { href: data.blogButton.url, text: data.blogButton.label?.text, isActive: isActive('/blog') },
    { href: data.aboutButton.url, text: data.aboutButton.label?.text, isActive: isActive('/about') },
  ]

  // Resolve brand icon
  const brandIcon = resolveIcon(data.brandButton.label?.icon)

  return (
    <div
      className={`
      sticky top-4 z-50 px-4 py-4
      sm:px-6
      lg:px-8
    `}
    >
      <nav
        className={`
          relative rounded-full border border-white/10 bg-surface-dark/90 p-2
          shadow-lg backdrop-blur-lg
          md:p-3
          lg:px-6
        `}
        aria-label="Main navigation"
      >
        <div className={`relative z-20 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Brand Logo */}
            <Link
              href={data.brandButton.url}
              className="group flex shrink-0 items-center gap-3"
              aria-label={data.brandButton.label?.ariaDescription}
            >
              {brandIcon?.type === 'local' ? (
                <Image
                  src={brandIcon.value}
                  alt=""
                  width={32}
                  height={32}
                  className={`
                    transition-transform
                    group-hover:scale-110
                  `}
                  aria-hidden="true"
                />
              ) : (
                <CMSIcon
                  icon={data.brandButton.label?.icon}
                  size="xl"
                  className={`
                    transition-transform
                    group-hover:scale-110
                  `}
                />
              )}
              <h1
                className={`
                hidden text-xl font-bold tracking-tight text-white
                sm:text-2xl
                lg:block
              `}
              >
                <CMSText text={data.brandButton.label?.text} />
              </h1>
            </Link>

            {/* Desktop Navigation Links */}
            <div
              className={`
                hidden items-center justify-center gap-6 text-sm font-semibold
                text-text-secondary-dark
                md:flex
                ${isRTL ? 'flex-row-reverse' : ''}
              `}
            >
              <Link
                href={data.homeButton.url}
                className={`
                  flex items-center gap-1.5 transition-colors
                  hover:text-primary
                  ${isActive('/') ? `text-primary` : ''}
                `}
                aria-label={data.homeButton.label?.ariaDescription}
              >
                <CMSIcon icon={data.homeButton.label?.icon} size="md" />
                <CMSText text={data.homeButton.label?.text} />
              </Link>

              {/* Products Dropdown */}
              <ProductCategoriesMenu data={data.productsMenu} isActive={isActive('/products')} />

              <Link
                href={data.blogButton.url}
                className={`
                  flex items-center gap-1.5 transition-colors
                  hover:text-primary
                  ${isActive('/blog') ? `text-primary` : ''}
                `}
                aria-label={data.blogButton.label?.ariaDescription}
              >
                <CMSIcon icon={data.blogButton.label?.icon} size="md" />
                <CMSText text={data.blogButton.label?.text} />
              </Link>
              <Link
                href={data.aboutButton.url}
                className={`
                  flex items-center gap-1.5 whitespace-nowrap transition-colors
                  hover:text-primary
                  ${isActive('/about') ? `text-primary` : ''}
                `}
                aria-label={data.aboutButton.label?.ariaDescription}
              >
                <CMSIcon icon={data.aboutButton.label?.icon} size="md" />
                <CMSText text={data.aboutButton.label?.text} />
              </Link>
            </div>
          </div>

          <div
            className={`
            flex items-center gap-2 text-sm font-medium text-text-secondary-dark
            sm:gap-3
            ${isRTL ? 'flex-row-reverse' : ''}
          `}
          >
            {/* Search */}
            <SearchMenu data={data.searchMenu} />

            {/* Theme Selector */}
            <ThemeMenu data={data.themeMenu} selectedTheme={selectedTheme} onThemeChange={setSelectedTheme} />

            {/* Language Selector */}
            <LanguageMenu
              data={data.languageMenu}
              languages={languages}
              selectedLang={currentLang}
              onLanguageChange={handleLanguageChange}
            />

            {/* Login Button */}
            <Link
              href={data.loginButton.url}
              className={`
                hidden shrink-0 items-center gap-2 rounded-full bg-primary px-5
                py-2 font-bold text-background-dark transition-colors
                hover:bg-primary-hover
                sm:flex
              `}
              aria-label={data.loginButton.label?.ariaDescription}
            >
              <CMSIcon icon={data.loginButton.label?.icon} size="lg" />
              <span>
                <CMSText text={data.loginButton.label?.text} />
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <MobileMenu
              data={data.mobileMenuButton}
              isOpen={isMenuOpen}
              onToggle={() => {
                setIsMenuOpen(!isMenuOpen)
              }}
              navLinks={mobileNavLinks}
              loginButton={data.loginButton}
            />
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navigation
