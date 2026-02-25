// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * End Navigation Group Component
 *
 * Navigation group for the end (right/left in RTL) of the navigation bar.
 * Owns: search, theme, language, and login.
 * Handles its own collapsed items based on collapsedItems prop.
 */

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react'

import type { ApiNavigationNavigationDocument } from '@/lib/generated/types.gen'
import { LanguageCode, DirectionEnum, type Language } from '@/lib/generated/types.gen'
import { THRESHOLDS } from '@/lib/navigation'
import { ThemeMode } from '@/lib/themes'

import { LanguageMenu, SearchMenu, ThemeMenu, type LanguageOption } from '@/components/menus'
import { ButtonLink } from '../elements'
import { MobileNavigationGroup, type MobileNavLink } from './MobileNavigationGroup'
import { NavigationGroup, type DisplayMode } from './NavigationGroup'
import { buildStartNavLinks } from './StartNavigationGroup'
/**
 * Extracts the current language code from a pathname
 * @param pathname - The current URL pathname
 * @returns The language code
 */
function getLanguageFromPathname(pathname: string): LanguageCode {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  if (firstSegment?.length === 2) {
    return firstSegment as LanguageCode
  }
  return LanguageCode.EN
}

/**
 * Creates a new pathname with the language segment replaced
 * @param pathname - The current URL pathname
 * @param newLang - The new language code to use
 * @returns The pathname with the language segment replaced
 */
function replaceLanguageInPathname(pathname: string, newLang: LanguageCode): string {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  if (firstSegment?.length === 2) {
    segments[0] = newLang
    return '/' + segments.join('/')
  }
  return `/${newLang}`
}
export interface EndNavigationGroupProps {
  /** Navigation data from CMS */
  data: ApiNavigationNavigationDocument
  /** Current display mode for end group */
  displayMode: DisplayMode
  /** Current display mode for start group (used to show mobile menu) */
  startGroupMode: DisplayMode
  /** Text direction for RTL support */
  direction: DirectionEnum
  /** Current navigation width */
  navWidth: number
  /** Available languages from API (optional) */
  apiLanguages?: Language[] | undefined
  /** Current theme */
  theme: ThemeMode
  /** Theme change handler */
  setTheme: (theme: ThemeMode) => void
  /** Handler for search expand state changes */
  onSearchExpandChange: (expanded: boolean) => void
  /** Callback to report if all group items have icons */
  onHasIconsChange?: (hasIcons: boolean) => void
  /** Feature flag: Enable product search */
  enableProductSearch?: boolean
  /** Feature flag: Enable user profile (login/signup) */
  enableUserProfile: boolean
}

// Block 3: Component Body (start)
/**
 * End navigation group with search, theme, language, login, and mobile menu
 * @param props - Component props
 * @param props.data - Navigation data from CMS
 * @param props.displayMode - Current display mode for end group
 * @param props.startGroupMode - Current display mode for start group
 * @param props.direction - Text direction for RTL support
 * @param props.navWidth - Current navigation width
 * @param props.apiLanguages - Available languages from API
 * @param props.theme - Current theme
 * @param props.setTheme - Theme change handler
 * @param props.onSearchExpandChange - Handler for search expand state changes
 * @param props.onHasIconsChange - Callback to report icon availability
 * @param props.enableProductSearch - Feature flag: Enable product search
 * @param props.enableUserProfile - Feature flag: Enable user profile (login/signup)
 * @returns End navigation group component
 */
