// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'

const Wishlist = () => {
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

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/profile"
          className={`
          rounded-full bg-neutral-100 p-2 transition-colors
          hover:bg-neutral-200 dark:bg-surface-dark dark:hover:bg-white/10
        `}
        >
          <span className="material-symbols-outlined text-neutral-800 dark:text-white">arrow_back</span>
        </Link>
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">Wishlist</h1>
      </div>

      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className={`
              group flex flex-col items-center gap-6 rounded-xl border
              border-neutral-200 bg-white p-4 transition-all
              hover:border-primary/30
              sm:flex-row sm:p-6
              dark:border-white/5 dark:bg-surface-dark
            `}
          >
            <div
              className={`
              relative size-24 shrink-0 overflow-hidden rounded-xl
            `}
            >
              <Image
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
            <div
              className={`
              grow text-center
              sm:text-left
            `}
            >
              <h3 className="text-lg font-bold text-neutral-800 dark:text-white">{item.name}</h3>
              <p className="mt-1 font-bold text-primary">{item.price}</p>
            </div>
            <div
              className={`
              flex w-full gap-3
              sm:w-auto
            `}
            >
              <button
                className={`
                  flex flex-1 items-center justify-center gap-2 rounded-xl
                  bg-neutral-100 px-4 py-2 text-neutral-600
                  transition-colors
                  hover:bg-red-500/10 hover:text-red-400
                  sm:flex-none dark:bg-white/5
                  dark:text-text-secondary-dark
                `}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                <span className="sm:hidden">Remove</span>
              </button>
              <button
                className={`
                  flex flex-1 items-center justify-center gap-2 rounded-xl
                  bg-primary px-6 py-2 font-bold text-background-dark shadow-lg
                  shadow-primary/10 transition-colors
                  hover:bg-primary-hover
                  sm:flex-none
                `}
              >
                <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Wishlist
