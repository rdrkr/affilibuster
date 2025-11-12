// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'

/**
 * Textarea component props
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Textarea label
   */
  label?: string
  /**
   * Error message to display
   */
  error?: string
  /**
   * Whether the textarea is required
   */
  required?: boolean
}

/**
 * Reusable Textarea component for multi-line text input.
 * This component provides consistent styling and behavior for all textarea fields.
 *
 * @param props - Textarea component props
 * @returns Rendered textarea element
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Message"
 *   placeholder="Enter your message..."
 *   rows={4}
 *   required
 * />
 * ```
 */
export function Textarea({ label, error, required, className = '', id, ...props }: TextareaProps): React.ReactElement {
  const textareaId = id ?? `textarea-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`

  const textareaClasses = `w-full px-4 py-2 rounded-lg bg-white dark:bg-neutral-900 border ${
    error
      ? 'border-error-500 focus:ring-error-400 focus:border-error-400'
      : 'border-neutral-300 dark:border-neutral-700 focus:ring-tertiary-400 focus:border-tertiary-400'
  } text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all resize-vertical ${className}`.trim()

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <textarea id={textareaId} className={textareaClasses} {...props} />
      {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
    </div>
  )
}
