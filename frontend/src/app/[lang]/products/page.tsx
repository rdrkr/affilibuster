// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Products Listing Page
 * Shows all products for the current language
 */

import { contentAPI } from '@/lib/api';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: 'Products | Affilibuster',
    description: 'Browse our collection of products in multiple languages and currencies',
  };
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'it' }, { lang: 'he' }];
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  // Enable static rendering
  setRequestLocale(lang);

  let content;

  try {
    content = await contentAPI.list(lang, currentPage, 24);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Products</h1>
        <p className="text-red-600 dark:text-red-400">
          Unable to load products. Please try again later.
        </p>
      </div>
    );
  }

  // Filter to only show products (not pages)
  const products = content.data.filter((item) => item.type === 'product');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Products</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Browse our collection of products
        </p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((item) => (
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

          {/* Pagination */}
          {content.pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {/* Previous Button */}
              {content.pagination.hasPrevious && (
                <Link
                  href={`/${lang}/products?page=${currentPage - 1}`}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  ← Previous
                </Link>
              )}

              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {Array.from({ length: content.pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and 2 pages around current
                    return (
                      page === 1 ||
                      page === content.pagination.totalPages ||
                      Math.abs(page - currentPage) <= 2
                    );
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center gap-2">
                      {/* Show ellipsis if there's a gap */}
                      {index > 0 && page - array[index - 1] > 1 && (
                        <span className="text-gray-400">...</span>
                      )}

                      <Link
                        href={`/${lang}/products?page=${page}`}
                        className={`px-4 py-2 border rounded-md transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </Link>
                    </div>
                  ))}
              </div>

              {/* Next Button */}
              {content.pagination.hasNext && (
                <Link
                  href={`/${lang}/products?page=${currentPage + 1}`}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          )}

          {/* Pagination Info */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Showing {products.length} of {content.pagination.totalItems} products
            {content.pagination.totalPages > 1 && (
              <> · Page {currentPage} of {content.pagination.totalPages}</>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            No products found.
          </p>
        </div>
      )}
    </div>
  );
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 60; // Revalidate every 60 seconds
