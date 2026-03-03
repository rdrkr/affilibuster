// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { ButtonLink, Icon, Text } from '@/components/elements'
import { Card, type CardLayout, type CardSize, type CardSizeModifier } from '@/components/elements/Card'
import { DirectionEnum, type ApiProductProductDocument } from '@/lib/generated/types.gen'

/**
 * Props for the ProductCard component
 */
export interface ProductCardProps {
  /** Product data from CMS */
  product: ApiProductProductDocument
  /** Language direction for RTL support */
  direction: DirectionEnum
  /** Card size (default: 'md') */
  size?: CardSize
  /** Feature flag: Enable user profile features (favorites) */
  enableUserProfile: boolean
  /** Additional CSS classes */
  className?: string
  /** Whether the card acts as a link (defaults to false for products as they have CTA) */
  asLink?: boolean
  /** Card layout */
  layout?: CardLayout
  /** Card width */
  width?: CardSizeModifier
  /** Card height */
  height?: CardSizeModifier
  /** No card hover animation */
  noAnimation?: boolean
  /** Whether to preload image (for LCP optimization) */
  preload?: boolean
}

/**
 * Product Card Component
 *
 * A specialized card for displaying products.
 * Encapsulates product-specific rendering logic (price, tags, favorite button).
 * @param props - Component props
 * @param props.product - Product document from CMS
 * @param props.direction - Layout direction (ltr/rtl)
 * @param props.size - Card size variant
 * @param props.enableUserProfile - Whether to show favorites button
 * @param props.className - Additional CSS classes
 * @param props.asLink - Whether card should be wrapped in anchor
 * @param props.layout - Card layout
 * @param props.width - Card width
 * @param props.height - Card height
 * @param props.noAnimation - No card hover animation
 * @param props.preload - Whether to preload image (for LCP optimization)
 * @returns ProductCard component
 */
export function ProductCard({
  product,
  direction,
  size = 'md',
  enableUserProfile,
  className = '',
  asLink = false,
  layout = 'ttb',
  width = 'fixed',
  height = 'fixed',
  noAnimation = true,
  preload = false,
}: ProductCardProps) {
  // Data extraction
  const primaryImage = product.images[0]
  const tagText = (product.tags ?? []).at(0)?.tag.text ?? ''
  const imageSizes = '320px'
  const productUrl = `/products/${product.slug}`

  // Price formatting - get first price from prices array
  const primaryPrice = product.prices[0]
  const priceDisplay = primaryPrice ? `${primaryPrice.currency.symbol}${primaryPrice.amount.toFixed(2)}` : ''

  // Determine effective layout logic
  // 'sm' size traditionally used side-by-side (ltr) if not specified, matching BlogCard logic
  // But here we respect passed layout or default 'ttb'
  const isVertical = layout === 'ttb' || layout === 'btt'

  // Refined Logic for XS and SM in Vertical Layouts
  const isXsVertical = isVertical && size === 'xs'
  const isSmVertical = isVertical && size === 'sm'

  const showBackground = !isSmVertical

  // Header Slot
  // - Hidden for XS vertical
  // - Hidden for SM vertical
  const headerSlot =
    isXsVertical || isSmVertical ? null : (
      <div className="mb-2 flex items-center justify-between">
        {tagText && (
          <Text
            text={tagText}
            as="span"
            className={`
              text-xs font-bold tracking-wider
              text-primary-600 uppercase text-shadow-sm dark:text-primary dark:text-shadow-none
            `}
          />
        )}
        <span
          className={`
            rounded-md bg-neutral-100 px-2 py-1 text-sm font-bold
            text-neutral-800 dark:bg-white/10 dark:text-white
            ${!tagText ? 'ms-auto' : ''}
          `}
        >
          {priceDisplay}
        </span>
      </div>
    )

  const contentHeader = product.header.header ? (
    <Text
      text={product.header.header.text}
      as="h4"
      className={`
        line-clamp-2 text-lg font-bold text-neutral-800
        transition-colors
        group-hover:text-primary group-hover:text-shadow-sm
        dark:text-white dark:group-hover:text-shadow-none
      `}
    />
  ) : null

  // Content Slot
  // - XS Vertical: Product Name only
  // - SM Vertical: Product Name (Header) + Price (Subheader)
  // - Others: Product Name (Header) only
  const contentSlot =
    isXsVertical || isSmVertical ? (
      <div className="flex flex-col gap-1">
        {contentHeader}
        {isSmVertical && priceDisplay && (
          <Text text={priceDisplay} as="span" className="font-bold text-neutral-500 dark:text-neutral-400" />
        )}
      </div>
    ) : (
      contentHeader
    )

  // Footer Slot
  // - Hidden for XS vertical and SM vertical
  const footerSlot =
    isXsVertical || isSmVertical ? null : (
      <ButtonLink
        data={{
          label: product.viewDetailsLabel,
          url: productUrl,
          openInNewTab: false,
        }}
        variant="secondary"
        className="mt-auto w-full py-3 text-center"
        direction={direction}
      />
    )

  return (
    <Card
      size={size}
      layout={layout}
      width={width}
      height={height}
      className={className}
      direction={direction}
      asLink={asLink}
      href={productUrl}
      image={primaryImage}
      imageSizes={imageSizes}
      noAnimation={noAnimation}
      preload={preload}
      showBackground={showBackground}
      imageOverlay={
        enableUserProfile && (
          <div className="absolute top-3 right-3 z-20">
            <button
              type="button"
              className={`
                z-20 flex size-10 items-center justify-center
                rounded-full bg-white/50 text-neutral-800
                backdrop-blur-md transition-colors hover:bg-primary
                hover:text-black active:bg-primary-600 active:text-black
                dark:bg-background-dark/50 dark:text-white dark:active:bg-primary-600
              `}
              aria-label={product.header.header?.ariaDescription ?? 'Add to favorites'}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <Icon icon="favorite_border" size="lg" />
            </button>
          </div>
        )
      }
      header={headerSlot}
      content={contentSlot}
      footer={footerSlot}
    />
  )
}
