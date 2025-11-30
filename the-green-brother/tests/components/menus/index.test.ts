// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/menus barrel exports
 */

import * as menus from '@/components/menus'

describe('components/menus barrel exports', () => {
  it('should export LanguageMenu component', () => {
    expect(menus.LanguageMenu).toBeDefined()
  })

  it('should export ProductCategoriesMenu component', () => {
    expect(menus.ProductCategoriesMenu).toBeDefined()
  })

  it('should export SearchMenu component', () => {
    expect(menus.SearchMenu).toBeDefined()
  })

  it('should export ThemeMenu component', () => {
    expect(menus.ThemeMenu).toBeDefined()
  })
})
