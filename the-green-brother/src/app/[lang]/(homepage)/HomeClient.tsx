// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Homepage Client Component
 *
 * Renders the homepage using CMS data through composable section components.
 * Handles client-side animations while all content comes from CMS.
 */

'use client'

import { type ReactNode, useEffect, useState } from 'react'

/**
 * Props for the HomeClient component
 */
export interface HomeClientProps {
  /** content to render inside the animated wrapper */
  children: ReactNode
}

/**
 * Homepage client wrapper that handles enter animations.
 * @param props - Component props
 * @param props.children - Content to render (HomeSections from server)
 * @returns Animated wrapper div
 */
export default function HomeClient({ children }: HomeClientProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Use requestAnimationFrame to avoid cascading renders
    const frame = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      className={`
        space-y-16 py-8 transition-opacity duration-1000
        md:space-y-24
        ${isVisible ? `opacity-100` : `opacity-0`}
      `}
    >
      {children}
    </div>
  )
}
