// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Theme Menu Component
 *
 * Dropdown menu for selecting theme (system/light/dark).
 * Theme options and labels come from CMS via MenusThemeSelectorEntry.
 */

'use client'

import type { ApiThemeThemeDocument, MenusThemeSelectorEntry } from '@/lib/generated/types.gen'

import { CMSIcon, CMSText } from '../elements'

/**
 * Props for the ThemeMenu component
 */
export interface ThemeMenuProps {
  /** CMS data for the theme menu */
  data: MenusThemeSelectorEntry
  /** Currently selected theme name */
  selectedTheme: string
  /** Callback when theme is selected */
  onThemeChange: (themeName: string) => void
}

/**
 * Theme selector dropdown menu
 * @param props - Component props with CMS data and callbacks
 * @param props.data - CMS data for the theme menu
 * @param props.selectedTheme - Currently selected theme name
 * @param props.onThemeChange - Callback when theme is selected
 * @returns Theme menu component
 */
export function ThemeMenu({ data, selectedTheme, onThemeChange }: ThemeMenuProps) {
  const themes = data.themes ?? []

  return (
    <div className="group relative flex h-full items-center">
      <button
        className={`
          hidden items-center gap-1.5 rounded-full p-2 transition-colors
          group-hover:bg-surface-dark group-hover:text-white
          lg:flex
        `}
        aria-label={data.menuButton.label?.ariaDescription}
      >
        <CMSIcon icon={data.menuButton.label?.icon} size="lg" />
        <span
          className={`
          hidden
          lg:inline
        `}
        >
          <CMSText text={data.menuButton.label?.text} />
        </span>
        <span
          className={`
          material-symbols-outlined text-sm transition-transform duration-300
          group-hover:rotate-180
        `}
        >
          expand_more
        </span>
      </button>

      <div
        className={`
          invisible absolute top-full right-0 z-50 w-40 pt-6 opacity-0
          transition-all duration-300
          group-hover:visible group-hover:opacity-100
        `}
      >
        <div
          className={`
          overflow-hidden rounded-xl border border-white/10 bg-surface-dark
          p-1.5 shadow-xl
        `}
        >
          {themes.map((theme: ApiThemeThemeDocument) => {
            if (!theme.content) {
              return null
            }

            return (
              <button
                key={theme.content.text}
                onClick={() => {
                  if (theme.content) {
                    onThemeChange(theme.content.text)
                  }
                }}
                className={`
                  flex w-full items-center gap-3 rounded-xl px-4 py-2.5
                  text-left text-sm text-white transition-colors
                  hover:bg-white/10
                  ${selectedTheme === theme.content.text ? `bg-white/5` : ''}
                `}
                aria-label={theme.content.ariaDescription}
              >
                <CMSIcon icon={theme.content.icon ?? 'palette'} size="md" />
                <span className="font-medium">
                  <CMSText text={theme.content.text} />
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ThemeMenu
