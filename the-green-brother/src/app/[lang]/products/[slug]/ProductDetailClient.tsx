// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Image, Text } from '@/components/elements'
import { PageClient } from '@/components/layout'
import { useLayoutContext } from '@/components/providers'
import type { ApiProductProductDocument } from '@/lib/generated/types.gen'

interface ProductDetailClientProps {
  product: ApiProductProductDocument
}

/**
 * Client component for product detail page.
 *
 * Renders product information with image gallery, pricing, description,
 * and interactive elements like wishlist and quantity selector.
 * @param props - Component properties
 * @param props.product - Product data from CMS
 * @returns Product detail UI
 */
export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { lang } = useLayoutContext()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // Get image data
  const images = product.images
  const selectedImageData = images[selectedImageIndex]

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

  /**
   * Handle add to cart button click.
   */
  const handleAddToCart = () => {
    const productName = product.content?.header?.header?.text ?? product.slug
    console.log(`Added ${String(quantity)} of ${productName} to cart`)
  }

  return (
    <PageClient>
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center text-sm text-neutral-500 dark:text-tertiary-400">
        <Link
          href={`/${lang}`}
          className={`
          transition-colors
          hover:text-primary-500
        `}
        >
          Home
        </Link>
        <span className="material-symbols-outlined mx-2 text-sm">chevron_right</span>
        <Link
          href={`/${lang}/products`}
          className={`
          transition-colors
          hover:text-primary-500
        `}
        >
          Products
        </Link>
        <span className="material-symbols-outlined mx-2 text-sm">chevron_right</span>
        <Text
          text={product.content?.header?.header?.text ?? ''}
          as="span"
          className="truncate font-medium text-neutral-800 dark:text-white"
        />
      </nav>

      <div
        className={`
        mb-16 grid grid-cols-1 gap-12
        lg:grid-cols-2
      `}
      >
        {/* Gallery */}
        <div className="space-y-4">
          <div
            className={`
              relative aspect-square overflow-hidden rounded-xl border
              border-neutral-200 bg-white
              dark:border-tertiary-700 dark:bg-tertiary-800
            `}
          >
            {selectedImageData ? (
              <Image
                image={selectedImageData}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                preload
                loading="eager"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <span
                  className={`
                  material-symbols-outlined text-6xl text-tertiary-600
                `}
                >
                  image
                </span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedImageIndex(i)
                  }}
                  className={`
                    aspect-square overflow-hidden rounded-xl border-2
                    ${
                      i === selectedImageIndex
                        ? 'border-primary-500'
                        : `
                      border-transparent
                    `
                    }
                    relative bg-white transition-colors hover:border-primary-500/50
                    dark:bg-tertiary-800
                  `}
                >
                  <Image image={img} className="object-cover" fill sizes="100px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="mb-6">
            {product.category?.content?.text && (
              <Text
                text={product.category.content.text}
                as="p"
                className={`
                  mb-2 text-sm font-bold tracking-wider text-primary-500 uppercase
                `}
              />
            )}

            <Text
              text={product.content?.header?.header?.text ?? ''}
              as="h1"
              className={`
                mb-4 text-3xl font-bold text-neutral-800 md:text-4xl
                dark:text-white
              `}
            />
          </div>

          {product.price && (
            <div className="mb-8 text-3xl font-bold text-neutral-800 dark:text-white">
              ${product.price}
              {product.currency?.code && product.currency.code !== 'USD' && (
                <span className="ml-2 text-lg text-neutral-500 dark:text-tertiary-400">{product.currency.code}</span>
              )}
            </div>
          )}

          {product.content?.header?.subheader?.text && (
            <Text
              text={product.content.header.subheader.text}
              as="p"
              className="prose mb-8 text-neutral-600 prose-neutral dark:text-tertiary-300 dark:prose-invert"
            />
          )}

          <div className="mb-8 flex gap-4">
            <div
              className={`
                flex w-32 items-center justify-between rounded-xl border
                border-neutral-200 bg-white px-3 py-2
                dark:border-tertiary-700 dark:bg-tertiary-800
              `}
            >
              <button
                onClick={decrementQuantity}
                className={`
                text-neutral-500 transition-colors hover:text-neutral-800
                dark:text-tertiary-400 dark:hover:text-white
              `}
              >
                -
              </button>
              <span className="font-bold text-neutral-800 dark:text-white">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className={`
                text-neutral-500 transition-colors hover:text-neutral-800
                dark:text-tertiary-400 dark:hover:text-white
              `}
              >
                +
              </button>
            </div>
            {product.affiliateButton.url ? (
              <a
                href={product.affiliateButton.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex-1 rounded-xl bg-primary-600 py-3 text-center font-bold
                  text-white shadow-lg shadow-primary-600/20 transition-colors
                  hover:bg-primary-700
                `}
              >
                Buy Now
              </a>
            ) : (
              <button
                onClick={handleAddToCart}
                className={`
                  flex-1 rounded-xl bg-primary-600 py-3 font-bold text-white
                  shadow-lg shadow-primary-600/20 transition-colors
                  hover:bg-primary-700
                `}
              >
                Add to Cart
              </button>
            )}
            <button
              onClick={handleWishlistClick}
              className={`
                rounded-xl border border-neutral-200 bg-white p-3 text-neutral-600
                transition-colors hover:border-primary-500 hover:text-primary-500
                dark:border-tertiary-700 dark:bg-tertiary-800 dark:text-white
                dark:hover:border-primary-500 dark:hover:text-primary-500
              `}
            >
              <span className="material-symbols-outlined">favorite_border</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Content */}
      {product.content?.content && (
        <div className="mb-16 max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold text-neutral-800 dark:text-white">Product Details</h2>
          <div
            className="prose max-w-none text-neutral-600 prose-neutral dark:text-tertiary-300 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: product.content.content }}
          />
        </div>
      )}
    </PageClient>
  )
}
