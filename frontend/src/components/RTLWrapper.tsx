// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * RTL Wrapper Component
 * Reference: T112 (RTLWrapper component)
 * Wraps content with RTL direction for Hebrew
 */

'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface RTLWrapperProps {
  children: React.ReactNode
}

export function RTLWrapper({ children }: RTLWrapperProps) {
  const pathname = usePathname()

  // Check if current path is Hebrew
  const isRTL = pathname.startsWith('/he')

  useEffect(() => {
    // Update document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = isRTL ? 'he' : 'en'
  }, [isRTL])

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'rtl' : 'ltr'}>
      {children}
    </div>
  )
}
