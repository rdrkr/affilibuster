// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Home Page (Language-specific)
 * Reference: T127 (Create home page per language)
 */

import { contentAPI } from '@/lib/api';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { LanguagePrompt } from '@/components/LanguagePrompt';

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function HomePage({ params }: Props) {
  const { lang } = await params;

  // Enable static rendering
  setRequestLocale(lang);

  let content;

  try {
    content = await contentAPI.list(lang, 1, 12);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Affilibuster</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Multi-language affiliate platform
        </p>
        <p className="text-error-600 dark:text-error-400">
          Unable to load content. Please ensure the backend API is running.
        </p>
      </div>
    );
  }

  return (
    <>
      <LanguagePrompt />

      {/* Hero Section with Purple Gradient */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Helping you find the{' '}
              <span className="text-secondary-400">best products</span>
            </h1>
            <p className="text-xl text-neutral-200 mb-8 max-w-2xl mx-auto">
              Since 2025, we've been helping users find their perfect products.
              Explore our expert reviews, smart tools, and trusted guides, and
              shop with confidence.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <Link
                href={`/${lang}/products`}
                className="group bg-primary-700 hover:bg-primary-600 rounded-xl p-6 transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">All Products</h3>
                <p className="text-sm text-neutral-200">Browse our collection</p>
              </Link>

              <Link
                href={`/${lang}/about`}
                className="group bg-primary-700 hover:bg-primary-600 rounded-xl p-6 transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">About Us</h3>
                <p className="text-sm text-neutral-200">Learn our story</p>
              </Link>

              <Link
                href={`/${lang}/products?filter=new`}
                className="group bg-primary-700 hover:bg-primary-600 rounded-xl p-6 transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Latest News</h3>
                <p className="text-sm text-neutral-200">Stay updated</p>
              </Link>

              <Link
                href={`/${lang}/contact`}
                className="group bg-primary-700 hover:bg-primary-600 rounded-xl p-6 transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Contact Us</h3>
                <p className="text-sm text-neutral-200">Get in touch</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Browse our top picks</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Discover the latest featured products
              </p>
            </div>
            <Link
              href={`/${lang}/products`}
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
            >
              See all products
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.data.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/${lang}/${item.slug}`}
                className="group bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-primary-100 dark:border-primary-900 hover:border-tertiary-400"
              >
                {/* Product Image */}
                <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 h-48 flex items-center justify-center">
                  <svg
                    className="w-20 h-20 text-white/20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="absolute top-4 right-4">
                    <span className="bg-secondary-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
                      {item.excerpt}
                    </p>
                  )}
                  <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Info */}
          {content.pagination.totalItems > 0 && (
            <div className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
              Showing {content.data.length} of {content.pagination.totalItems}{' '}
              products
            </div>
          )}
        </div>
      </section>

      {/* Testimonial Section */}
        <section className="py-16 bg-tertiary-500">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-white">
                <div className="text-6xl mb-6 opacity-30">"</div>
                <blockquote className="text-2xl md:text-3xl font-bold mb-8">
                  We're on a mission to find the best products for smart shoppers like you.
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Affilibuster Team</div>
                    <div className="text-sm text-white/80">Product Curators</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">
              Why use <span className="text-secondary-500">Affilibuster?</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="bg-primary-100 dark:bg-primary-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Trusted for years</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Multi-language support helping users worldwide find the perfect products
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 dark:bg-primary-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Expert curation</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Carefully selected products reviewed by industry experts
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 dark:bg-primary-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Verified reviews</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Honest, unbiased reviews you can trust when making decisions
                </p>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 60; // Revalidate every 60 seconds
