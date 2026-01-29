// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Featured Products Section Component
 *
 * Renders a horizontal scrollable carousel of featured products.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header and ButtonLink composites for section title and actions.
 */

import { ButtonLink, Header } from '@/components/elements'
import { Carousel } from '@/components/layout'
import { ProductCard } from '@/components/product/ProductCard'
import { DirectionEnum, type SectionsFeaturedProductsEntry } from '@/lib/generated/types.gen'

/**
 * Props for the FeaturedProductsSection component
 */
export interface FeaturedProductsSectionProps {
  /** Featured products section data from CMS */
  data: SectionsFeaturedProductsEntry & {
    __component: 'sections.featured-products'
  }
  /** Language direction for RTL support */
  direction: DirectionEnum
  /** Feature flag: Enable user profile features (login/signup, favorites) */
  enableUserProfile: boolean
}

/**
 * Featured products section with horizontal scrollable carousel.
 * @param props - Component props with CMS section data and products
 * @param props.data - Featured products section data from CMS
 * @param props.direction - Language direction for RTL support
 * @param props.enableUserProfile - Feature flag: Enable user profile features (favorites)
 * @returns Featured products section component or null if no products
 */
export function FeaturedProductsSection({ data, direction, enableUserProfile }: FeaturedProductsSectionProps) {
  const { header, products, viewAllButton } = data
  const isRTL = direction === DirectionEnum.RTL

  // Don't render if no products
  if (products.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col" dir={isRTL ? 'rtl' : 'ltr'} aria-label={header.header?.ariaDescription ?? ''}>
      <Header data={header} level={3} direction={direction} />
      <ButtonLink
        data={viewAllButton}
        direction={direction}
        variant="link-1"
        iconSize="sm"
        className={`mt-4 self-end`}
      />

      {/* Horizontal scroll carousel */}
      <Carousel direction={direction} gap="sm" className="mt-2">
        {products.map((product, index) => (
          <ProductCard
            key={product.documentId}
            product={product}
            direction={direction}
            enableUserProfile={enableUserProfile}
            noAnimation={false}
            preload={index < 4}
          />
        ))}
      </Carousel>
    </section>
  )
}
