// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * useVerificationGate Hook
 * Hook that checks email verification status and shows verification prompt when needed
 */

import { useState } from 'react'
import { useAuth } from '@/lib/auth'

/**
 * useVerificationGate return type
 */
export interface UseVerificationGateReturn {
  /**
   * Function to check if user is verified. Returns true if verified, false otherwise.
   * Shows verification prompt for unverified users.
   */
  checkVerification: () => boolean
  /**
   * Whether the verification prompt should be shown
   */
  showPrompt: boolean
  /**
   * Function to close the verification prompt
   */
  closePrompt: () => void
  /**
   * User's email address (or empty string if not authenticated)
   */
  userEmail: string
}

/**
 * useVerificationGate Hook
 * Checks email verification status and manages verification prompt display
 *
 * @returns Hook state and functions
 *
 * @example
 * ```tsx
 * function ProtectedFeature() {
 *   const { checkVerification, showPrompt, closePrompt, userEmail } = useVerificationGate()
 *
 *   const handleAction = () => {
 *     if (!checkVerification()) {
 *       return // Prompt will be shown automatically
 *     }
 *     // Proceed with action
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={handleAction}>Protected Action</button>
 *       <VerificationRequiredPrompt isOpen={showPrompt} email={userEmail} onClose={closePrompt} />
 *     </>
 *   )
 * }
 * ```
 */
export function useVerificationGate(): UseVerificationGateReturn {
  const { user } = useAuth()
  const [showPrompt, setShowPrompt] = useState(false)

  /**
   * Check if user's email is verified
   * Returns true if verified (or no user), false if unverified
   * Shows prompt for unverified users
   */
  const checkVerification = (): boolean => {
    // If no user, allow access (auth guard should handle this separately)
    if (!user) {
      setShowPrompt(false)
      return true
    }

    // If email is verified, allow access
    if (user.emailVerified) {
      setShowPrompt(false)
      return true
    }

    // Email is not verified - show prompt and deny access
    setShowPrompt(true)
    return false
  }

  /**
   * Close the verification prompt
   */
  const closePrompt = (): void => {
    setShowPrompt(false)
  }

  return {
    checkVerification,
    showPrompt,
    closePrompt,
    userEmail: user?.email ?? '',
  }
}
