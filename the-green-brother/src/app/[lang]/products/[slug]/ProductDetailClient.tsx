// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import { ButtonLink, Header, ImageGallery, Label, Text, TextBlock } from '@/components/elements'
import { Carousel, PageClient } from '@/components/layout'
import { DynamicZone } from '@/components/layout/DynamicZone'
import { ProductCard, ProductCertificatesSection } from '@/components/product'
import { useLayoutContext } from '@/components/providers'
import { DirectionEnum, type ApiProductProductDocument, type ElementsHeaderEntry } from '@/lib/generated/types.gen'

/**
 * Props for the ProductDetailClient component
 */
interface ProductDetailClientProps {
  /** Product data from CMS */
  product: ApiProductProductDocument
  /** Certificates section header from ProductCategoriesPage */
  certificatesHeader: ElementsHeaderEntry
  /** Related products (same category) */
  relatedProducts: ApiProductProductDocument[]
  /** Header for related products section */
  relatedProductsHeader: ElementsHeaderEntry
  /** Feature flag: Enable user profile features (favorites) */
  enableUserProfile: boolean
  /** CMS text to prefix before seller name (e.g., "by") */
  bySellerText: string
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
 * @param props.relatedProducts - Related products from CMS
 * @param props.relatedProductsHeader - Header for related products section
 * @param props.enableUserProfile - Feature flag for user profile features
 * @param props.bySellerText - CMS text to prefix before seller name
 * @returns Product detail UI
 */
export default function ProductDetailClient({
  product,
  certificatesHeader,
  relatedProducts,
  relatedProductsHeader,
  enableUserProfile,
  bySellerText,
}: ProductDetailClientProps) {
  const { direction } = useLayoutContext()
  const isRTL = direction === DirectionEnum.RTL

  const productTitle = product.header.header?.text ?? ''

  return (
    <PageClient
      breadcrumbs={{
        customLastCrumbLabel: <Text text={productTitle} />,
      }}
      childrenClassName="gap-10!"
    >
      <div
        className={`
          grid grid-cols-1 gap-12
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
          enableUserProfile={enableUserProfile}
        />

        {/* Info */}
        <div className="flex flex-col gap-10">
          <div>
            {/* Seller and Category Row */}
            <div className="mb-2 flex items-center justify-between">
              <Text
                text={product.category.content.text}
                as="p"
                className="text-sm font-bold tracking-wider text-accent-light uppercase"
              />
              <Text
                text={`${bySellerText} ${product.seller.firstName}${product.seller.lastName ? ` ${product.seller.lastName}` : ''}`}
                as="p"
                className="text-sm text-neutral-600 dark:text-tertiary-400"
              />
            </div>

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

            <div className="flex flex-col items-center gap-4">
              {/* Affiliate Link */}
              <ButtonLink
                data={product.affiliateButton}
                direction={direction}
                variant="primary"
                size="lg"
                className="w-full"
              />

              {/* Disclaimer Label */}
              <Label
                data={product.disclaimerLabel}
                direction={direction}
                className="text-center text-xs text-neutral-500"
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
            tabLayout="fill"
            backgroundVariant="tabs"
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

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <Header data={relatedProductsHeader} level={4} direction={direction} />
          <Carousel direction={direction} gap="md">
            {relatedProducts.map(relatedProduct => (
              <ProductCard
                key={relatedProduct.documentId}
                product={relatedProduct}
                direction={direction}
                size="sm"
                layout="ttb"
                width="fixed"
                asLink={true}
                noAnimation={true}
                enableUserProfile={enableUserProfile}
              />
            ))}
          </Carousel>
        </section>
      )}
    </PageClient>
  )
}
