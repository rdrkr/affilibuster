// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Dynamic Content Page
 * Reference: T130 (Content detail pages with generateStaticParams)
 * Displays content by language and slug with ISR
 */

import { getProducts, getNavigation } from '@/lib/client'
import { generateContentMetadata, SEOHead } from '@/components/SEOHead'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import type { Product, ContentResponse } from '@/lib/types'
import { transformProductToContent } from '@/lib/transformers'

interface NavigationData {
  availableInOtherLanguagesLabel?: string
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params

  try {
    const productsResponse = await getProducts()
    if (!productsResponse) {
      return {
        title: undefined,
        description: undefined,
      }
    }
    const found = productsResponse.data.find((item: Product) => item.slug === slug)
    if (!found) {
      return {
        title: undefined,
        description: undefined,
      }
    }
    const content = transformProductToContent(found, lang)
    return generateContentMetadata(content)
  } catch {
    return {
      title: undefined,
      description: undefined,
    }
  }
}

// Generate static params for SSG
export async function generateStaticParams() {
  const languages = ['en', 'it', 'he']
  const params: { lang: string; slug: string }[] = []

  // Fetch content for each language
  for (const lang of languages) {
    try {
      const productsResponse = await getProducts()
      if (productsResponse) {
        for (const item of productsResponse.data) {
          params.push({
            lang,
            slug: item.slug,
          })
        }
      }
    } catch (error) {
      console.error(`Failed to fetch content for ${lang}:`, error)
    }
  }

  return params
}

export default async function ContentPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  let lang = 'en'
  let slug = ''

  try {
    const resolvedParams = await params
    if (resolvedParams?.lang) {
      lang = resolvedParams.lang
    }
    if (resolvedParams?.slug) {
      slug = resolvedParams.slug
    }
  } catch (e) {
    console.error('Failed to resolve params:', e)
    notFound()
  }

  // Enable static rendering
  if (lang) {
    setRequestLocale(lang)
  }

  let product: Product | undefined
  let content: ContentResponse | undefined
  let navData: NavigationData | null = null

  try {
    const productsResponse = await getProducts()
    if (!productsResponse) {
      notFound()
    }
    product = productsResponse.data.find((item: Product) => item.slug === slug)
    if (!product) {
      notFound()
    }
    content = transformProductToContent(product, lang)
  } catch {
    notFound()
  }

  // Fetch navigation data for labels
  try {
    navData = await getNavigation()
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
  }

  return (
    <>
      {/* Schema Markup */}
      <SEOHead content={content} />

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>

          {content.excerpt && <p className="text-xl text-neutral-600 dark:text-neutral-400">{content.excerpt}</p>}

          {/* Metadata */}
          <div className="flex items-center gap-4 mt-6 text-sm text-neutral-500 dark:text-neutral-400">
            {content.publishedAt && (
              <>
                <time dateTime={new Date(content.publishedAt).toISOString()}>
                  {new Date(content.publishedAt).toLocaleDateString(lang, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span>•</span>
              </>
            )}
            <span className="capitalize">{content.type}</span>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-secondary-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />

        {/* Language Alternates */}
        {content.translations &&
          Object.keys(content.translations).length > 0 &&
          navData?.availableInOtherLanguagesLabel && (
            <aside className="mt-12 p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">{navData.availableInOtherLanguagesLabel}</h2>
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
  )
}
