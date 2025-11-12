// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * JsonLd Component
 *
 * Renders JSON-LD structured data for SEO.
 * Uses useEffect to inject script into document head to avoid React's script tag restrictions.
 */

'use client'

import { useEffect } from 'react'

interface JsonLdProps {
  /**
   * The JSON-LD structured data object
   */
  data: Record<string, unknown>
  /**
   * Optional ID for the script element
   */
  id?: string
}

/**
 * Component that renders JSON-LD structured data for Schema.org markup.
 *
 * @param props - Component props
 * @returns null (injects script into head via side effect)
 */
export function JsonLd({ data, id }: JsonLdProps): null {
  useEffect(() => {
    const scriptId = id ?? 'json-ld-script'

    // Remove existing script if present
    const existing = document.getElementById(scriptId)
    if (existing) {
      existing.remove()
    }

    // Create new script element
    const script = document.createElement('script')
    script.id = scriptId
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)

    // Append to head
    document.head.appendChild(script)

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(scriptId)
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [data, id])

  return null
}
