// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from './Button'
import { Price } from './Price'

/**
 * Represents a related product item.
 */
export interface RelatedProduct {
  /** Unique product identifier */
  id: string
  /** Product name/title */
  name: string
  /** Product slug for URL routing */
  slug: string
  /** Product price amount */
  price: number
  /** Product currency code */
  currency: string
  /** Product image URL (optional) */
  imageUrl?: string
  /** Product image alt text */
  imageAlt?: string
}

/**
 * Props for the RelatedProducts component.
 */
export interface RelatedProductsProps {
  /** Array of related products to display */
  products: RelatedProduct[]
  /** Section title text */
  title?: string
  /** Current language code for routing */
  lang: string
  /** Additional CSS classes */
  className?: string
  /** Text for "View Product" button */
  viewProductText?: string
}

/**
 * Displays a grid of related products with images, names, prices, and links.
 *
 * @example
 * ```tsx
 * <RelatedProducts
 *   products={relatedProducts}
 *   title="You May Also Like"
 *   lang="en"
 *   viewProductText="View Product"
 * />
 * ```
 */
export function RelatedProducts({
  products,
  title = 'Related Products',
  lang,
  className = '',
  viewProductText = 'View Product',
}: RelatedProductsProps): React.ReactElement | null {
  if (products.length === 0) {
    return null
  }

  return (
    <section className={`py-8 ${className}`} data-testid="related-products" aria-labelledby="related-products-title">
      <h2 id="related-products-title" className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <div
            key={product.id}
            data-testid="related-product"
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col"
          >
            {/* Product Image */}
            {product.imageUrl && (
              <Link href={`/${lang}/products/${product.slug}`} className="block">
                <div className="aspect-square relative bg-neutral-100 dark:bg-neutral-700">
                  <Image
                    src={product.imageUrl}
                    alt={product.imageAlt ?? product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              </Link>
            )}

            {/* Product Info */}
            <div className="p-4 flex flex-col flex-grow">
              <Link
                href={`/${lang}/products/${product.slug}`}
                className="text-neutral-900 dark:text-white font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-2 line-clamp-2"
              >
                {product.name}
              </Link>

              <div className="mt-auto">
                <div className="mb-3">
                  <Price amount={product.price} currencyCode={product.currency} />
                </div>

                <Link href={`/${lang}/products/${product.slug}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    {viewProductText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
