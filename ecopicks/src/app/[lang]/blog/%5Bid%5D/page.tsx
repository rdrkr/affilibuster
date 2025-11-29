// Copyright (c) 2025 Affilibuster by Ronen Druker.

import Image from 'next/image'
import Link from 'next/link'

const BlogPost = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <nav className="flex items-center text-sm text-text-secondary-dark mb-8">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="material-symbols-outlined text-sm mx-2">chevron_right</span>
        <Link href="/blog" className="hover:text-primary transition-colors">
          Blog
        </Link>
        <span className="material-symbols-outlined text-sm mx-2">chevron_right</span>
        <span className="text-white font-medium truncate">Zero-Waste Kitchens</span>
      </nav>

      <header className="mb-10 text-center">
        <span className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block">Guides</span>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          The Ultimate Guide to Zero-Waste Kitchens
        </h1>
        <div className="flex items-center justify-center gap-4 text-text-secondary-dark text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
              SG
            </div>
            <span>Sarah Greene</span>
          </div>
          <span>•</span>
          <span>July 26, 2024</span>
          <span>•</span>
          <span>8 min read</span>
        </div>
      </header>

      <div className="w-full aspect-video rounded-2xl overflow-hidden mb-12 shadow-2xl border border-white/5 relative">
        <Image
          alt="A zero waste kitchen"
          className="object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0NXPcbrqelOZ0dB8loKFKf65PjFTtnenNA0vXEbLmvF8Ssv-QWAj6aJCVOyo3M-VIJ9DnK22YFwlBF4SZTzzmYyJVMDh0ZAXQ-cP8rfKGbn9yGM8LIyuSpTHV2C_jajFdHi3L9jpT-nPI90dkBKQPWJs9D0nLUOOEwz4z6sl5RG17BTH7TI_7yWvFP3v6KK-MBc-GVMGctX2yKvlbyogVUTzsNx8VTqmwx0euLV1uUMIv25YXomd02eIbt96CZnh75iPLrIWKVQY"
          fill
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>

      <article className="prose prose-invert prose-lg max-w-none text-text-secondary-dark">
        <p className="lead text-xl text-white font-medium mb-8">
          Discover simple swaps and tips to reduce your kitchen&apos;s carbon footprint and live more sustainably.
          Embracing a zero-waste lifestyle might seem daunting, but starting in the kitchen can make a significant
          impact.
        </p>

        <h2 className="text-2xl font-bold text-white mt-12 mb-4">The First Steps</h2>
        <p className="mb-6">
          One of the easiest first steps is to ditch single-use plastics. Swap plastic wrap for reusable beeswax wraps,
          plastic bags for silicone or cloth alternatives, and plastic containers for glass jars. When shopping, bring
          your own bags and produce bags to avoid taking new ones.
        </p>

        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Smart Shopping and Storage</h2>
        <p className="mb-6">
          Buying in bulk is a game-changer. It reduces packaging waste and often saves you money. Stock your stores with
          bulk bins for grains, nuts, spices, and liquids like oil and vinegar. Store your bulk items in airtight glass
          jars to keep them fresh and your pantry organized.
        </p>
        <p className="mb-6">
          Proper food storage is key to reducing food waste. Learn which fruits and vegetables should be refrigerated
          and which should be kept at room temperature. Use clear containers so you can easily see what you have,
          preventing food from being forgotten and spoiling.
        </p>

        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Composting and Repurposing</h2>
        <p className="mb-6">
          Even with careful planning, some food scraps are inevitable. Composting is an excellent way to turn fruit and
          vegetable peels, coffee grounds, and eggshells into nutrient-rich soil for your garden.
        </p>

        <blockquote className="bg-surface-dark border-l-4 border-primary p-6 my-8 italic text-white rounded-r-lg">
          &quot;Zero waste isn&apos;t about perfection, it&apos;s about making better choices, one at a time.&quot;
        </blockquote>
      </article>

      <div className="mt-16 pt-8 border-t border-white/10">
        <h3 className="text-2xl font-bold text-white mb-8">Comments (2)</h3>
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold shrink-0">
              AC
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white">Alex Chen</h4>
                <span className="text-sm text-text-secondary-dark">2 days ago</span>
              </div>
              <p className="text-text-secondary-dark">
                Great guide! I&apos;ve been wanting to start composting but didn&apos;t know where to begin. The tip
                about freezing scraps is a game changer.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
              MR
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white">Maria Rodriguez</span>
                <span className="text-xs text-text-secondary-dark">5 days ago</span>
              </div>
              <p className="text-text-secondary-dark">
                Composting has been a game-changer for my garden. Thanks for the inspiration to start!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <textarea
            className="w-full bg-surface-dark border border-white/10 rounded-xl p-4 text-white placeholder:text-text-secondary-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
            rows={4}
            placeholder="Add a comment..."
          ></textarea>
          <div className="mt-4 flex justify-end">
            <button className="bg-primary text-background-dark font-bold py-2 px-6 rounded-full hover:bg-primary-hover transition-colors">
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPost
