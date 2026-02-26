// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Theme Menu Component
 *
 * Dropdown menu for selecting theme (system/light/dark).
 * Theme options and labels come from CMS via MenusThemeSelectorEntry.
 */

'use client'

import { useCallback, useState } from 'react'

import type { ApiThemeThemeDocument, MenusThemeSelectorEntry } from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'
import type { ThemeMode } from '@/lib/themes'

import { ButtonAction } from '../elements'
import { DropdownMenu } from './DropdownMenu'

/**
 * Maps CMS theme text labels to internal ThemeMode values
 * @param cmsText - Theme text from CMS (e.g., "System", "Light", "Dark")
 * @returns The corresponding ThemeMode value
 */
function cmsTextToThemeMode(cmsText: string): ThemeMode {
  const normalized = cmsText.toLowerCase().trim()
  if (normalized === 'light') return 'light'
  if (normalized === 'dark') return 'dark'
  return 'system'
}

/**
 * Props for the ThemeMenu component
 */
export interface ThemeMenuProps {
  /** CMS data for the theme menu */
  data: MenusThemeSelectorEntry
  /** Currently selected theme mode */
  selectedTheme: ThemeMode
  /** Callback when theme is selected */
  onThemeChange: (theme: ThemeMode) => void
  /** Text direction for RTL support */
  direction: DirectionEnum
  /** Whether to show the text label (for responsive collapse). Defaults to true. */
  showText?: boolean
  /** Controls visibility of entire menu - when false, menu is hidden from layout */
  visible?: boolean
}

/**
 * Theme selector dropdown menu
 * @param props - Component props with CMS data and callbacks
 * @param props.data - CMS data for the theme menu
 * @param props.selectedTheme - Currently selected theme mode
 * @param props.onThemeChange - Callback when theme is selected
 * @param props.direction - Text direction for RTL support
 * @param props.showText - Whether to show the text label (defaults to true)
 * @param props.visible - Controls visibility of entire menu (defaults to true)
 * @returns Theme menu component
 */
export function ThemeMenu({
  data,
  selectedTheme,
  onThemeChange,
  direction,
  showText = true,
  visible = true,
}: ThemeMenuProps) {
  const themes = data.themes
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeSelect = useCallback(
    (themeMode: ThemeMode) => {
      onThemeChange(themeMode)
      setIsOpen(false)
    },
    [onThemeChange]
  )

  return (
    <DropdownMenu
      triggerData={data.menuButton}
      direction={direction}
      showText={showText}
      visible={visible}
      testId="theme-menu-container"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      {/* Theme items have their own direction, independent of the menu direction */}
      <div dir="ltr">
        {themes.map((theme: ApiThemeThemeDocument) => {
          const themeMode = cmsTextToThemeMode(theme.themeId)

          return (
            <ButtonAction
              key={theme.content.text}
              data={{ label: theme.content, url: '', openInNewTab: false }}
              showText={true}
              direction={direction}
              onClick={() => {
                handleThemeSelect(themeMode)
              }}
              variant="ghost-2"
              iconSize="sm"
              size="sm"
              isActive={selectedTheme === themeMode}
            />
          )
        })}
      </div>
    </DropdownMenu>
  )
}
