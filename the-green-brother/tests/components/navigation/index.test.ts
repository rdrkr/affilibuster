// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/navigation barrel exports
 */

import * as navigation from '@/components/navigation'

describe('components/navigation barrel exports', () => {
  it('should export MobileNavigationGroup component', () => {
    expect(navigation.MobileNavigationGroup).toBeDefined()
  })

  it('should export StartNavigationGroup component', () => {
    expect(navigation.StartNavigationGroup).toBeDefined()
  })

  it('should export EndNavigationGroup component', () => {
    expect(navigation.EndNavigationGroup).toBeDefined()
  })

  it('should export NavigationGroup component', () => {
    expect(navigation.NavigationGroup).toBeDefined()
  })

  it('should export BackToTopButton component', () => {
    expect(navigation.BackToTopButton).toBeDefined()
  })

  it('should export Navigation component', () => {
    expect(navigation.Navigation).toBeDefined()
    expect(navigation.default).toBeDefined()
  })

  it('should export menu components', () => {
    expect(navigation.LanguageMenu).toBeDefined()
    expect(navigation.ProductCategoriesMenu).toBeDefined()
    expect(navigation.SearchMenu).toBeDefined()
    expect(navigation.ThemeMenu).toBeDefined()
  })
})
