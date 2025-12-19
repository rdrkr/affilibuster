// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Mobile Navigation Group Component
 *
 * Collapsible mobile navigation menu with open/close buttons.
 * Button icons and ARIA descriptions come from CMS via MenusMobileMenuEntry.
 * Only displays Start group items (home, products, blog, about).
 */

'use client'

import type { MenusMobileMenuEntry } from '@/lib/generated/types.gen'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

import { ButtonAction } from '../elements'
import { DropdownMenu } from '../menus'

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
 * Props for the MobileNavigationGroup component
 */
export interface MobileNavigationGroupProps {
  /** Navigation data from CMS */
  data: MenusMobileMenuEntry
  /** Whether the menu is currently open (controlled mode) */
  isOpen: boolean
  /** Toggle handler - accepts optional boolean to force state (true=open, false=closed) */
  onToggle: (isOpen?: boolean) => void
  /** Navigation links to display */
  navLinks: MobileNavLink[]
  /** Whether the mobile menu should be visible (controls animation state) */
  visible?: boolean
  /** Text direction for RTL support */
  direction: DirectionEnum
}

/**
 * Mobile Navigation Group
 *
 * Displays a mobile menu toggle button and a dropdown menu with navigation links.
 * Used in the EndNavigationGroup when screen size is small or items are collapsed.
 * Supports both click-to-toggle and hover-to-open interactions.
 * @param props - Component props
 * @param props.data - Navigation data from CMS
 * @param props.isOpen - Whether the menu is currently open
 * @param props.onToggle - Toggle handler
 * @param props.navLinks - Navigation links to display
 * @param props.visible - Whether the mobile menu should be visible (controls animation state)
 * @param props.direction - Text direction for RTL support
 * @returns Mobile navigation group component
 */
export function MobileNavigationGroup({
  data,
  isOpen,
  onToggle,
  navLinks,
  visible = true,
  direction,
}: MobileNavigationGroupProps) {
  // Use the appropriate button data based on open state
  const triggerData = isOpen ? data.closeButton : data.openButton

  return (
    <DropdownMenu
      triggerData={triggerData}
      direction={direction}
      showText={false}
      visible={visible}
      iconSize="lg"
      align="end"
      testId="mobile-navigation-group-container"
      isOpen={isOpen}
      onOpenChange={onToggle}
    >
      {navLinks.map(link => (
        <ButtonAction
          key={link.href}
          data={{
            label: {
              text: link.text ?? '',
              iconPosition: IconPositionEnum.BEFORE_TEXT,
              ariaDescription: link.text ?? '',
            },
            url: link.href,
            openInNewTab: false,
          }}
          showText={true}
          direction={direction}
          onClick={() => {
            onToggle(false)
            window.location.href = link.href
          }}
          variant="ghost-2"
          iconSize="sm"
          size="sm"
          isActive={link.isActive}
        />
      ))}
    </DropdownMenu>
  )
}

export default MobileNavigationGroup
