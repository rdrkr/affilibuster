// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Navigation Component
 * Reference: T115 (Navigation component - multi-language aware)
 * Main navigation bar with language-aware links and authentication UI
 * Receives nav data from server-side layout
 */

'use client'

import { useAuth } from '@/lib/auth'
import { CodeEnum } from '@/lib/generated/types.gen'
import type { Navigation as NavigationType } from '@/lib/types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'
import { CurrencySelector } from './CurrencySelector'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeSelector } from './ThemeSelector'

interface NavLink {
  href: string
  label: string
}

interface NavigationProps {
  data: NavigationType | null
  lang: string
}

/**
 * Navigation component with auth-aware UI
 *
 * @param props - Component props
 * @returns Navigation component
 *
 * @example
 * ```tsx
 * <Navigation data={navData} lang="en" />
 * ```
 */
export function Navigation({ data: navData, lang }: NavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, isLoading, logout } = useAuth()

  // Build language prefix
  const langPrefix = [CodeEnum.IT, CodeEnum.HE, CodeEnum.EN].includes(lang as CodeEnum) ? `/${lang}` : ''

  // Close user menu when clicking outside
  useEffect(() => {
    /**
     * Handle clicks outside user menu
     *
     * @param event - Mouse event
     */
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Render minimal navigation with selectors even if full data is unavailable
  // This ensures language/currency/theme selectors are always accessible
  if (!navData) {
    return (
      <nav className="bg-primary-900 text-white shadow-lg text-left rtl:text-right" data-testid="main-navigation">
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
              Affilibuster
            </Link>
            {/* Right Side Actions */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <LanguageSwitcher />
              <CurrencySelector />
              <ThemeSelector />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  const navLinks: NavLink[] = [
    { href: '/', label: navData.homeLabel || '' },
    { href: '/products', label: navData.productsLabel || '' },
    { href: '/about', label: navData.aboutLabel || '' },
    { href: '/contact', label: navData.contactLabel || '' },
  ]

  /**
   * Handle logout button click
   */
  const handleLogout = async (): Promise<void> => {
    await logout()
    setIsUserMenuOpen(false)
    window.location.href = `/${lang}`
  }

  return (
    <nav className="bg-primary-900 text-white shadow-lg text-left rtl:text-right" data-testid="main-navigation">
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
          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            {navLinks.map(link => {
              const fullHref = `${langPrefix}${link.href}`
              const isActive = pathname === fullHref

              return (
                <Link
                  key={link.href}
                  href={fullHref}
                  className={`px-4 py-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all border-b-2 ${
                    isActive
                      ? 'bg-primary-800 text-white border-tertiary-400'
                      : 'text-white hover:bg-primary-800 border-b-2 border-transparent hover:border-tertiary-400'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <LanguageSwitcher />
            <CurrencySelector />
            <ThemeSelector />

            {/* Authentication UI */}
            {isLoading ? (
              // Loading skeleton
              <div className="flex items-center space-x-3" data-testid="auth-loading">
                <div className="w-16 h-8 bg-primary-800 rounded animate-pulse" />
                <div className="w-16 h-8 bg-primary-800 rounded animate-pulse" />
              </div>
            ) : user ? (
              // Authenticated: Show user menu
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-primary-800"
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen)
                  }}
                  aria-label={user.displayName}
                  data-testid="user-menu"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {user.displayName}
                </Button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg py-2 border border-neutral-200 dark:border-neutral-700 z-50">
                    <Link
                      href={`${langPrefix}/profile`}
                      className="block px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                      }}
                    >
                      Profile
                    </Link>
                    <Link
                      href={`${langPrefix}/settings`}
                      className="block px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                      }}
                    >
                      Settings
                    </Link>
                    <hr className="my-2 border-neutral-200 dark:border-neutral-700" />
                    <button
                      onClick={() => {
                        void handleLogout()
                      }}
                      className="w-full text-left px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      data-testid="logout-button"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Not authenticated: Show login/sign up buttons
              <>
                <Link href={`${langPrefix}/login`} data-testid="login-link">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-primary-800">
                    Log In
                  </Button>
                </Link>
                <Link href={`${langPrefix}/register`} data-testid="register-link">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-primary-800"
              aria-label={isMobileMenuOpen ? navData.mobileMenuCloseLabel : navData.mobileMenuLabel}
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen)
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
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
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                    }}
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
