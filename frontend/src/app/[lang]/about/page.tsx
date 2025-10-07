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
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">About Affilibuster</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Affilibuster is a multi-language affiliate platform designed to help you
          discover the best products across languages and currencies.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p>
          We believe that language and currency should never be a barrier to finding
          the perfect product. Our platform makes it easy to browse, compare, and shop
          in your preferred language and currency.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Features</h2>
        <ul>
          <li>
            <strong>Multi-Language Support:</strong> Browse products in English,
            Italian, and Hebrew
          </li>
          <li>
            <strong>Currency Conversion:</strong> See prices in your preferred currency
          </li>
          <li>
            <strong>RTL Support:</strong> Full right-to-left layout support for Hebrew
          </li>
          <li>
            <strong>SEO Optimized:</strong> Proper hreflang tags and schema markup for
            all languages
          </li>
          <li>
            <strong>Fast Performance:</strong> Static site generation with incremental
            regeneration
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Technology Stack</h2>
        <p>
          Built with modern web technologies including Next.js 14, FastAPI, PostgreSQL,
          and Redis, following Clean Architecture and SOLID principles.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Get in Touch</h2>
        <p>
          Have questions or feedback? We'd love to hear from you! Contact us at{' '}
          <a href="mailto:info@affilibuster.com" className="text-blue-600 hover:underline">
            info@affilibuster.com
          </a>
        </p>
      </div>
    </div>
  );
}
