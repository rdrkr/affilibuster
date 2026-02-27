'use client'

// Copyright (c) 2026 Affilibuster by Ronen Druker.

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
      <div className="mb-4 text-6xl text-neutral-300 dark:text-neutral-600">&#9888;</div>
      <p className="text-sm text-neutral-500">{error.digest}</p>
      <button
        onClick={reset}
        className="mt-8 inline-block rounded-lg bg-primary-600 px-6 py-3 text-white transition-colors hover:bg-primary-700"
      >
        &#8635;
      </button>
    </div>
  )
}
