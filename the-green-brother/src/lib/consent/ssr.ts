// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * SSR Environment Detection Utilities
 *
 * Provides mockable functions for detecting whether code is running
 * in a browser or server-side rendering (SSR) context. Using function
 * wrappers instead of raw `typeof` checks enables unit testing of
 * SSR guard branches in jsdom environments.
 */

/**
 * Check whether the `window` global is available (browser context).
 * @returns true if running in a browser, false during SSR
 */
export function isWindowDefined(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Check whether the `document` global is available (browser context).
 * @returns true if running in a browser, false during SSR
 */
export function isDocumentDefined(): boolean {
  return typeof document !== 'undefined'
}
