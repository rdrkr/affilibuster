// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * RTL Wrapper Component
 * Reference: T112 (RTLWrapper component)
 * Wraps content with RTL direction for Hebrew
 */

'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Direction, LanguageCode, DEFAULT_LANGUAGE_CODE } from '@/lib/types'

interface RTLWrapperProps {
  children: React.ReactNode
}

export function RTLWrapper({ children }: RTLWrapperProps) {
  const pathname = usePathname()

  // Check if current path is Hebrew
  const isRTL = pathname.startsWith('/he')
  const direction: Direction = isRTL ? Direction.RTL : Direction.LTR
  const lang: LanguageCode = isRTL ? LanguageCode.HE : DEFAULT_LANGUAGE_CODE

  useEffect(() => {
    // Update document direction
    document.documentElement.dir = direction
    document.documentElement.lang = lang
  }, [direction, lang])

  return (
    <div dir={direction} className={direction}>
      {children}
    </div>
  )
}
