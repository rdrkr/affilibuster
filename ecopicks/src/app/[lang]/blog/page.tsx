// Copyright (c) 2025 Affilibuster by Ronen Druker.

import Image from 'next/image'
import Link from 'next/link'

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: 'The Ultimate Guide to Zero-Waste Kitchens',
      excerpt:
        'Discover simple swaps and tips to reduce your kitchen&apos;s carbon footprint and live more sustainably.',
      author: 'Sarah Greene',
      readTime: '8 min read',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBgf1IjtnLCTyqTYSTb8teoRTb21pGfJIO1JjpAC3ciSMq2xp9prmqbvhegbmPKDywXxNwrDhpO2oTBYvwGr36bfbnEHFGoliN_8qX1kyuJqSBQhV29UygAepWm54TZ1-SPIJg1rWR74ll4SRQhYAfquxM82I0XBMyHr6oCTS5Qb3KIRuO-xdDrLQDH1NFd2rbNh84L_koV3wkrepKJBu1n8BbLlgeT63k_RrjXA2ds0sIgcGh2u2-vN_-egcB7iKVpt17rtYhqIqw',
      tag: 'Guides',
    },
    {
      id: 2,
      title: '5 DIY Eco-Friendly Cleaning Recipes',
      excerpt: 'Swap out harsh chemicals for these simple, effective, and all-natural cleaning solutions.',
      author: 'Alex Chen',
      readTime: '5 min read',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCLFWLdm4eRoO2W5HvKzhhQt7XxtZFtYIF8yQxmZZmeH-c9o7EnJggMABH4slmel_cOxSZKAvP8IdkVSk2xEcYecA3R2sXMjTNSMA8B35A72oqziZtzL8Gxm_QU3zaGASIxuvZ8EFaIXRbP882PrDvA74ageJaxbUjaYhYQJfMjfllyY4K-ZLwwD0BFV88qluU-R-h5vP4MVZOgy3ludowtcPt0jU46oBTIxbWVmJ4pX5_uK6klAeaEc9ahC7caNCCXPjCav30P-AY',
      tag: 'DIY',
    },
    {
      id: 3,
      title: 'Your Guide to Composting for Beginners',
      excerpt: 'Turn your food scraps into nutrient-rich soil. It&apos;s easier than you think to get started.',
      author: 'Maria Rodriguez',
      readTime: '6 min read',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDmQ2m_4puRW4_gKaQZnoJM0N08Ne4A7t6hI9vSthTqGMcYDkhgvoAsa8fYv0tImrUCK8Zx2TUODYTjXUv6gZvlgMkYNTK3ru7JOU348qO-DQZESw7fIOh3dxz74NrzjGauLCq9dWf7KFiUGwwWwH4XZYZlzV0WYpSTUmzh7uBvfGJnh1-AcR1S2EAqkplUUYMDJS4VDWyOOjcBzj_erfOKw-W6ITba44gt1bWkco80-kx5JIOT4LdtT4_esWCE8emBwdlBeCrxpt0',
      tag: 'Guides',
    },
  ]

  return (
    <div className="py-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Sustainable Living, <span className="text-primary">Simplified.</span>
        </h1>
        <p className="text-text-secondary-dark text-lg">
          Expert advice, guides, and inspiration for your eco-friendly journey.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {['All', 'Zero Waste', 'DIY', 'Product Guides', 'Lifestyle'].map(tag => (
            <button
              key={tag}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                tag === 'All'
                  ? 'bg-primary text-background-dark font-bold'
                  : 'bg-surface-dark border border-white/10 text-text-secondary-dark hover:border-primary hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {/* Featured Post */}
        {/* Featured Post */}
        {posts[0] && (
          <div className="bg-surface-dark rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all group">
            <div className="md:flex">
              <div className="md:w-1/2 h-64 md:h-auto overflow-hidden relative">
                <Image
                  alt={posts[0].title}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  src={posts[0].image}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2">{posts[0].tag}</span>
                <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                  {posts[0].title}
                </h2>
                <p className="text-text-secondary-dark mb-6 text-lg">{posts[0].excerpt}</p>
                <div className="flex items-center text-sm text-text-secondary-dark mb-8">
                  <span>By {posts[0].author}</span>
                  <span className="mx-2">•</span>
                  <span>{posts[0].readTime}</span>
                </div>
                <Link
                  href="/blog/1"
                  className="inline-block bg-white/10 text-white font-bold py-3 px-8 rounded-full hover:bg-primary hover:text-background-dark transition-all text-center w-max"
                >
                  Read Article
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Grid Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map(post => (
            <Link
              href={`/blog/${String(post.id)}`}
              key={post.id}
              className="bg-surface-dark rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all group flex flex-col"
            >
              <div className="h-56 overflow-hidden relative">
                <Image
                  alt={post.title}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  src={post.image}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6 flex flex-col grow">
                <span className="text-primary font-bold text-xs uppercase tracking-wider mb-2">{post.tag}</span>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-text-secondary-dark text-sm mb-4 grow line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-text-secondary-dark mt-auto border-t border-white/5 pt-4">
                  <span>{post.author}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}

          {/* Duplicate for visual balance */}
          <Link
            href="/blog/3"
            className="bg-surface-dark rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all group flex flex-col"
          >
            <div className="h-56 overflow-hidden relative">
              <Image
                alt="Sustainable bathroom swaps"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjPKJFIB94jzvYTQr_f7BK1C1HDfIU_LL2HcdrgAHgxtnKQUSuw944qmnUnbfNA7HRlfSBtgON9zhvuPiWxONtHPir3PVcSMpnVhF1DKDnDWKBBRRDT-Cu41Kfz1IdX0nSMwf5ouPxGXucWzuU_St2uuk_tB5BlZi4nYYXD_Sn6XofcJHruGolj_HrAOSfsXEFaMvKtfMnT-y7AG-tlqNY9qV_9mulGJFP1jvK1MAWGYDXvG2H2_74po6s8wSCe9eN9XK1XfikAHI"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-6 flex flex-col grow">
              <span className="text-primary font-bold text-xs uppercase tracking-wider mb-2">Lifestyle</span>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                10 Sustainable Swaps for a Greener Bathroom
              </h3>
              <p className="text-text-secondary-dark text-sm mb-4 grow line-clamp-3">
                From bamboo toothbrushes to solid shampoo bars, reduce plastic waste with these simple changes.
              </p>
              <div className="flex items-center justify-between text-xs text-text-secondary-dark mt-auto border-t border-white/5 pt-4">
                <span>Eco Hub Team</span>
                <span>4 min read</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Blog
