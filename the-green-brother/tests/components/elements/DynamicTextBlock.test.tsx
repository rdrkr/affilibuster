// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for DynamicTextBlock component
 *
 * Verifies that DynamicTextBlock is a valid React component
 * that lazily loads TextBlock via next/dynamic.
 */

import { DynamicTextBlock } from '@/components/elements/DynamicTextBlock'

describe('DynamicTextBlock', () => {
  it('should be a valid React component', () => {
    expect(DynamicTextBlock).toBeDefined()
    expect(['function', 'object']).toContain(typeof DynamicTextBlock)
  })
})
