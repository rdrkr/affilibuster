// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Start Navigation Group Component
 *
 * Navigation group for the start (left/right in RTL) of the navigation bar.
 * Owns: brand, home, products, blog, and about links.
 * Handles its own collapsed items based on displayMode.
 */

'use client'

import { useCallback, useEffect } from 'react'

import { usePathname } from 'next/navigation'

import type { ApiNavigationNavigationDocument, DirectionEnum } from '@/lib/generated/types.gen'
import { SEARCH_EXPANDED_WIDTH, THRESHOLDS } from '@/lib/navigation'

import { ProductCategoriesMenu } from '@/components/menus'
import { ButtonLink } from '../elements'
import { NavigationGroup, type DisplayMode } from './NavigationGroup'

/**
 * Navigation link for mobile menu consumption
 */
export interface StartNavLink {
  /** Link ID */
  id: 'home' | 'products' | 'blog' | 'about'
  /** Link destination URL */
  href: string
  /** Link display text */
  text: string | undefined
  /** Whether this link is currently active */
  isActive: boolean
}

/**
 * Props for StartNavigationGroup component
 */
export interface StartNavigationGroupProps {
  /** Navigation data from CMS */
  data: ApiNavigationNavigationDocument
  /** Current display mode */
  displayMode: DisplayMode
  /** Text direction for RTL support */
  direction: DirectionEnum
  /** Current navigation width */
  navWidth: number
  /** Whether search is currently expanded */
  isSearchExpanded?: boolean
  /** Callback to report if all group items have icons */
  onHasIconsChange?: (hasIcons: boolean) => void
}

/**
 * Check if a path is currently active
 * @param pathname - Current pathname
 * @param path - Path to check
 * @returns True if the path is active
 */
function checkIsActive(pathname: string, path: string): boolean {
  const pathWithoutLang = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/')

  if (path === '/') {
    return pathWithoutLang === '/' || pathname === '/' || /^\/[a-z]{2}$/.test(pathname)
  }

  return pathWithoutLang.startsWith(path)
}

/**
 * Start navigation group with brand and main nav links
 * @param props - Component props
 * @param props.data - Navigation data from CMS
 * @param props.displayMode - Current display mode
 * @param props.direction - Text direction for RTL support
 * @param props.navWidth - Current navigation width
 * @param props.isSearchExpanded - Whether search is currently expanded
 * @param props.onHasIconsChange - Callback to report icon availability
 * @returns Start navigation group component
 */
export function StartNavigationGroup({
  data,
  displayMode,
  direction,
  navWidth,
  isSearchExpanded = false,
  onHasIconsChange,
}: StartNavigationGroupProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (!onHasIconsChange) return

    const hasIcons = Boolean(
      data.homeButton.label?.icon &&
      data.productsMenu.menuButton.label?.icon &&
      data.blogButton.label?.icon &&
      data.aboutButton.label?.icon
    )
    onHasIconsChange(hasIcons)
  }, [
    data.homeButton.label?.icon,
    data.productsMenu.menuButton.label?.icon,
    data.blogButton.label?.icon,
    data.aboutButton.label?.icon,
    onHasIconsChange,
  ])

  // Brand text is hidden when:
  // 1. displayMode is 'none' (all start items hidden)
  // 2. navWidth is below SEARCH_ONLY threshold
  // 3. displayMode is 'minimal' AND search is expanded (to prevent overlap with search input)
  const isBrandTextVisible =
    displayMode === 'full' ||
    displayMode === 'partial' ||
    (displayMode === 'minimal' &&
      ((!isSearchExpanded && navWidth >= THRESHOLDS.SEARCH_ONLY) ||
        (isSearchExpanded && navWidth >= THRESHOLDS.SEARCH_ONLY + SEARCH_EXPANDED_WIDTH)))

  /**
   * Check if a path is currently active
   * @param path - Path to check
   * @returns True if the path is active
   */
  const isActive = useCallback((path: string): boolean => checkIsActive(pathname, path), [pathname])
  const isVisible = useCallback(
    (displayMode: DisplayMode): boolean => displayMode === 'full' || displayMode === 'partial',
    []
  )

  return (
    <NavigationGroup displayMode={displayMode} position="start">
      {({ showText }) => (
        <>
          {/* Brand */}
          <ButtonLink
            data={data.brandButton}
            direction={direction}
            variant="link-1"
            iconSize="3xl"
            size="2xl"
            showText={isBrandTextVisible}
            noAnimation
            visible={displayMode !== 'none'}
            slideDirection="end-to-start"
            iconPriority
            className={`
              text-foreground! hover:text-foreground hover:no-underline! active:scale-95
              ${isBrandTextVisible ? 'me-3' : ''}
              [&]:inline-flex [&]:overflow-hidden [&]:whitespace-nowrap
              [&]:transition-all [&]:duration-300 [&]:ease-out
              [&>span]:inline-flex [&>span]:overflow-hidden [&>span]:whitespace-nowrap
              [&>span]:transition-all [&>span]:duration-300 [&>span]:ease-out
              [&>span>span]:inline-flex [&>span>span]:overflow-hidden [&>span>span]:whitespace-nowrap
              [&>span>span]:transition-all [&>span>span]:duration-300 [&>span>span]:ease-out
            `}
          />

          {/* Home */}
          <ButtonLink
            data={data.homeButton}
            direction={direction}
            variant="ghost-1"
            iconSize="md"
            size="sm"
            showText={showText}
            visible={isVisible(displayMode)}
            isActive={isActive('/')}
            slideDirection="end-to-start"
          />

          {/* Products Menu */}
          <ProductCategoriesMenu
            data={data.productsMenu}
            direction={direction}
            showText={showText}
            visible={isVisible(displayMode)}
            isActive={isActive('/products')}
            disabled={displayMode === 'minimal'}
          />

          {/* Blog */}
          <ButtonLink
            data={data.blogButton}
            direction={direction}
            variant="ghost-1"
            iconSize="md"
            size="sm"
            showText={showText}
            visible={isVisible(displayMode)}
            slideDirection="end-to-start"
            isActive={isActive('/blog')}
          />

          {/* About Us */}
          <ButtonLink
            data={data.aboutButton}
            direction={direction}
            variant="ghost-1"
            iconSize="md"
            size="sm"
            showText={showText}
            visible={isVisible(displayMode)}
            slideDirection="end-to-start"
            isActive={isActive('/about')}
          />
        </>
      )}
    </NavigationGroup>
  )
}

/**
 * Build start nav links for mobile menu
 * @param data - Navigation data from CMS
 * @param pathname - Current pathname
 * @returns Array of start nav links
 */
export function buildStartNavLinks(data: ApiNavigationNavigationDocument, pathname: string): StartNavLink[] {
  return [
    {
      id: 'home',
      href: data.homeButton.url,
      text: data.homeButton.label?.text,
      isActive: checkIsActive(pathname, '/'),
    },
    {
      id: 'products',
      href: data.productsMenu.menuButton.url,
      text: data.productsMenu.menuButton.label?.text,
      isActive: checkIsActive(pathname, '/products'),
    },
    {
      id: 'blog',
      href: data.blogButton.url,
      text: data.blogButton.label?.text,
      isActive: checkIsActive(pathname, '/blog'),
    },
    {
      id: 'about',
      href: data.aboutButton.url,
      text: data.aboutButton.label?.text,
      isActive: checkIsActive(pathname, '/about'),
    },
  ]
}

export default StartNavigationGroup
