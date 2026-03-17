// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Navigation Components Module
 *
 * Exports navigation-related components.
 * Menu components have been moved to @/components/menus.
 */

export { default as BackToTopButton } from '@/components/navigation/BackToTopButton'
export { EndNavigationGroup, type EndNavigationGroupProps } from '@/components/navigation/EndNavigationGroup'
export { MobileNavigationGroup, type MobileNavLink, type MobileNavigationGroupProps } from '@/components/navigation/MobileNavigationGroup'
export { Navigation, type NavigationProps } from '@/components/navigation/Navigation'
export {
  NavigationGroup,
  type DisplayMode,
  type NavigationGroupContext,
  type NavigationGroupProps,
} from '@/components/navigation/NavigationGroup'
export { StartNavigationGroup, type StartNavigationGroupProps } from '@/components/navigation/StartNavigationGroup'

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
export { Navigation as default } from '@/components/navigation/Navigation'
