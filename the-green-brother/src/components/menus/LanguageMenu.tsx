// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Language Menu Component
 *
 * Dropdown menu for selecting language/locale.
 * Button labels and ARIA descriptions come from CMS via MenusLanguageSelectorEntry.
 * Available languages are fetched from the i18n locales API.
 */

'use client'

import Link from 'next/link'

import type { CodeEnum, MenusLanguageSelectorEntry } from '@/lib/generated/types.gen'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

import { ButtonAction, CMSIcon, CMSText } from '../elements'
import { DropdownMenu } from './DropdownMenu'

/**
 * Language option for the selector
 */
export interface LanguageOption {
  /** Language name to display */
  name: string
  /** Flag emoji or icon */
  flag: string
  /** Language code (e.g., CodeEnum.EN, CodeEnum.IT, CodeEnum.HE) */
  code: CodeEnum
}

/**
 * Props for the LanguageMenu component
 */
export interface LanguageMenuProps {
  /** CMS data for the language menu */
  data: MenusLanguageSelectorEntry
  /** Available language options */
  languages: LanguageOption[]
  /** Currently selected language code */
  selectedLang: CodeEnum
  /** Callback when language is selected */
  onLanguageChange: (langCode: CodeEnum) => void
  /** Text direction for RTL support */
  direction: DirectionEnum
}

/**
 * Language selector dropdown menu
 * @param props - Component props with CMS data and callbacks
 * @param props.data - CMS data for the language menu
 * @param props.languages - Available language options
 * @param props.selectedLang - Currently selected language code
 * @param props.onLanguageChange - Callback when language is selected
 * @param props.direction - Text direction for RTL support
 * @returns Language menu component
 */
export function LanguageMenu({ data, languages, selectedLang, onLanguageChange, direction }: LanguageMenuProps) {
  const isRTL = direction === DirectionEnum.RTL
  const isIconAfterText = data.menuButton.label?.iconPosition === IconPositionEnum.AFTER_TEXT
  const label = data.menuButton.label

  // Icon with badge overlay component
  const iconWithBadge = label?.icon ? (
    <span className={`relative ${isIconAfterText ? 'order-last' : 'order-first'}`}>
      <CMSIcon icon={label.icon} size="md" />
      {/* Badge positioned at bottom-right of icon */}
      <span
        className={`
          pointer-events-none absolute -right-1 bottom-1 flex min-w-[14px]
          items-center justify-center rounded-sm bg-primary px-0.5 text-[10px]
          leading-none font-bold text-black transition-colors
          group-hover:bg-text-secondary-dark
        `}
      >
        {languages.find(lang => lang.code === selectedLang)?.name.substring(0, 2)}
      </span>
    </span>
  ) : null

  return (
    <div className="group relative flex h-full items-center">
      {/* Menu button with chevron */}
      <div
        className={`
          flex items-center
          ${isRTL ? 'flex-row-reverse' : ''}
        `}
      >
        {/* Custom button with icon+badge */}
        <Link
          href={data.menuButton.url}
          className={`
            inline-flex items-center gap-2 text-sm font-medium
            text-text-secondary-dark transition-colors
            group-hover:text-primary
            ${isRTL ? 'flex-row-reverse' : ''}
          `}
          aria-label={label?.ariaDescription}
        >
          {iconWithBadge}
          {/* Text */}
          <CMSText text={label?.text} />
        </Link>
        {/* Chevron - always on opposite side of icon */}
        <span
          className={`
            material-symbols-outlined pointer-events-none text-sm
            text-text-secondary-dark transition-transform
            duration-300 group-hover:rotate-180 group-hover:text-primary
            ${isIconAfterText ? 'order-first' : 'order-last'}
            ${isIconAfterText ? 'me-1' : 'ms-1'}
          `}
        >
          expand_more
        </span>
      </div>

      <DropdownMenu width="12rem" align="right" direction={direction} contentClassName="space-y-1 p-1.5">
        {languages.map(lang => (
          <ButtonAction
            key={lang.name}
            direction={direction}
            onClick={() => {
              onLanguageChange(lang.code)
            }}
            variant="ghost"
            className={`
              flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5
              text-sm text-white transition-colors
              hover:bg-white/10
              ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}
              ${selectedLang === lang.code ? `bg-white/5` : ''}
            `}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </ButtonAction>
        ))}
      </DropdownMenu>
    </div>
  )
}

export default LanguageMenu
