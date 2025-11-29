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
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBYs4FyfUdH9aZObhysDrCNtqAOMeQ3-k2X-Sg8LrEAOgcapy_gp2QezRK86oFYxtkJKiUWViTIf-5di8e-t_xN69W_s7OK9YPwfuQII2tM-tlar05NdROek5pt0oabwRMHx9GO6sT97JOGX1QEtwxdiWE4GNrxumYf_Vcd3t-Y8ixJZkB41Zo0whSUykkAI-pM_MDBRJDZw75t_bkKBclkfzooSqvOuLauNt01eAj_EQ9Lhx9hps0l1vUkd-foRml1Wks5YrF_1YM',
    },
    {
      id: 2,
      name: 'Reusable Coffee Cup',
      price: '$25.00',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB81IqpMRFKnra6ThU5qmOdgIX3bMdUagM6PTbowXJ6_nzhB6owHmVphdU0Wt67UKAqyMWAIUl0caUzNoa-hZiP7vNbsQVUxS7CFXJZok65nZWhlEAIx_OOJ3eysBudUh3nezYF5pretbcER2RJTStjd-PNVr2HsX7vcgR6WRc1d00uu4qUZU5AEt5U3onm72nBycfk2RGDuIIzoUknZmlh33dJsKogM6Wj6y9H0tguNEgBHZGVbxMIGV15milcyIO30wRcVlittf8',
    },
    {
      id: 3,
      name: 'Solar Powered Charger',
      price: '$49.50',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA2tN2GXtYXoVzgKi5z4y7b8n5353wt_GLegJVAfuJ8D91j3qqWFe3HBDhDbtoh773imO0F4nX4AcorPraAi6bSmHp3GsOAXAvLoByFqnOijm1uTeF1nKlHmB4nInwuBnILABN4mvFBeMktzHR1LQ6ZRzQFFfK-VO9pDXWNcI9uejE0T1VdTWnvHJBmbZjIZCGm8z-j8Tfh8n7_Rx006OXUJILVtvOqn3xU7pQjjOnZBOQDwPJC0upRsBR-U5uH-9ct_2H-rkXNvAY',
    },
  ]

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="p-2 rounded-full bg-surface-dark hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </Link>
        <h1 className="text-3xl font-bold text-white">Wishlist</h1>
      </div>

      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-surface-dark rounded-xl border border-white/5 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 group hover:border-primary/30 transition-all"
          >
            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 relative">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="96px"
              />
            </div>
            <div className="grow text-center sm:text-left">
              <h3 className="text-lg font-bold text-white">{item.name}</h3>
              <p className="text-primary font-bold mt-1">{item.price}</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-text-secondary-dark hover:bg-red-500/10 hover:text-red-400 transition-colors">
                <span className="material-symbols-outlined text-lg">delete</span>
                <span className="sm:hidden">Remove</span>
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-primary text-background-dark font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/10">
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
