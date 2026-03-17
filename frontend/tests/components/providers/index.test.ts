// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/providers barrel exports
 */

import * as providers from '@/components/providers'

describe('components/providers barrel exports', () => {
  it('should export LayoutProvider and useLayoutContext', () => {
    expect(providers.LayoutProvider).toBeDefined()
    expect(providers.useLayoutContext).toBeDefined()
  })

  it('should export NavigationProvider and useNavigationContext', () => {
    expect(providers.NavigationProvider).toBeDefined()
    expect(providers.useNavigationContext).toBeDefined()
  })

  it('should export ThemeProvider and useThemeContext', () => {
    expect(providers.ThemeProvider).toBeDefined()
    expect(providers.useThemeContext).toBeDefined()
  })
})