export function EndNavigationGroup({
  data,
  displayMode,
  startGroupMode,
  direction,
  navWidth,
  apiLanguages,
  theme,
  setTheme,
  onSearchExpandChange,
  onHasIconsChange,
  enableProductSearch = false,
  enableUserProfile,
}: EndNavigationGroupProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  // Check if all main items have icons (for partial mode validity)
  useEffect(() => {
    if (!onHasIconsChange) return

    const hasIcons = Boolean(
      data.searchMenu.menuButton.label?.icon &&
      data.themeMenu.menuButton.label?.icon &&
      data.languageMenu.menuButton.label?.icon &&
      data.loginButton.label?.icon
    )
    // Mobile menu button is separate, but crucial. Without it we can't do minimal.
    // But this check is for "Partial" mode mostly.

    onHasIconsChange(hasIcons)
  }, [
    data.searchMenu.menuButton.label?.icon,
    data.themeMenu.menuButton.label?.icon,
    data.languageMenu.menuButton.label?.icon,
    data.loginButton.label?.icon,
    onHasIconsChange,
  ])

  // Get current language from URL pathname
  const currentLang = getLanguageFromPathname(pathname)

  // Map API languages to LanguageOption format - memoized to prevent dependency changes
  const languages: LanguageOption[] = useMemo(
    () =>
      apiLanguages
        ? apiLanguages.map(lang => ({
            name: lang.displayName,
            flag: lang.flag,
            code: lang.code,
          }))
        : [],
    [apiLanguages]
  )

  /**
   * Handles language change by navigating to the new locale path
   */
  const handleLanguageChange = useCallback(
    (langCode: LanguageCode): void => {
      if (langCode !== currentLang) {
        const newPath = replaceLanguageInPathname(pathname, langCode)
        router.push(newPath)
      }
    },
    [currentLang, pathname, router]
  )

  /**
   * Handles search expand change, updating local state and notifying parent
   */
  const handleSearchExpandChange = useCallback(
    (expanded: boolean) => {
      setIsSearchExpanded(expanded)
      onSearchExpandChange(expanded)
    },
    [onSearchExpandChange]
  )

  // Handle mobile menu toggle
  // Accepts a boolean to force state (hover) or an event object (click) which is ignored
  const handleMenuToggle = useCallback((forcedState?: boolean | SyntheticEvent) => {
    // Check if the argument is strictly a boolean
    setIsMenuOpen(prev => (typeof forcedState === 'boolean' ? forcedState : !prev))
  }, [])

  // Build mobile nav links - always include all start items when in minimal mode
  const mobileNavLinks: MobileNavLink[] = useMemo(() => {
    const startLinks = buildStartNavLinks(data, pathname)
    // Only show links if start group is in minimal mode
    if (startGroupMode === 'minimal') {
      return startLinks
    }
    return []
  }, [data, pathname, startGroupMode])

  // Show mobile menu button only when start group is in minimal mode
  const showMobileMenu = startGroupMode === 'minimal'

  // State to track effective visibility and previous prop value
  // Using derived state pattern to avoid useEffect state updates
  // State to track effective visibility and previous prop value for Mobile Menu
  // Using derived state pattern to avoid useEffect state updates
  const [mobileMenuState, setMobileMenuState] = useState({
    effectiveShow: showMobileMenu,
    prevShow: showMobileMenu,
    prevExpanded: isSearchExpanded,
  })

  // Update mobile menu state if props change
  if (showMobileMenu !== mobileMenuState.prevShow || isSearchExpanded !== mobileMenuState.prevExpanded) {
    let newEffective = showMobileMenu
    const wasHidden = !mobileMenuState.prevShow
    const nowVisible = showMobileMenu

    if (nowVisible) {
      if (wasHidden && isSearchExpanded) {
        // Case 1: Just became visible prop-wise, but search is expanded -> SUPPRESS
        newEffective = false
      } else if (!mobileMenuState.effectiveShow) {
        // Case 2: Was already visible prop-wise but suppressed (effective=false).
        // If search is still expanded, keep suppressed. If search collapsed, show it.
        // BUT only if we are actually in a minimal width state natively.
        // If we represent a larger screen that was only minimal because of search,
        // we should STAY suppressed until the parent updates the mode to 'full'.
        newEffective = !isSearchExpanded && navWidth < THRESHOLDS.START_MINIMAL
      } else {
        // Case 3: Was visible and not suppressed. Keep it that way.
        newEffective = true
      }
    }

    setMobileMenuState({
      effectiveShow: newEffective,
      prevShow: showMobileMenu,
      prevExpanded: isSearchExpanded,
    })
  }

  const effectiveShowMobileMenu = mobileMenuState.effectiveShow

  // Login Text Visibility Logic
  // Base visibility based on modes
  const shouldShowLoginText =
    startGroupMode === 'full' ||
    ((startGroupMode === 'partial' || startGroupMode === 'minimal') && displayMode === 'full')

  // State for login text stability (don't hide just because search expanded)
  const [loginTextState, setLoginTextState] = useState({
    effectiveShow: shouldShowLoginText,
    prevShow: shouldShowLoginText,
    // We don't strictly need prevExpanded here as we update both states in sync, but for consistency:
    prevExpanded: isSearchExpanded,
  })

  // Update login text state if props change
  // Note: We check against loginTextState.prevExpanded separately, though it updates in sync with mobileMenuState
  if (shouldShowLoginText !== loginTextState.prevShow || isSearchExpanded !== loginTextState.prevExpanded) {
    let newEffective = shouldShowLoginText
    const wasVisible = loginTextState.prevShow
    const nowHidden = !shouldShowLoginText

    if (nowHidden) {
      if (wasVisible && isSearchExpanded) {
        // Case 1: Just became hidden prop-wise, but search is expanded -> FORCE KEEP VISIBLE
        newEffective = true
      } else if (loginTextState.effectiveShow) {
        // Case 2: Was already hidden prop-wise but forced visible (effective=true).
        // If search is still expanded, keep forced. If search collapsed, allow hide (un-force).
        newEffective = isSearchExpanded
      } else {
        // Case 3: Was hidden and not forced. Keep it that way.
        newEffective = false
      }
    } else {
      // Prop says show -> Show it.
      newEffective = true
    }

    setLoginTextState({
      effectiveShow: newEffective,
      prevShow: shouldShowLoginText,
      prevExpanded: isSearchExpanded,
    })
  }

  const effectiveShowLoginButtonText = loginTextState.effectiveShow
  const groupVisible = displayMode !== 'none'

  return (
    <NavigationGroup displayMode={displayMode} position="end">
      {({ showText }) => (
        <>
          {/* Search */}
          {enableProductSearch && (
            <SearchMenu
              data={data.searchMenu}
              onExpandChange={handleSearchExpandChange}
              direction={direction}
              showText={showText}
              navWidth={navWidth}
            />
          )}

          {/* Theme Selector */}
          <ThemeMenu
            data={data.themeMenu}
            selectedTheme={theme}
            onThemeChange={setTheme}
            direction={direction}
            showText={showText}
            visible={groupVisible}
          />

          {/* Language Selector */}
          <LanguageMenu
            data={data.languageMenu}
            languages={languages}
            selectedLang={currentLang}
            onLanguageChange={handleLanguageChange}
            direction={direction}
            showText={showText}
            visible={groupVisible}
          />

          {/* Login Button */}
          {enableUserProfile && (
            <ButtonLink
              data={data.loginButton}
              direction={direction}
              variant="primary"
              iconSize="lg"
              size="sm"
              showText={effectiveShowLoginButtonText}
              visible={groupVisible}
              slideDirection="start-to-end"
            />
          )}

          {/* Mobile Menu Toggle */}
          <MobileNavigationGroup
            data={data.mobileMenuButton}
            isOpen={isMenuOpen}
            onToggle={handleMenuToggle}
            navLinks={mobileNavLinks}
            visible={effectiveShowMobileMenu && groupVisible}
            direction={direction}
          />
        </>
      )}
    </NavigationGroup>
  )
}

export default EndNavigationGroup
