// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'

/**
 * Checkbox component props
 */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Checkbox label
   */
  label?: string
  /**
   * Error message to display
   */
  error?: string
}

/**
 * Reusable Checkbox component.
 * This component provides consistent styling and behavior for all checkbox inputs.
 *
 * @param props - Checkbox component props
 * @returns Rendered checkbox element
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="Accept terms and conditions"
 *   checked={accepted}
 *   onChange={(e) => setAccepted(e.target.checked)}
 * />
 * ```
 */
export function Checkbox({ label, error, className = '', id, ...props }: CheckboxProps): React.ReactElement {
  const checkboxId = id ?? `checkbox-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`

  const checkboxClasses =
    `w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-2 focus:ring-tertiary-400 cursor-pointer ${className}`.trim()

  return (
    <div className="w-full">
      <label htmlFor={checkboxId} className="flex items-center space-x-3 cursor-pointer">
        <input type="checkbox" id={checkboxId} className={checkboxClasses} {...props} />
        {label && <span className="text-neutral-700 dark:text-neutral-300">{label}</span>}
      </label>
      {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
    </div>
  )
}
