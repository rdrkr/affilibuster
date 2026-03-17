// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * ProductCard Placeholder
 *
 * GentleHawk does not use product detail features. This placeholder satisfies
 * the import from `@affilibuster/frontend`/components/sections/FeaturedProductsSection.
 */

import type { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Props for the ProductCard component.
 */
export interface ProductCardProps {
  /** Product data */
  product: unknown
  /** Language direction */
  direction: DirectionEnum
  /** Additional props */
  [key: string]: unknown
}

/**
 * Placeholder ProductCard — renders nothing in GentleHawk.
 * @param _props - Product card props (unused)
 * @returns null
 */
export function ProductCard(_props: ProductCardProps): React.ReactElement | null {
  return null
}
