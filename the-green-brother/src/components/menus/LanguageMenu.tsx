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

import type { LanguageCode, MenusLanguageSelectorEntry } from '@/lib/generated/types.gen'
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
  /** Language code (e.g., LanguageCode.EN, LanguageCode.IT, LanguageCode.HE) */
  code: LanguageCode
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
  selectedLang: LanguageCode
  /** Callback when language is selected */
  onLanguageChange: (langCode: LanguageCode) => void
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
  const isRTL = direction === DirectionEnum.RTL
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = useCallback(
    (langCode: LanguageCode) => {
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
          font-bold text-foreground-light transition-colors group-hover:bg-muted-foreground
          group-hover:text-foreground-reversed group-active:bg-foreground
        `}
      >
        {languages.find(lang => lang.code === selectedLang)?.name.substring(0, 2)}
      </span>
    </span>
  ) : null

  // Remove icon from label and use customized icon instead.
  // Also fix aria-label to include visible text (WCAG label-content-name-mismatch)
  const buttonData = { ...data.menuButton }
  if (buttonData.label) {
    const { icon: _icon, ...rest } = buttonData.label
    const visibleText = rest.text
    const cmsAriaDescription = rest.ariaDescription
    buttonData.label = {
      ...rest,
      ariaDescription:
        visibleText && cmsAriaDescription && !cmsAriaDescription.includes(visibleText)
          ? `${visibleText} - ${cmsAriaDescription}`
          : cmsAriaDescription,
    }
  }

  // Determine children position based on icon position from CMS
  const childrenPosition = isRTL ? (isIconAfterText ? 'start' : 'end') : isIconAfterText ? 'end' : 'start'

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
      dropdownClassName="items-center! sm:items-start!"
    >
      {/* Always LTR regardless of page direction */}
      <div className="flex w-full flex-col gap-1" dir="ltr">
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
            direction={DirectionEnum.LTR} // Always LTR regardless of page direction
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
      </div>
    </DropdownMenu>
  )
}

export default LanguageMenu
