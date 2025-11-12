// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Category Filter Component
 * Dropdown filter for selecting product categories
 */

'use client'

import { Dropdown, type DropdownItem } from './Dropdown'

export interface Category {
  /**
   * Category ID or slug
   */
  id: string
  /**
   * Display name
   */
  name: string
}

export interface CategoryFilterProps {
  /**
   * Available categories
   */
  categories: Category[]
  /**
   * Currently selected category ID (null for all)
   */
  selectedCategory: string | null
  /**
   * Callback when category changes
   */
  onCategoryChange: (categoryId: string | null) => void
  /**
   * Label for "all categories" option
   */
  allCategoriesLabel?: string
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Category filter dropdown for filtering product lists.
 *
 * @param props - CategoryFilter component props
 * @returns Rendered category filter dropdown
 */
export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  allCategoriesLabel = 'All Categories',
  className = '',
}: CategoryFilterProps) {
  const items: DropdownItem[] = [
    { value: '', label: allCategoriesLabel },
    ...categories.map(cat => ({
      value: cat.id,
      label: cat.name,
    })),
  ]

  const handleChange = (value: string) => {
    onCategoryChange(value === '' ? null : value)
  }

  return (
    <div className={className}>
      <Dropdown
        value={selectedCategory ?? ''}
        items={items}
        onChange={handleChange}
        ariaLabel="Filter by category"
        data-testid="category-filter"
        itemTestIdPrefix="category"
      />
    </div>
  )
}
