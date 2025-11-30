// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Language Menu Component
 *
 * Dropdown menu for selecting language/locale.
 * Button labels and ARIA descriptions come from CMS via MenusLanguageSelectorEntry.
 * Available languages are fetched from the i18n locales API.
 */

'use client'

import type { CodeEnum, MenusLanguageSelectorEntry } from '@/lib/generated/types.gen'

import { CMSIcon, CMSText } from '../elements'

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
}

/**
 * Language selector dropdown menu
 * @param props - Component props with CMS data and callbacks
 * @param props.data - CMS data for the language menu
 * @param props.languages - Available language options
 * @param props.selectedLang - Currently selected language code
 * @param props.onLanguageChange - Callback when language is selected
 * @returns Language menu component
 */
export function LanguageMenu({ data, languages, selectedLang, onLanguageChange }: LanguageMenuProps) {
  return (
    <div className="group relative flex h-full items-center">
      <button
        className={`
          relative flex items-center gap-2 rounded-full px-3 py-2
          transition-colors
          group-hover:bg-surface-dark group-hover:text-white
        `}
        aria-label={data.menuButton.label?.ariaDescription}
      >
        <div className="relative">
          <CMSIcon icon={data.menuButton.label?.icon} size="lg" />
          <span
            className={`
              absolute -right-1 -bottom-1 flex min-w-[14px] items-center
              justify-center rounded-sm bg-primary px-0.5 text-xs leading-none
              font-bold text-black
            `}
          >
            {selectedLang}
          </span>
        </div>
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
          invisible absolute top-full right-0 z-50 w-48 pt-6 opacity-0
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
          {languages.map(lang => (
            <button
              key={lang.name}
              onClick={() => {
                onLanguageChange(lang.code)
              }}
              className={`
                flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left
                text-sm text-white transition-colors
                hover:bg-white/10
                ${selectedLang === lang.code ? `bg-white/5` : ''}
              `}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LanguageMenu
