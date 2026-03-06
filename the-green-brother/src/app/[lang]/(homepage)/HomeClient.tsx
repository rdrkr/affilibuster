// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Homepage Client Component
 *
 * Renders the homepage using CMS data through composable section components.
 * Handles client-side animations while all content comes from CMS.
 */

'use client'

import { type ReactNode } from 'react'

import { PageClient } from '@/components/layout'

/**
 * Props for the HomeClient component
 */
export interface HomeClientProps {
  /** content to render inside the animated wrapper */
  children: ReactNode
  /** Additional CSS classes passed to PageClient (e.g. to adjust spacing when hero is extracted) */
  className?: string
}

/**
 * Homepage client wrapper that handles enter animations.
 * @param props - Component props
 * @param props.children - Content to render (HomeSections from server)
 * @param props.className - Additional CSS classes for PageClient (e.g. spacing override)
 * @returns Animated wrapper div
 */
export default function HomeClient({ children, className }: HomeClientProps) {
  return <PageClient className={className}>{children}</PageClient>
}
