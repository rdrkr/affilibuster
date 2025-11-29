// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const Products = () => {
  const categories = ['All', 'Kitchen', 'Outdoor', 'Cleaning', 'Personal Care', 'Fashion']
  const [activeCategory, setActiveCategory] = useState('All')
  const router = useRouter()

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isLoggedIn = localStorage.getItem('isLoggedIn')

    if (!isLoggedIn) {
      router.push('/login')
    } else {
      // Logic to add to wishlist
      console.log('Added to wishlist')
    }
  }

  const products = [
    {
      id: 1,
      name: 'Bamboo Cutting Board',
      brand: 'EcoKitchen',
      price: '$24.99',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCkmvjtRSBsYVKIh0ZNtxVRCbEI-5EnGjlQIZ7F3pCji9BxmezwAMsXQFF9H4H3-OrM_LD4FVDESUWdOkbWxKoelkCUiv5etBfCasOxEvh43aS53wg6kBzKYhZ58I0lqGWwuF99ZbGA8B6uf-JYmiJnVC3b9E6O2HfivIixy28Et_Y2Z3JLHYuNsZUhKDSZX5pRNR6on_CCoZqlHFnlKJsQC-Giramo0PRpOuHsCNhcletLMsdm506JgMrr90nSr8HrWjJ-PyVs7TQ',
      category: 'Kitchen',
    },
    {
      id: 2,
      name: 'Recycled Glass Tumblers',
      brand: 'GreenGlass',
      price: '$35.00',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBKTl59Fz9LIEM7D2OC3mX0C9ENtbgauByGewDrHYh7KQgt33-ZG695pGpNK3fsoT8v6qQZOXa_QLEz6p08e0ZV8A48Oo0zMEJ4-35qKVSROrPZlEkjhTobAKE66uMAuIe-slvjDco12N4Z3VutuuthABgYQH6ZwGcA1p5gJ4LyhKKjgzQR7g5PIq1yzyJZocz4vJdsErzpysGjOCinutYFoG_WIOAahdxf1qfJEVFf5HmqlLxxoH1aZ24V9TRTmxeAu34Or0Bnre0',
      category: 'Kitchen',
    },
    {
      id: 3,
      name: 'Organic Cotton Towels',
      brand: 'PureFibre',
      price: '$45.50',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCjr_Wmpj2nnoUWBcbtV5TWYm_SFR0GZA1uIxf5n_88aQze--59esYkaryXMDMrLoegSITV9DlrNDe2gJ2ON7Dhn1-p5Iy4G0hKVF-AdxiSjtcDweUXQwXj-lUVAD0hmiqDDSkb1FKEBzUdlQd0Mo_hIXKETWXagCbFZsHnDoHN9p1P-bs4RZ__wUNHf18KuTC4U0kDnUj-0WBnvYOekrbxSJGATKAnCPLQFdQTRPvuOGBdomhWRRd46GKefQghlxehNo-w09-XEMs',
      category: 'Home',
    },
    {
      id: 4,
      name: 'Solar Garden Lights',
      brand: 'SunBeam',
      price: '$59.99',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBxrBWEMlmCF1TfS_Iiiqd4BoI4c5XNMyUx2mDAS1UcEx93fzFdDnidMRJu-YloGpKwXjgeS-mPQLqROQdpBevae-MyGFpcfjLJrvxiJrDGW9xIl8w9C6BDvmx-EiTIqXkUFZo7-dUYormKu0XstK7MDT8UEYRuSXPGeUhik6usZnGI58t6JCMPcmOYVW4bLVDECDdJn9cYjUAnugIgk5TcdN5Eh5K2VE2ebhbGsOg9A-PaXzT6nJLmvW30qpwThqTyWAUkaAgnNK4',
      category: 'Outdoor',
    },
    {
      id: 5,
      name: 'Compost Bin',
      brand: 'EcoKitchen',
      price: '$75.00',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAOiUCys9-L5xU4xMADNvvemNLveC2ITjHvoK4yGH3qV_rUj-6S1hrj8jouTsAhGZ79dnBFT3McKnBusfpw7DYLULjxIbNz7Sna_YPG01JwC74nJ_cipzV5PGMAiFujeL-6N7lpj-B_c47mLlpBAQLJ5A3IHjDWmvZ3QX6RRNIG2EsGl0BqXz6hPQIyTNY_eIViainbolatUEDH_Xqr--OSaXJb2IrvPIgtjAUtq4GmRZDN6Kb8O-UtPZervkEfeW55UB_DMWgMVhg',
      category: 'Kitchen',
    },
    {
      id: 6,
      name: 'All-Purpose Cleaner',
      brand: 'EarthlyClean',
      price: '$12.99',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC3_LIX9FJ4XwT0mjrPsU9rDAYFFvLsULQL49Fe_M3gULnuV_NN5s6D1qGyyspcvi57njORu0RgF51HjlBWE3PAyB9H8AGjSiqtFSy9zv7Jo_8eL5zPpiq_aoW8Wf2bI5vd_-LjQ4lEmc3XQwx5n0ufN7I3NA_G-Z_j1s9vW7gCDDhKbCklCub8_UqgEUoje3jEmZm0NKyXQTQk_nje7Q2DqFBPB3l1vfi1fK-XdFQxJbOSC75UPnUcwyJoHYKpcLl187O4t2ZL_1M',
      category: 'Cleaning',
    },
    {
      id: 7,
      name: 'Bamboo Toothbrush',
      brand: 'EcoSmile',
      price: '$3.99',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuArTMw_GJAUd6XwbLkM1fP8ZXrdCjiAy54YUFcIK315V03AxObqpkZNbTnrMm8goIP7o42elDA_s_coPWWem0rngqBCfuSoTwyRAa1q2qO33qhb8CRndKweL5Vi-mgc80MTYcrcQmMWQl-5OcY6FglK3SjMQL_yVSqXqrrpOCZ-qcXUrw-0rFBZAj_GzFKlnOKLi8lH5hfaaqBZYvFuOdgladLr4zM6pWUAdFNvvTgAljKqX8AywTeOhKoVf8y5qnPmZgi46Tq8Gmc',
      category: 'Personal Care',
    },
    {
      id: 8,
      name: 'Toothpaste Tablets',
      brand: 'EcoSmile',
      price: '$8.99',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAI373rMfh9Wz8V3IYa-mm3sRnYK99vDp8VMiipgcQhjiHePgzOQgJreFiTvOto5NNFo8OO-bA_tXH9Xp5nmwbfS8R9ZZpUD267nr0ZXAlS8CVZ4L9e8LcCyJfl_K7PQfQYK-fDHx1vwUm9gJcy3ON1N9_ml5iPm5HZtByQmHJPmfCyc225nhTy1_EtjJzLEI40zu4aZnVT2OzYofBKeYrabb6TCoNhiHyOtERbB0BdqqDOS9k3R6O6We0CqJqXthTKp9kq-ImTlF0',
      category: 'Personal Care',
    },
  ]

  const filteredProducts = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory)

  return (
    <div className="py-8">
      {/* Header & Search */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Sustainable Marketplace</h1>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-lg">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-dark">
              search
            </span>
            <input
              type="text"
              placeholder="Search sustainable products..."
              className="w-full bg-surface-dark border border-white/10 rounded-full pl-12 pr-4 py-3 text-white placeholder:text-text-secondary-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-dark text-white rounded-full border border-white/10 hover:border-primary transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-dark text-white rounded-full border border-white/10 hover:border-primary transition-colors whitespace-nowrap">
              Sort By
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto gap-3 pb-8 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat)
            }}
            className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-primary text-background-dark font-bold'
                : 'bg-surface-dark text-text-secondary-dark border border-white/10 hover:border-primary hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="bg-surface-dark rounded-2xl overflow-hidden shadow-lg border border-white/5 hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="relative h-64 overflow-hidden">
              <Image
                alt={product.name}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                src={product.image}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <button
                onClick={handleWishlistClick}
                className="absolute top-3 right-3 bg-background-dark/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-primary hover:text-black transition-colors z-10"
              >
                <span className="material-symbols-outlined text-xl block">favorite_border</span>
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-text-secondary-dark uppercase tracking-wider mb-1">
                {product.brand}
              </p>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xl font-bold text-white">{product.price}</span>
                <button className="bg-white/10 hover:bg-primary hover:text-background-dark text-white p-2 rounded-lg transition-colors z-10 relative">
                  <span className="material-symbols-outlined text-xl block">add_shopping_cart</span>
                </button>
              </div>
              <Link href={`/products/${String(product.id)}`} className="absolute inset-0 z-0"></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products
