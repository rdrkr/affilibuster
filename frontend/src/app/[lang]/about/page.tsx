// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * About Page
 * Static page available in all languages
 */

import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: 'About Us | Affilibuster',
    description: 'Learn more about Affilibuster, the multi-language affiliate platform',
  };
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'it' }, { lang: 'he' }];
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;

  // Enable static rendering
  setRequestLocale(lang);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-secondary-400">Affilibuster</span>
            </h1>
            <p className="text-xl text-neutral-200">
              A multi-language affiliate platform helping you discover the best products
              across languages and currencies.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-3xl font-bold mt-8 mb-4 text-primary-800 dark:text-primary-300">
            Our Mission
          </h2>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
            We believe that language and currency should never be a barrier to finding
            the perfect product. Our platform makes it easy to browse, compare, and shop
            in your preferred language and currency.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6 text-primary-800 dark:text-primary-300">
            Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700 shadow-sm">
              <div className="bg-primary-100 dark:bg-primary-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-neutral-900 dark:text-white">Multi-Language Support</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Browse products in English, Italian, and Hebrew</p>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700 shadow-sm">
              <div className="bg-secondary-100 dark:bg-secondary-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-neutral-900 dark:text-white">Currency Conversion</h3>
              <p className="text-neutral-600 dark:text-neutral-400">See prices in your preferred currency</p>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700 shadow-sm">
              <div className="bg-primary-100 dark:bg-primary-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-neutral-900 dark:text-white">Fast Performance</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Static site generation with incremental regeneration</p>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700 shadow-sm">
              <div className="bg-secondary-100 dark:bg-secondary-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-neutral-900 dark:text-white">SEO Optimized</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Proper hreflang tags and schema markup for all languages</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-4 text-primary-800 dark:text-primary-300">
            Technology Stack
          </h2>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-8">
            Built with modern web technologies including Next.js 15, FastAPI, PostgreSQL,
            and Redis, following Clean Architecture and SOLID principles.
          </p>

          <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 p-8 rounded-2xl my-8 border border-secondary-200 dark:border-secondary-700">
            <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
              Get in Touch
            </h2>
            <p className="text-neutral-700 dark:text-neutral-200">
              Have questions or feedback? We would love to hear from you! Contact us at{' '}
              <a href="mailto:info@affilibuster.com" className="text-primary-700 dark:text-primary-400 hover:text-secondary-600 dark:hover:text-secondary-400 font-semibold underline">
                info@affilibuster.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
