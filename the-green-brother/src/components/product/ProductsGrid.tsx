// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { Header, Icon } from '@/components/elements'
import { ProductCard } from '@/components/product/ProductCard'
import {
  DirectionEnum,
  type ApiProductCategoriesPageProductCategoriesPageDocument,
  type ApiProductProductDocument,
} from '@/lib/generated/types.gen'

/**
 * Props for the ProductsGrid component
 */
export interface ProductsGridProps {
  /** List of products to display */
  products: ApiProductProductDocument[]
  /** Layout direction */
  direction: DirectionEnum
  /** Pagination data for empty state content */
  pagination: ApiProductCategoriesPageProductCategoriesPageDocument['pagination']
  /** Additional CSS classes */
  className?: string
  /** Feature flag: Enable user profile features (favorites) */
  enableUserProfile: boolean
}

/**
 * Renders a responsive grid of product cards or an empty state if no products are found.
 * @param props - Component properties
 * @param props.products - List of products to display
 * @param props.direction - Layout direction (LTR/RTL)
 * @param props.pagination - Pagination data containing empty state configuration
 * @param props.className - Additional CSS classes
 * @param props.enableUserProfile - Feature flag: Enable user profile features (favorites)
 * @returns Product grid or empty state UI
 */
export function ProductsGrid({
  products,
  direction,
  pagination,
  className = '',
  enableUserProfile,
}: ProductsGridProps) {
  if (products.length > 0) {
    return (
      <div
        className={`
          grid grid-cols-1 gap-6
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          ${className}
        `}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.documentId}
            product={product}
            direction={direction}
            width="full"
            preload={index < 4}
            enableUserProfile={enableUserProfile}
          />
        ))}
      </div>
    )
  }

  /* Empty State using pagination.noItemsFound */
  return (
    <div className={`py-16 text-center ${className}`}>
      {pagination.noItemsFound.header?.icon && (
        <Icon icon={pagination.noItemsFound.header.icon} size="6xl" className="mb-4 text-muted-foreground" />
      )}
      {pagination.noItemsFound.header && (
        <Header
          data={{
            ...pagination.noItemsFound,
            header: {
              text: pagination.noItemsFound.header.text,
              iconPosition: pagination.noItemsFound.header.iconPosition,
              ariaDescription: pagination.noItemsFound.header.ariaDescription,
            },
          }}
          level={2}
          direction={direction}
        />
      )}
    </div>
  )
}
