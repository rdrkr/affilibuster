// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import { useState } from 'react'

import { ButtonAction, ButtonLink, ImageGallery, Text, TextBlock } from '@/components/elements'
import { PageClient } from '@/components/layout'
import { DynamicZone } from '@/components/layout/DynamicZone'
import { ProductCertificatesSection, QuantitySelector } from '@/components/product'
import { useLayoutContext } from '@/components/providers'
import {
  DirectionEnum,
  IconPositionEnum,
  type ApiProductProductDocument,
  type ElementsButtonEntry,
  type ElementsHeaderEntry,
} from '@/lib/generated/types.gen'

/**
 * Props for the ProductDetailClient component
 */
interface ProductDetailClientProps {
  /** Product data from CMS */
  product: ApiProductProductDocument
  /** Certificates section header from ProductCategoriesPage */
  certificatesHeader: ElementsHeaderEntry
}

/**
 * Client component for product detail page.
 *
 * Renders product information with image gallery, pricing, description,
 * and interactive elements like wishlist and quantity selector.
 * Uses reusable CMS-driven components for breadcrumbs, buttons, and images.
 * @param props - Component properties
 * @param props.product - Product data from CMS
 * @param props.certificatesHeader - Certificates section header from ProductCategoriesPage
 * @returns Product detail UI
 */
export default function ProductDetailClient({ product, certificatesHeader }: ProductDetailClientProps) {
  const { direction } = useLayoutContext()
  const isRTL = direction === DirectionEnum.RTL
  const [quantity, setQuantity] = useState(1)

  const productTitle = product.header.header?.text ?? ''

  /**
   * Increment product quantity.
   */
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  /**
   * Decrement product quantity (minimum 1).
   */
  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }

  /**
   * Handle wishlist button click.
   */
  const handleWishlistClick = () => {
    console.log('Added to wishlist')
  }

  // Create wishlist button data
  const wishlistButtonData: ElementsButtonEntry = {
    label: {
      icon: 'favorite_border',
      text: '',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Add to wishlist',
    },
    url: '',
    openInNewTab: false,
  }

  return (
    <PageClient
      breadcrumbs={{
        customLastCrumbLabel: <Text text={productTitle} />,
      }}
    >
      <div
        className={`
          mb-16 grid grid-cols-1 gap-12
          lg:grid-cols-2
        `}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Gallery */}
        <ImageGallery
          images={product.images}
          direction={direction}
          preload
          sizes="(max-width: 768px) 100vw, 600px"
          placeholderIcon="image"
          ariaLabel={`${productTitle} images`}
        />

        {/* Info */}
        <div className="mb-6 flex flex-col gap-12">
          <div>
            <Text
              text={product.category.content.text}
              as="p"
              className={`
                mb-2 text-sm font-bold tracking-wider text-primary-500 uppercase
              `}
            />

            <Text
              text={productTitle}
              as="h1"
              className={`
                mb-4 text-3xl font-bold text-neutral-800 md:text-4xl
                dark:text-white
              `}
            />

            {product.prices[0] && (
              <div className="mb-8 text-3xl font-bold text-neutral-800 dark:text-white">
                {product.prices[0].currency.symbol}
                {product.prices[0].amount.toFixed(2)}
                {product.prices[0].currency.code && product.prices[0].currency.code !== 'USD' && (
                  <span className="ml-2 text-lg text-neutral-500 dark:text-tertiary-400">
                    {product.prices[0].currency.code}
                  </span>
                )}
              </div>
            )}

            {product.header.subheader?.text && (
              <Text
                text={product.header.subheader.text}
                as="p"
                className="prose mb-8 text-neutral-600 prose-neutral dark:text-tertiary-300 dark:prose-invert"
              />
            )}

            <div className="mb-8 flex gap-4">
              {/* Quantity Selector */}
              <QuantitySelector
                quantity={quantity}
                onIncrement={incrementQuantity}
                onDecrement={decrementQuantity}
                direction={direction}
              />

              {/* Affiliate Link */}
              <ButtonLink
                data={product.affiliateButton}
                direction={direction}
                variant="primary"
                size="lg"
                className="flex-1"
              />

              {/* Wishlist Button */}
              <ButtonAction
                data={wishlistButtonData}
                direction={direction}
                variant="ghost-3"
                size="lg"
                onClick={handleWishlistClick}
              />
            </div>
          </div>

          {/* Product Certificates */}
          {product.certificates && product.certificates.length > 0 && (
            <ProductCertificatesSection
              certificates={product.certificates}
              direction={direction}
              header={certificatesHeader}
            />
          )}

          {/* Product Content */}
          <DynamicZone
            sections={product.description}
            direction={direction}
            verticalAlignment="center"
            layout="tabbed"
            className="mb-16"
            renderSection={section => {
              switch (section.__component) {
                case 'elements.text-block':
                  return <TextBlock data={section} direction={direction} />
                default:
                  // Unknown section type or marker - render nothing
                  return null
              }
            }}
          />
        </div>
      </div>
    </PageClient>
  )
}
