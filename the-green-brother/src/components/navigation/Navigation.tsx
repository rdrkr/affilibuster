// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Navigation Component
 *
 * Main navigation bar consuming all content from CMS.
 * Composes StartNavigationGroup and EndNavigationGroup with proper separation of concerns.
 * Uses useNavigationResize for responsive collapse behavior.
 */

'use client'

import { useCallback } from 'react'

import type { ApiNavigationNavigationDocument } from '@/lib/generated/types.gen'
import { DirectionEnum, type Language } from '@/lib/generated/types.gen'
import { useNavigationResize } from '@/lib/navigation'

import { useThemeContext } from '@/components/providers'
import { EndNavigationGroup } from './EndNavigationGroup'
import { StartNavigationGroup } from './StartNavigationGroup'

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
  /** Feature flag: Enable product search */
  enableProductSearch?: boolean
  /** Feature flag: Enable user profile (login/signup) */
  enableUserProfile?: boolean
}

/**
 * Main navigation bar component
 * @param props - Component props with CMS navigation data
 * @param props.data - Navigation data from CMS
 * @param props.languages - Languages from API
 * @param props.direction - Text direction for RTL support
 * @param props.enableProductSearch - Feature flag: Enable product search
 * @param props.enableUserProfile - Feature flag: Enable user profile (login/signup)
 * @returns Navigation component
 */
export function Navigation({
  data,
  languages,
  direction,
  enableProductSearch = false,
  enableUserProfile = false,
}: NavigationProps) {
  const { theme, setTheme } = useThemeContext()

  // Get responsive visibility state
  const { navRef, visibility, isSearchExpanded, setSearchExpanded, setStartHasIcons, setEndHasIcons, isReady } =
    useNavigationResize()

  /**
   * Handle search expansion state change
   */
  const handleSearchExpandChange = useCallback(
    (expanded: boolean): void => {
      setSearchExpanded(expanded)
    },
    [setSearchExpanded]
  )

  return (
    <div
      className={`
      sticky top-4 z-50 p-4
      sm:px-6
      lg:px-8
    `}
    >
      <nav ref={navRef} className={`relative p-2`} aria-label="Main navigation">
        {/* Background layer with blur effect */}
        <div
          className={`
            absolute inset-0 rounded-full border
            border-neutral-200 bg-white/50 shadow-lg backdrop-blur-sm
            dark:border-white/10 dark:bg-surface-dark/70
          `}
          aria-hidden="true"
        />

        <div
          className={`relative z-20 grid h-12 grid-cols-1 items-center transition-opacity duration-200 ${
            isReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {isReady && (
            <>
              {/* Start Group - Brand and Nav Links - Aligned Start */}
              <StartNavigationGroup
                data={data}
                displayMode={visibility.startGroupMode}
                direction={direction}
                navWidth={visibility.navWidth}
                isSearchExpanded={isSearchExpanded}
                onHasIconsChange={setStartHasIcons}
              />

              {/* End Group - Search, Theme, Language, Login - Aligned End */}
              <EndNavigationGroup
                data={data}
                displayMode={visibility.endGroupMode}
                startGroupMode={visibility.startGroupMode}
                direction={direction}
                navWidth={visibility.navWidth}
                apiLanguages={languages}
                theme={theme}
                setTheme={setTheme}
                onSearchExpandChange={handleSearchExpandChange}
                onHasIconsChange={setEndHasIcons}
                enableProductSearch={enableProductSearch}
                enableUserProfile={enableUserProfile}
              />
            </>
          )}
        </div>
      </nav>
    </div>
  )
}

export default Navigation
