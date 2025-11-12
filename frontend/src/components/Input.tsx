// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'

/**
 * Input component props
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input label
   */
  label?: string
  /**
   * Error message to display
   */
  error?: string
  /**
   * Whether the input is required
   */
  required?: boolean
}

/**
 * Reusable Input component for text, email, password, etc.
 * This component provides consistent styling and behavior for all input fields.
 *
 * @param props - Input component props
 * @returns Rendered input element
 *
 * @example
 * ```tsx
 * <Input
 *   type="email"
 *   label="Email Address"
 *   placeholder="you@example.com"
 *   required
 * />
 * ```
 */
export function Input({ label, error, required, className = '', id, ...props }: InputProps): React.ReactElement {
  const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`

  const inputClasses = `w-full px-4 py-2 rounded-lg bg-white dark:bg-neutral-900 border ${
    error
      ? 'border-error-500 focus:ring-error-400 focus:border-error-400'
      : 'border-neutral-300 dark:border-neutral-700 focus:ring-tertiary-400 focus:border-tertiary-400'
  } text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${className}`.trim()

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <input id={inputId} className={inputClasses} {...props} />
      {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
    </div>
  )
}
