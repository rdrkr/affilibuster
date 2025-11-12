// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Footer Component
 * Reference: T116 (Footer component - multi-language aware)
 * Site footer with language-aware links
 * Receives footer data from server-side layout
 */

'use client'

import Link from 'next/link'
import type { Footer as FooterType } from '@/lib/types'
import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '@/lib/types'
import { Button } from './Button'
import { Input } from './Input'

interface FooterProps {
  data: FooterType | null
  lang: string
}

export function Footer({ data: footerData, lang }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const langPrefix = SUPPORTED_LANGUAGE_CODES.includes(lang as LanguageCode) ? `/${lang}` : ''
  const isRTL = (lang as LanguageCode) === LanguageCode.HE

  // Don't render footer if data is unavailable
  if (!footerData) {
    return null
  }

  const footerLinks = [
    { href: '/privacy', label: footerData.privacyPolicyLabel },
    { href: '/terms', label: footerData.termsOfServiceLabel },
    { href: '/contact', label: footerData.contactLabel },
    { href: '/about', label: footerData.aboutUsLabel },
  ]

  return (
    <footer className="bg-primary-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* About */}
          <div className="flex flex-col">
            {/* Logo appears only with icon, brand name removed per CMS centralization */}
            <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'justify-end' : ''}`} dir="ltr">
              <svg className="w-8 h-8 text-secondary-400" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" rx="20" fill="white" />
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
            </div>
            <p className="text-neutral-100 mb-6 max-w-sm">{footerData.brandDescription}</p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-800 hover:bg-tertiary-600 p-3 rounded-lg transition-colors hover:text-primary-900"
                aria-label={footerData.twitterAriaLabel}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-800 hover:bg-tertiary-600 p-3 rounded-lg transition-colors hover:text-primary-900"
                aria-label={footerData.facebookAriaLabel}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center">
            <h2 className={`w-full text-lg font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {footerData.quickLinksTitle}
            </h2>
            <ul className={`space-y-3 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {footerLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={`${langPrefix}${link.href}`}
                    className="text-neutral-100 hover:text-secondary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold mb-4">{footerData.newsletterTitle}</h2>
            <p className="text-neutral-100 text-sm mb-4">{footerData.newsletterDescription}</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={footerData.emailPlaceholder}
                className="flex-1 min-w-0 bg-white dark:bg-primary-800 border-neutral-300 dark:border-primary-700 !text-neutral-900 dark:!text-white placeholder:text-neutral-400"
                aria-label={footerData.emailPlaceholder}
              />
              <Button variant="secondary" className="whitespace-nowrap shrink-0">
                {footerData.subscribeButton}
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-200 text-sm">
            &copy; {currentYear} {footerData.copyrightText}
          </p>
          <div className="flex items-center gap-6 text-sm text-neutral-200">
            <span>{footerData.footerTagline}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
