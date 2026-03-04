'use client'

// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { Icon } from '@/components/elements'

/**
 * Error boundary client component for the locale layout.
 *
 * Catches runtime errors in child components and renders a recovery UI.
 * Provides a "Try Again" button that calls `reset()` to re-render the segment.
 * Uses minimal UI since CMS data may be unavailable during errors.
 */

/**
 * Props for the error boundary component.
 */
interface ErrorPageProps {
  /** The error that was thrown. */
  error: Error & { digest?: string }
  /** Function to attempt re-rendering the error boundary's children. */
  reset: () => void
}

/**
 * Error boundary page displayed when a runtime error occurs.
 * Renders a centered error message with a retry button.
 * @param props - Error boundary props with error details and reset function
 * @param props.error - The caught error object
 * @param props.reset - Function to retry rendering
 * @returns Error recovery UI with retry button
 */
export default function ErrorPage({ error, reset }: ErrorPageProps): React.ReactElement {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <Icon icon="warning" size="6xl" className="mb-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{error.digest}</p>
      <button
        onClick={reset}
        className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-foreground transition-colors hover:bg-primary-hover"
      >
        &#8635;
      </button>
    </div>
  )
}
