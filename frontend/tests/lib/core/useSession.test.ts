// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for useSession hook
 */

import { useSession } from '@/lib/core/useSession'
import { renderHook, waitFor } from '@testing-library/react'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      const { [key]: excluded, ...remaining } = store
      void excluded // Mark as intentionally excluded
      store = remaining
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock crypto.randomUUID
const mockRandomUUID = jest.fn(() => 'test-uuid-1234')
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockRandomUUID,
  },
})

describe('useSession', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('should generate new session ID when none exists', async () => {
    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current).toBe('test-uuid-1234')
    })
  })

  it('should store session ID in localStorage', async () => {
    renderHook(() => useSession())

    await waitFor(() => {
      expect(localStorageMock.getItem('affilibuster_session_id')).toBe('test-uuid-1234')
    })
  })

  it('should reuse existing session ID from localStorage', async () => {
    localStorageMock.setItem('affilibuster_session_id', 'existing-session-456')

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current).toBe('existing-session-456')
    })

    // Should not generate new UUID

    expect(mockRandomUUID).not.toHaveBeenCalled()
  })

  it('should generate different UUIDs on multiple renders', async () => {
    mockRandomUUID.mockReturnValueOnce('uuid-1').mockReturnValueOnce('uuid-2')

    localStorageMock.clear()

    const { result: result1 } = renderHook(() => useSession())
    await waitFor(() => {
      expect(result1.current).toBe('uuid-1')
    })

    localStorageMock.clear()

    const { result: result2 } = renderHook(() => useSession())
    await waitFor(() => {
      expect(result2.current).toBe('uuid-2')
    })
  })
})
