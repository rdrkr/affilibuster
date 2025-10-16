// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Dynamic Content Page
 * Reference: T130 (Content detail pages with generateStaticParams)
 * Displays content by language and slug with ISR
 */

import { contentAPI } from '@/lib/api';
import { generateContentMetadata, SEOHead } from '@/components/SEOHead';
import { ContentFallbackNotice } from '@/components';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

interface ContentPageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ContentPageProps) {
  const { lang, slug } = await params;

  try {
    const content = await contentAPI.getBySlug(lang, slug);
    return generateContentMetadata(content);
  } catch (error) {
    return {
      title: 'Content Not Found',
      description: 'The requested content could not be found.',
    };
  }
}

// Generate static params for SSG
export async function generateStaticParams() {
  const languages = ['en', 'it', 'he'];
  const params: { lang: string; slug: string }[] = [];

  // Fetch content for each language
  for (const lang of languages) {
    try {
      const content = await contentAPI.list(lang, 1, 100);
      for (const item of content.data) {
        params.push({
          lang,
          slug: item.slug,
        });
      }
    } catch (error) {
      console.error(`Failed to fetch content for ${lang}:`, error);
    }
  }

  return params;
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { lang, slug } = await params;

  // Enable static rendering
  setRequestLocale(lang);

  let content;

  try {
    content = await contentAPI.getBySlug(lang, slug);
  } catch (error) {
    notFound();
  }

  return (
    <>
      {/* Schema Markup */}
      <SEOHead content={content} />

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Fallback Notice */}
        <ContentFallbackNotice
          isVisible={content.fallbackUsed || false}
          requestedLanguage={lang}
          fallbackLanguage={content.language}
        />

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {content.title}
          </h1>

          {content.excerpt && (
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              {content.excerpt}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 mt-6 text-sm text-neutral-500 dark:text-neutral-400">
            <time dateTime={content.publishedAt}>
              {content.publishedAt &&
                new Date(content.publishedAt).toLocaleDateString(lang, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
            </time>
            <span>•</span>
            <span className="capitalize">{content.type}</span>
            {content.fallbackUsed && (
              <>
                <span>•</span>
                <span className="text-warning-600 dark:text-warning-400">
                  Fallback Content
                </span>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <div
          className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-secondary-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />

        {/* Language Alternates */}
        {Object.keys(content.translations).length > 0 && (
          <aside className="mt-12 p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              Available in other languages:
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(content.translations).map(([lang, url]) => (
                <a
                  key={lang}
                  href={url}
                  className="px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                >
                  {lang.toUpperCase()}
                </a>
              ))}
            </div>
          </aside>
        )}
      </article>
    </>
  );
}

// Enable ISR (Incremental Static Regeneration)
// Revalidate every 60 seconds
export const revalidate = 60;

// Generate pages at build time for the first 100 content items per language
// Additional pages will be generated on-demand
export const dynamicParams = true;
