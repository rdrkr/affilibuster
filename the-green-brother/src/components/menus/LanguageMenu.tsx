// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Language Menu Component
 *
 * Dropdown menu for selecting language/locale.
 * Button labels and ARIA descriptions come from CMS via MenusLanguageSelectorEntry.
 * Available languages are fetched from the i18n locales API.
 */

'use client'

import { useCallback, useState } from 'react'

import type { CodeEnum, MenusLanguageSelectorEntry } from '@/lib/generated/types.gen'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

import { ButtonAction, Icon } from '../elements'
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
  /** Whether to show the text label (for responsive collapse). Defaults to true. */
  showText: boolean
  /** Controls visibility of entire menu - when false, menu is hidden from layout */
  visible?: boolean
}

/**
 * Language selector dropdown menu
 * @param props - Component props with CMS data and callbacks
 * @param props.data - CMS data for the language menu
 * @param props.languages - Available language options
 * @param props.selectedLang - Currently selected language code
 * @param props.onLanguageChange - Callback when language is selected
 * @param props.direction - Text direction for RTL support
 * @param props.showText - Whether to show the text label (defaults to true)
 * @param props.visible - Controls visibility of entire menu (defaults to true)
 * @returns Language menu component
 */
export function LanguageMenu({
  data,
  languages,
  selectedLang,
  onLanguageChange,
  direction,
  showText,
  visible = true,
}: LanguageMenuProps) {
  const isIconAfterText = data.menuButton.label?.iconPosition === IconPositionEnum.AFTER_TEXT
  const label = data.menuButton.label
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = useCallback(
    (langCode: CodeEnum) => {
      onLanguageChange(langCode)
      setIsOpen(false)
    },
    [onLanguageChange]
  )

  // Icon with badge overlay component
  const iconWithBadge = label?.icon ? (
    <span className="relative">
      <Icon icon={label.icon} size="md" className={`mr-1.5`} />
      {/* Badge positioned at bottom-right of icon */}
      <span
        className={`
          pointer-events-none absolute right-0.5 bottom-0.5 flex min-w-[14px]
          items-center justify-center rounded-sm bg-primary p-0.5 text-[9px] leading-none
          font-bold text-black transition-colors group-hover:bg-text-secondary-dark
          group-active:bg-text-main-dark
        `}
      >
        {languages.find(lang => lang.code === selectedLang)?.name.substring(0, 2)}
      </span>
    </span>
  ) : null

  // Remove icon from label and use customized icon instead.
  const buttonData = { ...data.menuButton }
  if (buttonData.label) {
    const { icon: _icon, ...rest } = buttonData.label
    buttonData.label = rest
  }

  // Determine children position based on icon position from CMS
  const childrenPosition = isIconAfterText ? 'end' : 'start'

  return (
    <DropdownMenu
      triggerData={buttonData}
      triggerChildren={iconWithBadge}
      triggerChildrenPosition={childrenPosition}
      direction={direction}
      showText={showText}
      visible={visible}
      testId="language-menu-container"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      {languages.map(lang => (
        <ButtonAction
          key={lang.name}
          data={{
            label: {
              iconPosition: IconPositionEnum.BEFORE_TEXT,
              text: `${lang.flag}\u00A0\u00A0${lang.name}`,
              ariaDescription: lang.name,
            },
            url: '',
            openInNewTab: false,
          }}
          showText={true}
          direction={DirectionEnum.LTR}
          onClick={() => {
            handleLanguageSelect(lang.code)
          }}
          variant="ghost-2"
          iconSize="sm"
          size="sm"
          isActive={selectedLang === lang.code}
        >
          {/* force justify as if button has icon */}
          {'\u00A0'}
        </ButtonAction>
      ))}
    </DropdownMenu>
  )
}

export default LanguageMenu
