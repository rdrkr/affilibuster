// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/elements barrel exports
 */

import * as elements from '@/components/elements'

describe('components/elements barrel exports', () => {
  it('should export CMSIcon component and helpers', () => {
    expect(elements.CMSIcon).toBeDefined()
    expect(elements.resolveIcon).toBeDefined()
  })

  it('should export CMSImage component', () => {
    expect(elements.CMSImage).toBeDefined()
  })

  it('should export CMSText component and helpers', () => {
    expect(elements.CMSText).toBeDefined()
    expect(elements.resolveTextFormatHtml).toBeDefined()
  })

  it('should export Button component', () => {
    expect(elements.Button).toBeDefined()
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
