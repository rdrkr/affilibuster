// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Navigation Components Module
 *
 * Exports navigation-related components.
 * Menu components have been moved to @/components/menus.
 */

export { default as BackToTopButton } from './BackToTopButton'
export { MobileMenu, type MobileMenuProps, type MobileNavLink } from './MobileMenu'
export { Navigation, type NavigationProps } from './Navigation'

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
