// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Featured Products Section Component
 *
 * Renders a horizontal scrollable carousel of featured products.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header and Button composites for section title and actions.
 */

'use client'

import { Button, CMSIcon, CMSImage, CMSText, Header } from '@/components/elements'
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
        <Header
          data={header}
          level={3}
          headerClassName="text-3xl text-white"
          subheaderClassName="text-text-secondary-dark"
          direction={direction}
        />
        <Button
          data={viewAllButton}
          direction={direction}
          variant="link"
          iconSize="sm"
          className="font-semibold text-primary hover:text-primary-hover"
        />
      </div>

      <div
        className={`
          scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto
        `}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {products.map(product => {
          const primaryImage = product.images[0]

          return (
            <div
              key={product.documentId}
              className={`
                group h-card w-carousel-mobile shrink-0 snap-start
                md:w-carousel-desktop
              `}
            >
              <div
                className={`
                  isolate flex h-full flex-col overflow-hidden rounded-xl
                  border border-white/5 bg-surface-dark shadow-lg
                  transition-all duration-300
                  hover:-translate-y-1 hover:transform hover:border-primary/30
                `}
              >
                <div className="relative h-64 overflow-hidden bg-tertiary-800">
                  <CMSImage
                    image={primaryImage}
                    fallbackAlt={product.content?.header?.header?.text ?? ''}
                    className={`
                      h-full w-full object-cover transition-transform
                      duration-500
                      group-hover:scale-110
                    `}
                    fill
                    sizes="320px"
                  />
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
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {/* Tag and Price row */}
                  <div className="mb-2 flex items-center justify-between">
                    {product.tags?.at(0)?.tag?.text && (
                      <span
                        className={`
                          text-xs font-bold tracking-wider text-primary uppercase
                        `}
                      >
                        <CMSText text={product.tags.at(0)?.tag?.text} />
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
                  <Button
                    data={{
                      label: product.viewDetailsLabel,
                      url: `/products/${product.slug}`,
                      openInNewTab: false,
                    }}
                    variant="ghost"
                    className={`
                      mt-auto w-full rounded-xl bg-white/5 py-3
                      text-center font-semibold text-white
                      hover:bg-primary hover:text-background-dark
                    `}
                    direction={direction}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default FeaturedProductsSection
