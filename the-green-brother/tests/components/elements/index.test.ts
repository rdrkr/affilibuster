// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/elements barrel exports
 */

import * as elements from '@/components/elements'

describe('components/elements barrel exports', () => {
  it('should export Icon component', () => {
    expect(elements.Icon).toBeDefined()
  })

  it('should export Image component', () => {
    expect(elements.Image).toBeDefined()
  })

  it('should export Text component and helpers', () => {
    expect(elements.Text).toBeDefined()
    expect(elements.resolveTextFormatHtml).toBeDefined()
  })

  it('should export ButtonAction component', () => {
    expect(elements.ButtonAction).toBeDefined()
  })

  it('should export ButtonLink component', () => {
    expect(elements.ButtonLink).toBeDefined()
  })

  it('should export Header component', () => {
    expect(elements.Header).toBeDefined()
  })

  it('should export Label component', () => {
    expect(elements.Label).toBeDefined()
  })

  it('should export TextBlock component', () => {
    expect(elements.TextBlock).toBeDefined()
  })
})
