// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * DynamicTextBlock Component
 *
 * Lazy-loaded wrapper around TextBlock that defers loading of the heavy
 * react-markdown/rehype/remark pipeline until actually needed.
 * Use this in components rendered on every page (e.g. Footer) to avoid
 * bundling ~93 KiB of unused markdown JS on pages that don't need it.
 */

'use client'

import dynamic from 'next/dynamic'
import type { TextBlockProps } from '@/components/elements/TextBlock'

/**
 * Dynamically imported TextBlock that lazy-loads the markdown rendering pipeline.
 * Accepts the same props as TextBlock.
 */
export const DynamicTextBlock: React.ComponentType<TextBlockProps> = dynamic(() =>
  import('./TextBlock').then(m => ({ default: m.TextBlock }))
)
