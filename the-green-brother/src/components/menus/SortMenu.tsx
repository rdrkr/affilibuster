// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Sort Menu Component
 *
 * Dropdown menu for sorting products.
 */

'use client'

import { useCallback, useState } from 'react'

import { ButtonAction, Icon, Label } from '@/components/elements'
import { DropdownMenu } from '@/components/menus'
import type { ElementsButtonEntry, ElementsLabelEntry, SortersProductsSorterEntry } from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Sort option type matching CMS productsSorter field names
 */
export type SortOption = 'bestSellers' | 'newArrivals' | 'priceHighToLow' | 'priceLowToHigh'

export interface SortMenuProps {
  /** CMS data for the sort menu */
  data: SortersProductsSorterEntry
  /** Currently selected sort option */
  sortBy: SortOption
  /** Callback when sort option changes */
  onSortChange: (option: SortOption) => void
  /** Text direction for RTL support */
  direction: DirectionEnum
  /** Whether to show the text label. Defaults to true. */
  showText?: boolean
  /** Controls visibility of entire menu - when false, menu is hidden from layout */
  visible?: boolean
  /** Optional class name for the sort menu */
  className?: string
}

/**
 * Sort selector dropdown menu
 * @param props - Component props with CMS data and callbacks
 * @param props.data - CMS data for the sort menu
 * @param props.sortBy - Currently selected sort option
 * @param props.onSortChange - Callback when sort option changes
 * @param props.direction - Text direction for RTL support
 * @param props.showText - Whether to show the text label (defaults to true)
 * @param props.visible - Controls visibility of entire menu (defaults to true)
 * @param props.className - Optional class name for the sort menu
 * @returns Sort menu component
 */
export function SortMenu({
  data,
  sortBy,
  onSortChange,
  direction,
  showText = true,
  visible = true,
  className = '',
}: SortMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isRTL = direction === DirectionEnum.RTL

  // Get current sort option label
  const currentSortLabel: ElementsLabelEntry = data[sortBy]

  // Sort options for dropdown
  const sortOptions: { key: SortOption; label: ElementsLabelEntry }[] = [
    { key: 'bestSellers', label: data.bestSellers },
    { key: 'newArrivals', label: data.newArrivals },
    { key: 'priceLowToHigh', label: data.priceLowToHigh },
    { key: 'priceHighToLow', label: data.priceHighToLow },
  ]

  const handleSortSelect = useCallback(
    (option: SortOption) => {
      onSortChange(option)
      setIsOpen(false)
    },
    [onSortChange]
  )

  return (
    <DropdownMenu
      triggerData={
        {
          label: {
            icon: data.header.header?.icon,
            ariaDescription: data.header.header?.ariaDescription,
          },
        } as ElementsButtonEntry
      }
      triggerChildren={
        <>
          <Label
            data={currentSortLabel}
            direction={direction}
            display="inline"
            hideIcon
            className={showText ? 'font-medium' : 'hidden'}
          />
          <Icon
            icon="expand_more"
            size="sm"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </>
      }
      triggerChildrenPosition="end"
      direction={direction}
      variant="ghost-1"
      size="sm"
      dropdownClassName={`flex flex-col ${className}`}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      align={isRTL ? 'end' : 'start'}
      inlineOnMobile
      triggerGapClassName="-m-6 md:m-0"
      testId="sort-menu-container"
      visible={visible}
    >
      {sortOptions.map(option => (
        <ButtonAction
          key={option.key}
          data={{ label: option.label, url: '', openInNewTab: false }}
          direction={direction}
          onClick={() => {
            handleSortSelect(option.key)
          }}
          variant="ghost-2"
          size="sm"
          isActive={sortBy === option.key}
        />
      ))}
    </DropdownMenu>
  )
}

export default SortMenu
