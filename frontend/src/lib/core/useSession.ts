// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Session management hook
 * Generates and persists session ID for user preferences
 */

'use client'

import { useState } from 'react'

const SESSION_KEY = 'affilibuster_session_id'

/**
 * Session management hook
 * Generates and persists session ID for user preferences.
 * Session ID is automatically included in API requests via the @/lib/api module.
 */
export function useSession() {
  // Use lazy initialization to get or create session ID
  const [sessionId] = useState<string>(() => {
    // Only access localStorage on the client
    /* istanbul ignore next */
    if (typeof window === 'undefined') {
      // Return a temporary ID during SSR (will be replaced on client)
      return 'ssr-temp-id'
    }

    // Try to get existing session ID from localStorage
    let existingSessionId = localStorage.getItem(SESSION_KEY)

    if (!existingSessionId) {
      // Generate new session ID (UUID v4)
      existingSessionId = crypto.randomUUID()
      localStorage.setItem(SESSION_KEY, existingSessionId)
    }

    return existingSessionId
  })

  return sessionId
}
