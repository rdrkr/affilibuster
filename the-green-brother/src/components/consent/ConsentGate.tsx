// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * ConsentGate component.
 *
 * Conditionally renders children based on whether the user has accepted
 * a specific consent category. Used to gate tracking scripts (analytics,
 * marketing) behind explicit user consent for GDPR compliance.
 */

import type { ReactNode } from 'react'

import { useConsent } from '@/lib/consent'

/**
 * Props for the ConsentGate component.
 */
interface ConsentGateProps {
  /** The consent category required to render children (e.g., 'analytics', 'marketing'). */
  category: string
  /** Content to render when consent is granted for the specified category. */
  children: ReactNode
}

/**
 * Gates children behind a consent category check.
 *
 * Reads the user's accepted consent categories via the `useConsent` hook
 * and only renders children if the specified category has been accepted.
 * Returns `null` otherwise.
 * @param props - The component props
 * @param props.category - The consent category required to render children
 * @param props.children - Content to render when consent is granted
 * @returns The children if consent is granted, `null` otherwise
 * @example
 * ```tsx
 * <ConsentGate category="analytics">
 *   <AnalyticsScript />
 * </ConsentGate>
 * ```
 */
export default function ConsentGate({ category, children }: ConsentGateProps): ReactNode {
  const { acceptedCategories } = useConsent()

  if (!acceptedCategories.includes(category)) {
    return null
  }

  return children
}
