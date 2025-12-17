// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Featured Products Section Component
 *
 * Renders a horizontal scrollable carousel of featured products.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header and ButtonLink composites for section title and actions.
 */

import { ButtonLink, Card, CMSIcon, CMSText, Header } from '@/components/elements'
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
    <section aria-label={header.header?.ariaDescription ?? ''}>
      <div className={`mb-8 flex items-end justify-between px-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Header data={header} level={2} direction={direction} />
        <div>
          <ButtonLink
            data={viewAllButton}
            direction={direction}
            variant="link"
            iconSize="sm"
            className="font-semibold text-primary hover:text-primary-hover"
          />
        </div>
      </div>

      <div
        className={`
          scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto
        `}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
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
                      flex h-10 w-10 items-center justify-center rounded-full
                      bg-background-dark/50 text-white backdrop-blur-md
                      transition-colors
                      hover:bg-primary hover:text-black
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
                      text-xs font-bold tracking-wider text-primary uppercase
                    `}
                  >
                    <CMSText text={tagText} />
                  </span>
                )}
                <span
                  className={`
                    rounded-md bg-white/10 px-2 py-1 text-sm font-bold
                    text-white
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
                    line-clamp-2 text-lg font-bold text-white
                    transition-colors
                    group-hover:text-primary
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
      </div>
    </section>
  )
}

export default FeaturedProductsSection
