// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'

const ProductDetails = () => {
  // const params = useParams()
  // const { id } = params // Not used in mock data but available

  // Mock data - in a real app this would come from an API based on ID
  const product = {
    name: 'All-Natural Bamboo Toothbrush',
    price: '$3.99',
    brand: 'EcoSmile',
    rating: 4.8,
    reviews: 1288,
    description:
      'Upgrade your oral hygiene routine with our 100% biodegradable bamboo toothbrush. The naturally antimicrobial bamboo handle and soft, BPA-free nylon bristles provide an effective clean while being gentle on your gums and the planet.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuArTMw_GJAUd6XwbLkM1fP8ZXrdCjiAy54YUFcIK315V03AxObqpkZNbTnrMm8goIP7o42elDA_s_coPWWem0rngqBCfuSoTwyRAa1q2qO33qhb8CRndKweL5Vi-mgc80MTYcrcQmMWQl-5OcY6FglK3SjMQL_yVSqXqrrpOCZ-qcXUrw-0rFBZAj_GzFKlnOKLi8lH5hfaaqBZYvFuOdgladLr4zM6pWUAdFNvvTgAljKqX8AywTeOhKoVf8y5qnPmZgi46Tq8Gmc',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAI373rMfh9Wz8V3IYa-mm3sRnYK99vDp8VMiipgcQhjiHePgzOQgJreFiTvOto5NNFo8OO-bA_tXH9Xp5nmwbfS8R9ZZpUD267nr0ZXAlS8CVZ4L9e8LcCyJfl_K7PQfQYK-fDHx1vwUm9gJcy3ON1N9_ml5iPm5HZtByQmHJPmfCyc225nhTy1_EtjJzLEI40zu4aZnVT2OzYofBKeYrabb6TCoNhiHyOtERbB0BdqqDOS9k3R6O6We0CqJqXthTKp9kq-ImTlF0',
    ],
    certifications: [
      { name: 'Compostable', icon: 'recycling' },
      { name: 'Vegan', icon: 'eco' },
      { name: 'FSC Certified', icon: 'forest' },
      { name: 'Plastic-Free', icon: 'compost' },
    ],
  }

  return (
    <div className="py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-text-secondary-dark mb-8">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="material-symbols-outlined text-sm mx-2">chevron_right</span>
        <Link href="/products" className="hover:text-primary transition-colors">
          Products
        </Link>
        <span className="material-symbols-outlined text-sm mx-2">chevron_right</span>
        <span className="text-white font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-surface-dark rounded-2xl overflow-hidden border border-white/5 relative">
            <Image
              alt={product.name}
              className="object-cover"
              src={product.images[0] ?? ''}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 0, 0].map((_, i) => (
              <button
                key={i}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  i === 0 ? 'border-primary' : 'border-transparent'
                } hover:border-primary/50 transition-colors relative`}
              >
                <Image
                  alt={`Thumb ${String(i)}`}
                  className="object-cover"
                  src={product.images[i % 2] ?? ''}
                  fill
                  sizes="100px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="mb-6">
            <p className="text-primary font-bold text-sm tracking-wider uppercase mb-2">{product.brand}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(s => (
                  <span
                    key={s}
                    className="material-symbols-outlined text-xl fill-current"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {s <= 4 ? 'star' : 'star_half'}
                  </span>
                ))}
              </div>
              <span className="text-text-secondary-dark text-sm underline cursor-pointer hover:text-white">
                {product.reviews} reviews
              </span>
            </div>
          </div>

          <div className="text-3xl font-bold text-white mb-8">{product.price}</div>

          <div className="prose prose-invert text-text-secondary-dark mb-8">
            <p>{product.description}</p>
          </div>

          <div className="flex gap-4 mb-8">
            <div className="w-32 bg-surface-dark border border-white/10 rounded-lg flex items-center justify-between px-3 py-2">
              <button className="text-text-secondary-dark hover:text-white transition-colors">-</button>
              <span className="font-bold text-white">1</span>
              <button className="text-text-secondary-dark hover:text-white transition-colors">+</button>
            </div>
            <button className="flex-1 bg-primary text-background-dark font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
              Add to Cart
            </button>
            <button className="bg-surface-dark border border-white/10 text-white p-3 rounded-lg hover:border-primary hover:text-primary transition-colors">
              <span className="material-symbols-outlined">favorite_border</span>
            </button>
          </div>

          <div className="border-t border-white/10 pt-8">
            <h4 className="font-bold text-white mb-4">Eco-Certifications</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {product.certifications.map(cert => (
                <div
                  key={cert.name}
                  className="flex flex-col items-center text-center gap-2 p-3 bg-surface-dark rounded-xl border border-white/5"
                >
                  <span className="material-symbols-outlined text-3xl text-primary">{cert.icon}</span>
                  <span className="text-xs text-text-secondary-dark font-medium">{cert.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Accordions */}
      <div className="space-y-4 max-w-3xl">
        <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
          <button className="w-full flex items-center justify-between p-5 text-left font-bold text-white hover:bg-white/5 transition-colors">
            <span>Product Details</span>
            <span className="material-symbols-outlined">expand_more</span>
          </button>
        </div>
        <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
          <button className="w-full flex items-center justify-between p-5 text-left font-bold text-white hover:bg-white/5 transition-colors">
            <span>Sustainability Impact</span>
            <span className="material-symbols-outlined">expand_more</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
