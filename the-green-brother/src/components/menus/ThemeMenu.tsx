// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Theme Menu Component
 *
 * Dropdown menu for selecting theme (system/light/dark).
 * Theme options and labels come from CMS via MenusThemeSelectorEntry.
 */

'use client'

import type { ApiThemeThemeDocument, MenusThemeSelectorEntry } from '@/lib/generated/types.gen'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

import { ButtonAction, ButtonLink, CMSIcon, CMSText } from '../elements'
import { DropdownMenu } from './DropdownMenu'

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
  /** Text direction for RTL support */
  direction: DirectionEnum
}

/**
 * Theme selector dropdown menu
 * @param props - Component props with CMS data and callbacks
 * @param props.data - CMS data for the theme menu
 * @param props.selectedTheme - Currently selected theme name
 * @param props.onThemeChange - Callback when theme is selected
 * @param props.direction - Text direction for RTL support
 * @returns Theme menu component
 */
export function ThemeMenu({ data, selectedTheme, onThemeChange, direction }: ThemeMenuProps) {
  const themes = data.themes ?? []
  const isRTL = direction === DirectionEnum.RTL
  const isIconAfterText = data.menuButton.label?.iconPosition === IconPositionEnum.AFTER_TEXT

  return (
    <div className="group relative flex h-full items-center">
      {/* Menu button with chevron */}
      <div
        className={`
          hidden items-center gap-1 lg:flex
          ${isRTL ? 'flex-row-reverse' : ''}
        `}
      >
        <ButtonLink
          data={data.menuButton}
          direction={direction}
          variant="ghost"
          iconSize="md"
          size="sm"
          className={`
            bg-transparent! px-0! text-text-secondary-dark!
            transition-colors group-hover:text-primary!
            hover:bg-transparent!
          `}
        />
        {/* Chevron - always on opposite side of icon */}
        <span
          className={`
            material-symbols-outlined pointer-events-none text-sm
            text-text-secondary-dark transition-transform
            duration-300 group-hover:rotate-180 group-hover:text-primary
            ${isIconAfterText ? 'order-first' : 'order-last'}
          `}
        >
          expand_more
        </span>
      </div>

      <DropdownMenu width="10rem" align="right" direction={direction} contentClassName="space-y-1 p-1.5">
        {themes.map((theme: ApiThemeThemeDocument) => {
          if (!theme.content) {
            return null
          }

          return (
            <ButtonAction
              key={theme.content.text}
              direction={direction}
              onClick={() => {
                if (theme.content) {
                  onThemeChange(theme.content.text)
                }
              }}
              variant="ghost"
              className={`
                flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5
                text-sm text-white transition-colors
                hover:bg-white/10
                ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}
                ${selectedTheme === theme.content.text ? `bg-white/5` : ''}
              `}
              data={{ label: theme.content, url: '', openInNewTab: false }}
            >
              <CMSIcon icon={theme.content.icon ?? 'palette'} size="md" />
              <span className="font-medium">
                <CMSText text={theme.content.text} />
              </span>
            </ButtonAction>
          )
        })}
      </DropdownMenu>
    </div>
  )
}

export default ThemeMenu
