'use client'

// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Global error boundary for the root layout.
 *
 * Catches unhandled errors that escape all nested error boundaries,
 * including errors thrown by the [lang]/layout.tsx itself (e.g., when
 * backend API is down and layout data fetching fails).
 *
 * Must provide its own <html> and <body> tags because it completely
 * replaces the root layout when triggered.
 *
 * Uses minimal UI with no CMS dependencies since this page renders
 * when the backend/CMS may be unreachable.
 */

/**
 * Props for the global error boundary component.
 */
export interface GlobalErrorProps {
  /** The error that was thrown. */
  error: Error & { digest?: string }
  /** Function to attempt re-rendering the error boundary's children. */
  reset: () => void
}

/**
 * Inner error content rendered by the global error boundary.
 *
 * Extracted as a named export so it can be tested independently
 * without JSDOM restrictions on nested html/body elements.
 * @param props - Error boundary props
 * @param props.error - The caught error object with optional digest
 * @param props.reset - Function to retry rendering the failed segment
 * @returns Error recovery UI with warning icon, optional digest, and retry button
 */
export function GlobalErrorContent({ error, reset }: GlobalErrorProps): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--color-muted-foreground, #a5b4ab)' }}>
        &#9888;
      </div>
      {error.digest && (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground, #879b8f)' }}>{error.digest}</p>
      )}
      <button
        onClick={reset}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          backgroundColor: 'var(--color-primary, #14f195)',
          color: 'var(--color-primary-foreground, #ffffff)',
          cursor: 'pointer',
        }}
      >
        &#8635;
      </button>
    </div>
  )
}

/**
 * Global error page displayed when an unhandled error occurs at the root level.
 *
 * Renders a centered error message with a retry button inside a full HTML document.
 * Does not depend on CMS data or any external service.
 * @param props - Global error boundary props
 * @param props.error - The caught error object with optional digest
 * @param props.reset - Function to retry rendering the failed segment
 * @returns Full HTML document with error recovery UI
 */
export default function GlobalError({ error, reset }: GlobalErrorProps): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <GlobalErrorContent error={error} reset={reset} />
      </body>
    </html>
  )
}
