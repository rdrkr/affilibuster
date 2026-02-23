// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Disable Preview Route Handler
 *
 * Disables Next.js draft mode, allowing editors to exit content preview
 * and return to viewing published content.
 */

import { draftMode } from 'next/headers'

/**
 * Handle GET requests to disable draft mode.
 *
 * Clears the draft mode cookie so subsequent page loads fetch published content.
 * @returns Response confirming draft mode has been disabled
 */
export async function GET(): Promise<Response> {
  const draft = await draftMode()
  draft.disable()

  return new Response('Draft mode disabled')
}
