// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const Home = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVisible(true)
  }, [])

  const categories = [
    {
      name: 'Home',
      icon: 'home',
      href: '/products?category=home',
    },
    {
      name: 'Fashion',
      icon: 'styler',
      href: '/products?category=fashion',
    },
    {
      name: 'Tech',
      icon: 'bolt',
      href: '/products?category=tech',
    },
    {
      name: 'Beauty',
      icon: 'spa',
      href: '/products?category=beauty',
    },
    {
      name: 'Outdoor',
      icon: 'forest',
      href: '/products?category=outdoor',
    },
  ]

  const features = [
    {
      icon: 'verified',
      title: 'Vetted Brands',
      description: 'We only partner with brands that meet our strict sustainability criteria.',
    },
    {
      icon: 'public',
      title: 'Support the Planet',
      description: 'Every purchase contributes to a healthier Earth and a better future.',
    },
    {
      icon: 'sell',
      title: 'Exclusive Deals',
      description: 'Access special offers on the best sustainable products curated for you.',
    },
    {
      icon: 'recycling',
      title: 'Circular Economy',
      description: 'We prioritize products designed for minimal waste and maximum reuse.',
    },
  ]

  const featuredProducts = [
    {
      id: 1,
      name: 'Bamboo Coffee Cup',
      price: '$18.00',
      image: '/images/product-bamboo-cup.jpg',
      tag: 'Plastic-Free',
    },
    {
      id: 2,
      name: 'Organic Produce Bags',
      price: '$12.50',
      image: '/images/product-produce-bags.jpg',
      tag: 'Zero-Waste',
    },
    {
      id: 3,
      name: 'Reusable Metal Straws',
      price: '$9.99',
      image: '/images/product-metal-straws.jpg',
      tag: 'Eco-Friendly',
    },
    {
      id: 4,
      name: 'Solid Shampoo Bar',
      price: '$14.00',
      image: '/images/product-shampoo-bar.jpg',
      tag: 'Package-Free',
    },
  ]

  const blogPosts = [
    {
      id: 1,
      title: '10 Simple Swaps for a More Sustainable Kitchen',
      excerpt: 'Reduce plastic waste and make your kitchen more eco-friendly with these easy changes.',
      image: '/images/blog-kitchen-swaps.jpg',
      tag: 'Tips & Tricks',
    },
    {
      id: 2,
      title: 'The Ultimate Guide to Zero-Waste Shopping',
      excerpt: 'Learn how to shop without creating trash, from the farmers market to the bulk aisle.',
      image: '/images/blog-zero-waste.jpg',
      tag: 'Guides',
    },
    {
      id: 3,
      title: 'Why Composting is Easier Than You Think',
      excerpt: 'Turn your food scraps into nutrient-rich soil for your garden. We break down the basics.',
      image: '/images/blog-composting.jpg',
      tag: 'Community',
    },
  ]

  return (
    <div
      className={`space-y-16 md:space-y-24 py-8 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] max-h-[600px] rounded-2xl overflow-hidden flex items-center justify-center text-center shadow-2xl">
        <Image
          alt="A person gently holding a small potted plant"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
          src="/images/hero-plant.jpg"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/40 to-transparent z-10"></div>
        <div className="relative z-20 text-white max-w-4xl px-4 animate-fade-in-up">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            Live Sustainably, <br /> <span className="text-primary">Effortlessly</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium">
            Discover curated, high-quality products that are good for you and the planet.
          </p>
          <Link
            href="/products"
            className="mt-10 inline-flex items-center gap-2 bg-primary text-background-dark font-bold py-4 px-8 rounded-full text-lg hover:bg-primary-hover transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
          >
            Explore Top Picks
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-end mb-8 px-2">
          <div>
            <h3 className="text-3xl font-bold text-white">Featured Products</h3>
            <p className="text-text-secondary-dark mt-2">Our most loved eco-friendly essentials</p>
          </div>
          <Link
            href="/products"
            className="text-primary font-semibold hover:text-primary-hover flex items-center gap-1 transition-colors"
          >
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {featuredProducts.map(product => (
            <div key={product.id} className="flex-shrink-0 w-72 sm:w-80 snap-start group">
              <div className="bg-surface-dark rounded-2xl overflow-hidden shadow-lg border border-white/5 hover:border-primary/30 transition-all duration-300 hover:transform hover:-translate-y-1">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={product.image}
                    fill
                    sizes="320px"
                  />
                  <div className="absolute top-3 right-3">
                    <button className="bg-background-dark/50 backdrop-blur-md w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-primary hover:text-black transition-colors">
                      <span className="material-symbols-outlined text-xl block">favorite_border</span>
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{product.tag}</p>
                      <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                    </div>
                    <span className="font-bold text-white bg-white/10 px-2 py-1 rounded-md text-sm">
                      {product.price}
                    </span>
                  </div>
                  <Link
                    href={`/products/${String(product.id)}`}
                    className="mt-4 w-full block text-center bg-white/5 text-white font-semibold py-3 rounded-xl hover:bg-primary hover:text-background-dark transition-all duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-16">
        <h3 className="text-3xl font-bold mb-10 text-center">Shop by Category</h3>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {categories.map(cat => (
            <Link key={cat.name} href={cat.href} className="flex flex-col items-center gap-3 group">
              <div className="w-28 h-28 bg-surface-dark border border-white/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300 transform group-hover:scale-110 shadow-lg">
                <span
                  className="material-symbols-outlined text-6xl text-text-secondary-dark group-hover:text-background-dark transition-colors"
                  style={{ fontVariationSettings: '"FILL" 0, "wght" 500, "GRAD" 0, "opsz" 48', fontSize: '3rem' }}
                >
                  {cat.icon}
                </span>
              </div>
              <span className="font-semibold text-text-secondary-dark group-hover:text-white transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-surface-dark rounded-3xl p-8 md:p-16 border border-white/5 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 lg:flex lg:items-center lg:gap-20">
          <div className="lg:w-1/3 mb-10 lg:mb-0">
            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Why Choose <br />
              <span className="text-primary">EcoPicks?</span>
            </h3>
            <p className="mt-6 text-text-secondary-dark text-lg">
              We make conscious consumption simple, transparent, and rewarding for everyone involved.
            </p>
            <Link href="/about" className="mt-8 inline-flex items-center text-primary font-bold hover:underline">
              Learn more about our mission <span className="material-symbols-outlined ml-1 text-lg">arrow_forward</span>
            </Link>
          </div>
          <div className="mt-8 lg:mt-0 lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="text-primary flex-shrink-0">
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{feature.title}</h4>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* From Our Blog */}
      <section className="mb-24">
        <h2 className="text-3xl font-bold text-white mb-4 text-center">From Our Blog</h2>
        <p className="text-text-secondary-dark text-lg text-center max-w-2xl mx-auto mb-12">
          Discover tips, guides, and stories to inspire your eco-friendly journey. Learn how to reduce waste, choose
          sustainable products, and make a difference with every purchase.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <Link
              key={post.id}
              href={`/blog/${String(post.id)}`}
              className="group bg-surface-dark rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all hover:-translate-y-1 block h-full flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 flex flex-col grow">
                <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2">{post.tag}</span>
                <h3 className="text-white font-bold text-lg mb-3 leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-text-secondary-dark text-sm line-clamp-3 mb-4 grow">{post.excerpt}</p>
                <div className="flex items-center text-primary text-xs font-bold mt-auto">
                  Read Article <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Join Our Community */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-text-secondary-dark leading-relaxed">
              At EcoPicks, we&apos;re dedicated to making sustainable living simple and accessible for everyone. We
              believe that small changes in our daily choices can lead to a significant positive impact on our planet.
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-8 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-2 text-center">Join Our Community</h3>
            <p className="text-text-secondary-dark text-sm text-center mb-6">
              Get weekly eco-tips, new product alerts, and exclusive deals sent to your inbox.
            </p>
            <form
              className="flex gap-2"
              onSubmit={e => {
                e.preventDefault()
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="grow bg-black/20 border border-white/10 rounded-full px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 placeholder-text-secondary-dark/50"
              />
              <button
                type="submit"
                className="bg-primary text-background-dark px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary-hover transition-colors shadow-lg whitespace-nowrap"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
