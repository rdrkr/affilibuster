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
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Multi-language affiliate platform
        </p>
        <p className="text-red-600 dark:text-red-400">
          Unable to load content. Please ensure the backend API is running.
        </p>
      </div>
    );
  }

  return (
    <>
      <LanguagePrompt />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16 mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to <span className="text-blue-600">Affilibuster</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover the best products across languages and currencies. Shop with
            confidence in your preferred language.
          </p>
        </section>

        {/* Content Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Latest Products</h2>
            <Link
              href={`/${lang}/products`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.data.map((item) => (
              <Link
                key={item.id}
                href={`/${lang}/${item.slug}`}
                className="group border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Placeholder Image */}
                <div className="bg-gray-200 dark:bg-gray-700 h-48 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
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
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                      {item.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Info */}
          {content.pagination.totalItems > 0 && (
            <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Showing {content.data.length} of {content.pagination.totalItems}{' '}
              products
            </div>
          )}
        </section>
      </div>
    </>
  );
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 60; // Revalidate every 60 seconds
