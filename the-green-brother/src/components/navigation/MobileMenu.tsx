// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Mobile Menu Component
 *
 * Collapsible mobile navigation menu with open/close buttons.
 * Button icons and ARIA descriptions come from CMS via MenusMobileMenuEntry.
 */

'use client'

import Link from 'next/link'

import type { ElementsButtonEntry, MenusMobileMenuEntry } from '@/lib/generated/types.gen'

import { CMSIcon, CMSText } from '../elements'

/**
 * Navigation link item for mobile menu
 */
export interface MobileNavLink {
  /** Link destination URL */
  href: string
  /** Link display text (optional if label is missing) */
  text: string | undefined
  /** Whether this link is currently active */
  isActive: boolean
}

/**
 * Props for the MobileMenu component
 */
export interface MobileMenuProps {
  /** CMS data for the mobile menu */
  data: MenusMobileMenuEntry
  /** Whether the mobile menu is currently open */
  isOpen: boolean
  /** Callback to toggle menu state */
  onToggle: () => void
  /** Navigation links to display */
  navLinks: MobileNavLink[]
  /** Login button data from CMS */
  loginButton: ElementsButtonEntry
}

/**
 * Mobile navigation menu with collapsible content
 * @param props - Component props with CMS data and callbacks
 * @param props.data - CMS data for the mobile menu
 * @param props.isOpen - Whether the mobile menu is currently open
 * @param props.onToggle - Callback to toggle menu state
 * @param props.navLinks - Navigation links to display
 * @param props.loginButton - Login button data from CMS
 * @returns Mobile menu component
 */
export function MobileMenu({ data, isOpen, onToggle, navLinks, loginButton }: MobileMenuProps) {
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          shrink-0 rounded-full p-2 transition-colors
          hover:bg-surface-dark hover:text-white
          md:hidden
        `}
        aria-label={isOpen ? data.closeButton.label?.ariaDescription : data.openButton.label?.ariaDescription}
        aria-expanded={isOpen}
      >
        <CMSIcon icon={isOpen ? data.closeButton.label?.icon : data.openButton.label?.icon} size="lg" />
      </button>

      {/* Mobile Menu Content */}
      <div
        className={`
          absolute top-full right-0 left-0 overflow-hidden transition-all
          duration-300 ease-in-out
          md:hidden
          ${
            isOpen
              ? 'mt-4 max-h-96 border-t border-white/10 pt-4 opacity-100'
              : `
            max-h-0 opacity-0
          `
          }
        `}
      >
        <div className="flex flex-col gap-4 px-4 pb-2 text-center">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onToggle}
              className={`
                text-lg font-medium transition-colors
                hover:text-primary
                ${link.isActive ? `text-primary` : `text-text-secondary-dark`}
              `}
            >
              <CMSText text={link.text} />
            </Link>
          ))}
          <div className="mt-2 flex justify-center gap-4">
            <Link
              href={loginButton.url}
              onClick={onToggle}
              className={`
                flex items-center gap-2 rounded-full bg-primary px-6 py-2
                font-bold text-background-dark transition-colors
                hover:bg-primary-hover
              `}
            >
              <CMSIcon icon={loginButton.label?.icon} size="lg" />
              <CMSText text={loginButton.label?.text} />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileMenu
