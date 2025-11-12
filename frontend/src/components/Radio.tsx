// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'

/**
 * Radio component props
 */
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Radio button label
   */
  label?: string
  /**
   * Error message to display
   */
  error?: string
}

/**
 * Reusable Radio component.
 * This component provides consistent styling and behavior for all radio inputs.
 *
 * @param props - Radio component props
 * @returns Rendered radio element
 *
 * @example
 * ```tsx
 * <Radio
 *   name="plan"
 *   value="basic"
 *   label="Basic Plan"
 *   checked={selectedPlan === 'basic'}
 *   onChange={() => setSelectedPlan('basic')}
 * />
 * ```
 */
export function Radio({ label, error, className = '', id, ...props }: RadioProps): React.ReactElement {
  const radioId = id ?? `radio-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`

  const radioClasses =
    `w-5 h-5 border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-2 focus:ring-tertiary-400 cursor-pointer ${className}`.trim()

  return (
    <div className="w-full">
      <label htmlFor={radioId} className="flex items-center space-x-3 cursor-pointer">
        <input type="radio" id={radioId} className={radioClasses} {...props} />
        {label && <span className="text-neutral-700 dark:text-neutral-300">{label}</span>}
      </label>
      {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
    </div>
  )
}
