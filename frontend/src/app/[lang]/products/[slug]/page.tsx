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
import { Button } from '@/components/Button'
import { Breadcrumb, type BreadcrumbItem } from '@/components/Breadcrumb'
import { RelatedProducts, type RelatedProduct } from '@/components/RelatedProducts'
import type { Product, ContentResponse, Navigation } from '@/lib/types'
import { transformProductToContent } from '@/lib/core/transformers'
import { getLanguageCodes } from '@/config/languages'
import { CodeEnum } from '@/lib/generated/types.gen'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params

  try {
    const productsResponse = await getProducts({ locale: lang as CodeEnum })
    if (!productsResponse) {
      return {
        title: 'Product Not Found - Affilibuster',
        description: 'The requested product could not be found.',
      }
    }
    const found = productsResponse.data.find((item: Product) => item.slug === slug)
    if (!found) {
      return {
        title: 'Product Not Found - Affilibuster',
        description: 'The requested product could not be found.',
      }
    }
    const content = transformProductToContent(found, lang as CodeEnum)
    return generateContentMetadata(content)
  } catch {
    return {
      title: 'Product Not Found - Affilibuster',
      description: 'The requested product could not be found.',
    }
  }
}

// Generate static params for SSG
export async function generateStaticParams() {
  const languages = await getLanguageCodes()
  const params: { lang: string; slug: string }[] = []

  // Fetch content for each language
  for (const lang of languages) {
    try {
      const productsResponse = await getProducts({ locale: lang })
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
  let lang = CodeEnum.EN
  setRequestLocale(lang)
  let slug = ''

  try {
    const resolvedParams = await params
    if (resolvedParams.lang) {
      lang = resolvedParams.lang as CodeEnum
    }
    if (resolvedParams.slug) {
      slug = resolvedParams.slug
    }
  } catch (e) {
    console.error('Failed to resolve params:', e)
    notFound()
  }

  // Enable static rendering

  let product: Product | undefined
  let content: ContentResponse | undefined
  let navData: Navigation | null = null

  try {
    const productsResponse = await getProducts({ locale: lang })
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
    navData = await getNavigation(lang)
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
  }

  // Prepare breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: `/${lang}` },
    { label: 'Products', href: `/${lang}/products` },
    { label: content.title, isCurrentPage: true },
  ]

  // Get related products (up to 4, excluding current product)
  const relatedProductsData: RelatedProduct[] = []
  try {
    const allProductsResponse = await getProducts({ locale: lang })
    if (allProductsResponse) {
      const otherProducts = allProductsResponse.data.filter((p: Product) => p.id !== product.id).slice(0, 4)
      relatedProductsData.push(
        ...otherProducts.map((p: Product) => ({
          id: String(p.id),
          name: p.title,
          slug: p.slug,
          price: 99.99, // TODO: Add real price field to Product type
          currency: 'USD', // TODO: Get from user preferences or product
        }))
      )
    }
  } catch (error) {
    console.error('Failed to fetch related products:', error)
  }

  return (
    <>
      {/* Schema Markup */}
      <SEOHead content={content} />

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="product-title">
            {content.title}
          </h1>

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
                  <a key={lang} href={url}>
                    <Button variant="ghost" size="sm">
                      {lang.toUpperCase()}
                    </Button>
                  </a>
                ))}
              </div>
            </aside>
          )}

        {/* Related Products */}
        {relatedProductsData.length > 0 && (
          <RelatedProducts
            products={relatedProductsData}
            title="You May Also Like"
            lang={lang}
            viewProductText="View Product"
            className="mt-16"
          />
        )}
      </article>
    </>
  )
}
