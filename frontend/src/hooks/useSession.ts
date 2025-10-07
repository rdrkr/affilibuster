// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Session management hook
 * Generates and persists session ID for user preferences
 */

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

const SESSION_KEY = 'affilibuster_session_id';

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Try to get existing session ID from localStorage
    let existingSessionId = localStorage.getItem(SESSION_KEY);

    if (!existingSessionId) {
      // Generate new session ID (UUID v4)
      existingSessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, existingSessionId);
    }

    setSessionId(existingSessionId);
    apiClient.setSessionId(existingSessionId);
  }, []);

  return sessionId;
}
