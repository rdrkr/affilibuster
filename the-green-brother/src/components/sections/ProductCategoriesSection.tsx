// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Product Categories Section Component
 *
 * Renders a grid of product categories with icons.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header composite for section title and Label for category items.
 */

import { ShortcutsGrid } from '@/components/elements'
import {
  DirectionEnum,
  type ApiProductCategoryProductCategoryDocument,
  type SectionsCategoryGridEntry,
} from '@/lib/generated/types.gen'

/**
 * Props for the ProductCategoriesSection component
 */
export interface ProductCategoriesSectionProps {
  /** Category grid section data from CMS */
  data: SectionsCategoryGridEntry & {
    __component: 'sections.category-grid'
  }
  /** Product categories to display (fetched separately from CMS) */
  categories: ApiProductCategoryProductCategoryDocument[]
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Product categories section with icons and links.
 * @param props - Component props with CMS section data and categories
 * @param props.data - Categories section data from CMS
 * @param props.categories - Product categories to display
 * @param props.direction - Language direction for RTL support
 * @returns Product categories section component or null if no categories
 */
export function ProductCategoriesSection({ data, categories, direction }: ProductCategoriesSectionProps) {
  const { header } = data

  // Don't render if no categories
  if (categories.length === 0) {
    return null
  }

  const items = categories.map(category => ({
    id: typeof category.id === 'number' ? category.id : -1,
    url: `/products?category=${category.slug}`,
    openInNewTab: false,
    label: category.content,
  }))

  return (
    <ShortcutsGrid
      headerLevel={2}
      header={header}
      items={items}
      direction={direction}
      noAnimation={false}
      buttonSize="lg"
    />
  )
}
