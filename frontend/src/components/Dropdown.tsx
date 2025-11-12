// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import React, { useState } from 'react'

/**
 * Dropdown item interface
 */
export interface DropdownItem<T = string> {
  /**
   * Unique identifier for the item
   */
  value: T
  /**
   * Display label for the item
   */
  label: string
  /**
   * Optional icon element
   */
  icon?: React.ReactNode
  /**
   * Optional description or secondary text
   */
  description?: string
  /**
   * Whether the item is disabled
   */
  disabled?: boolean
}

/**
 * Dropdown component props
 */
export interface DropdownProps<T = string> {
  /**
   * Label for the dropdown
   */
  label?: string
  /**
   * Currently selected value
   */
  value: T
  /**
   * Array of items to display
   */
  items: DropdownItem<T>[]
  /**
   * Change handler
   */
  onChange: (value: T) => void
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string
  /**
   * Whether the dropdown is disabled
   */
  disabled?: boolean
  /**
   * Aria label for accessibility
   */
  ariaLabel?: string
  /**
   * Additional CSS classes for the container
   */
  className?: string
  /**
   * Additional CSS classes for the trigger button
   */
  buttonClassName?: string
  /**
   * Error message to display
   */
  error?: string
  /**
   * Custom render function for the trigger button content
   */
  renderTrigger?: (selectedItem: DropdownItem<T> | undefined) => React.ReactNode
  /**
   * Custom render function for each item
   */
  renderItem?: (item: DropdownItem<T>, isSelected: boolean) => React.ReactNode
}

/**
 * Reusable Dropdown component with customizable appearance and behavior.
 * This component provides a consistent dropdown pattern with backdrop, animations, and keyboard support.
 *
 * @param props - Dropdown component props
 * @returns Rendered dropdown element
 *
 * @example
 * ```tsx
 * <Dropdown
 *   label="Select Country"
 *   value={selectedCountry}
 *   items={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' },
 *   ]}
 *   onChange={setSelectedCountry}
 * />
 * ```
 */
export function Dropdown<T = string>({
  label,
  value,
  items,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  ariaLabel,
  className = '',
  buttonClassName = '',
  error,
  renderTrigger,
  renderItem,
}: DropdownProps<T>): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)

  const selectedItem = items.find(item => item.value === value)

  const handleSelect = (itemValue: T): void => {
    onChange(itemValue)
    setIsOpen(false)
  }

  const defaultTriggerContent = selectedItem ? (
    <div className="flex items-center space-x-2">
      {selectedItem.icon && <span>{selectedItem.icon}</span>}
      <span>{selectedItem.label}</span>
    </div>
  ) : (
    <span className="text-neutral-400">{placeholder}</span>
  )

  const defaultItemContent = (item: DropdownItem<T>, isSelected: boolean): React.ReactNode => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {item.icon && <span>{item.icon}</span>}
        <div>
          <div>{item.label}</div>
          {item.description && <div className="text-xs text-neutral-500 dark:text-neutral-400">{item.description}</div>}
        </div>
      </div>
      {isSelected && (
        <svg className="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  )

  return (
    <div className={`relative w-full ${className}`.trim()}>
      {label && (
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">{label}</label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        disabled={disabled}
        className={
          buttonClassName ||
          `flex items-center justify-between w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-tertiary-400 ${
            error
              ? 'border-2 border-error-500'
              : 'bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer'} text-neutral-800 dark:text-neutral-100`
        }
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex-1 text-left">{renderTrigger ? renderTrigger(selectedItem) : defaultTriggerContent}</div>
        {!renderTrigger && (
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {error && <p className="mt-1 text-sm text-error-500">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false)
            }}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            className="absolute right-0 mt-2 min-w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto"
            role="listbox"
          >
            {items.map(item => {
              const isSelected = item.value === value
              return (
                <button
                  key={String(item.value)}
                  type="button"
                  onClick={() => {
                    handleSelect(item.value)
                  }}
                  disabled={item.disabled}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors whitespace-nowrap ${
                    item.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-primary-50 dark:hover:bg-primary-900 cursor-pointer'
                  } ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-900 font-medium text-primary-700 dark:text-primary-300'
                      : 'text-neutral-700 dark:text-neutral-200'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  {renderItem ? renderItem(item, isSelected) : defaultItemContent(item, isSelected)}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
