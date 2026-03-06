// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * WishlistClient Component
 *
 * Client component for the Wishlist page.
 * Renders wishlist items (currently mock) using CMS labels.
 */

import NextImage from 'next/image'
import Link from 'next/link'

import { type ApiProfileProfileDocument, DirectionEnum } from '@/lib/generated/types.gen'

interface WishlistClientProps {
  data: ApiProfileProfileDocument
  lang: string
  direction: DirectionEnum
}

/**
 * Wishlist Client component
 * @param root0 - Component props
 * @param root0.data - Profile data from CMS
 * @param root0.lang - Current language code
 * @param root0.direction - Text direction
 * @returns React component
 */
export default function WishlistClient({ data, lang, direction }: WishlistClientProps) {
  const { wishlistHeader, wishlistAddButton, wishlistRemoveButton } = data

  // Mock items for now
  const items = [
    {
      id: 1,
      name: 'Bamboo Toothbrush Set',
      price: '$12.99',
      image: '/images/wishlist-item-1.webp',
    },
    {
      id: 2,
      name: 'Reusable Coffee Cup',
      price: '$25.00',
      image: '/images/wishlist-item-2.webp',
    },
    {
      id: 3,
      name: 'Solar Powered Charger',
      price: '$49.50',
      image: '/images/wishlist-item-3.webp',
    },
  ]

  const isRtl = direction === DirectionEnum.RTL

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`/${lang}/profile`}
          className={`
          rounded-full bg-muted p-2 transition-colors
          hover:bg-muted dark:bg-card dark:hover:bg-white/10
        `}
        >
          <span className={`material-symbols-outlined text-foreground ${isRtl ? 'rotate-180' : ''}`}>arrow_back</span>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">{wishlistHeader.header?.text ?? 'Wishlist'}</h1>
      </div>

      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className={`
              group flex flex-col items-center gap-6 rounded-xl border
              border-border bg-card p-4 transition-[border-color]
              hover:border-primary-hover/30
              sm:flex-row sm:p-6
            `}
          >
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
              <NextImage
                src={item.image}
                alt={item.name}
                fill
                className={`
                  object-cover transition-transform duration-500
                  group-hover:scale-110
                `}
                sizes="96px"
              />
            </div>
            <div className="grow text-center sm:text-left">
              <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
              <p className="mt-1 font-bold text-primary">{item.price}</p>
            </div>
            <div className="flex w-full gap-3 sm:w-auto">
              <button
                className={`
                  flex flex-1 items-center justify-center gap-2 rounded-xl
                  bg-muted px-4 py-2 text-muted-foreground
                  transition-colors
                  hover:bg-error/10 hover:text-error
                  sm:flex-none dark:bg-white/5
                `}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                <span className="sm:hidden">{wishlistRemoveButton.label?.text ?? 'Remove'}</span>
              </button>
              <button
                className={`
                  flex flex-1 items-center justify-center gap-2 rounded-xl
                  bg-primary px-6 py-2 font-bold text-foreground shadow-lg
                  shadow-primary/10 transition-colors
                  hover:bg-primary-hover
                  sm:flex-none
                `}
              >
                <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                {wishlistAddButton.label?.text ?? 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
