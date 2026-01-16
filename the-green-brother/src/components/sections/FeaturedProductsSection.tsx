// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Featured Products Section Component
 *
 * Renders a horizontal scrollable carousel of featured products.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header and ButtonLink composites for section title and actions.
 */

import { ButtonLink, Card, Carousel, CMSIcon, CMSText, Header } from '@/components/elements'
import {
  DirectionEnum,
  type ApiProductProductDocument,
  type SectionsFeaturedProductsEntry,
} from '@/lib/generated/types.gen'

/**
 * Props for the FeaturedProductsSection component
 */
export interface FeaturedProductsSectionProps {
  /** Featured products section data from CMS */
  data: SectionsFeaturedProductsEntry & {
    __component: 'sections.featured-products'
  }
  /** Products to display (fetched separately from CMS) */
  products: ApiProductProductDocument[]
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Featured products section with horizontal scrollable carousel.
 * @param props - Component props with CMS section data and products
 * @param props.data - Featured products section data from CMS
 * @param props.products - Products to display
 * @param props.direction - Language direction for RTL support
 * @returns Featured products section component or null if no products
 */
export function FeaturedProductsSection({ data, products, direction }: FeaturedProductsSectionProps) {
  const { header, viewAllButton } = data
  const isRTL = direction === DirectionEnum.RTL

  // Don't render if no products
  if (products.length === 0) {
    return null
  }

  return (
    <section className="mb-8 flex flex-col" aria-label={header.header?.ariaDescription ?? ''}>
      <Header data={header} level={2} direction={direction} />
      <ButtonLink
        data={viewAllButton}
        direction={direction}
        variant="link-1"
        iconSize="sm"
        className={`mt-4 ${isRTL ? 'self-start' : 'self-end'}`}
      />

      {/* Horizontal scroll carousel */}
      <Carousel direction={direction} gap="sm" className="mt-2">
        {products.map(product => {
          const primaryImage = product.images[0]
          const tagText = product.tags?.at(0)?.tag?.text ?? ''

          return (
            <Card
              key={product.documentId}
              href={`/products/${product.slug}`}
              image={primaryImage}
              imageAlt={product.content?.header?.header?.text ?? ''}
              variant="product"
              asLink={false}
              imageOverlay={
                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    className={`
                      flex size-10 items-center justify-center rounded-full
                      bg-white/50 text-neutral-800 backdrop-blur-md
                      transition-colors hover:bg-primary hover:text-black
                      dark:bg-background-dark/50 dark:text-white
                    `}
                    aria-label={product.content?.header?.header?.ariaDescription ?? ''}
                  >
                    <CMSIcon icon="favorite_border" size="lg" />
                  </button>
                </div>
              }
            >
              {/* Tag and Price row */}
              <div className="mb-2 flex items-center justify-between">
                {tagText && (
                  <span
                    className={`
                      text-xs font-bold tracking-wider text-primary uppercase text-shadow-sm dark:text-shadow-none
                    `}
                  >
                    <CMSText text={tagText} />
                  </span>
                )}
                <span
                  className={`
                    rounded-md bg-neutral-100 px-2 py-1 text-sm font-bold
                    text-neutral-800 dark:bg-white/10 dark:text-white
                  `}
                >
                  {product.currency?.symbol ?? '$'}
                  {product.price.toFixed(2)}
                </span>
              </div>
              {/* Product name */}
              {product.content?.header?.header && (
                <h4
                  className={`
                    line-clamp-2 text-lg font-bold text-neutral-800
                    transition-colors
                    group-hover:text-primary group-hover:text-shadow-sm
                    dark:text-white dark:group-hover:text-shadow-none
                  `}
                >
                  <CMSText text={product.content.header.header.text} />
                </h4>
              )}
              <ButtonLink
                data={{
                  label: product.viewDetailsLabel,
                  url: `/products/${product.slug}`,
                  openInNewTab: false,
                }}
                variant="secondary"
                className="mt-auto w-full py-3 text-center"
                direction={direction}
              />
            </Card>
          )
        })}
      </Carousel>
    </section>
  )
}

export default FeaturedProductsSection
