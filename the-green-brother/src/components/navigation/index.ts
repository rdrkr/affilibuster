// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Navigation Components Module
 *
 * Exports navigation-related components.
 * Menu components have been moved to @/components/menus.
 */

export { default as BackToTopButton } from './BackToTopButton'
export { EndNavigationGroup, type EndNavigationGroupProps } from './EndNavigationGroup'
export { MobileNavigationGroup, type MobileNavLink, type MobileNavigationGroupProps } from './MobileNavigationGroup'
export { Navigation, type NavigationProps } from './Navigation'
export {
  NavigationGroup,
  type DisplayMode,
  type NavigationGroupContext,
  type NavigationGroupProps,
} from './NavigationGroup'
export { StartNavigationGroup, type StartNavigationGroupProps } from './StartNavigationGroup'

// Re-export menu components from menus directory for backwards compatibility
export {
  LanguageMenu,
  ProductCategoriesMenu,
  SearchMenu,
  ThemeMenu,
  type LanguageMenuProps,
  type LanguageOption,
  type ProductCategoriesMenuProps,
  type SearchMenuProps,
  type ThemeMenuProps,
} from '@/components/menus'

// Default export for convenient importing
export { Navigation as default } from './Navigation'
