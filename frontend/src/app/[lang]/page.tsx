// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Home Page (Language-specific)
 * Reference: T127 (Create home page per language)
 * Fetches content from Strapi homepage single type
 */

import { getHomepage, getProducts } from '@/lib/client'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { LanguagePrompt } from '@/components/LanguagePrompt'
import type { ApiHomepageHomepageDocument } from '@/lib/generated/types.gen'
import { _1Enum4 } from '@/lib/generated/types.gen'
import type { UiFeatureCardEntry, Product, LanguageCode } from '@/lib/types'
import { SUPPORTED_LANGUAGE_CODES } from '@/lib/types'

// Important: Strapi CMS must be running during build for content to be fetched
// Pages are rendered statically with ISR revalidation

interface Props {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGE_CODES.map(lang => ({ lang }))
}

export default async function HomePage({ params }: Props) {
  let lang: LanguageCode = 'en' as LanguageCode
  try {
    const resolvedParams = await params
    if (resolvedParams.lang) {
      lang = resolvedParams.lang as LanguageCode
    }
  } catch (e) {
    console.error('Failed to resolve params:', e)
  }

  // Enable static rendering
  setRequestLocale(lang)

  let homepageData: ApiHomepageHomepageDocument | null = null
  let productsList: Product[] = []

  try {
    // Fetch homepage content from Strapi with nested components
    homepageData = await getHomepage(lang, [_1Enum4.TRUST_CARDS, _1Enum4.FEATURE_CARDS])

    // Fetch featured products
    const productsResponse = await getProducts({
      'pagination[page]': 1,
      'pagination[pageSize]': 3,
      locale: lang,
    } as Parameters<typeof getProducts>[0])

    if (productsResponse) {
      productsList = productsResponse.data
    }
  } catch (error) {
    console.error('Failed to fetch content:', error)
  }

  return (
    <>
      <LanguagePrompt />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {homepageData?.heroTitle ? (
                <>
                  {homepageData.heroTitle.split('**').map((part: string, i: number) =>
                    i % 2 === 1 ? (
                      <span key={i} className="text-secondary-400">
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
                </>
              ) : null}
            </h1>
            {homepageData?.heroSubtitle && (
              <p className="text-xl text-neutral-200 mb-8 max-w-2xl mx-auto">{homepageData.heroSubtitle}</p>
            )}

            {/* Feature Cards Grid - Only show if CMS data available */}
            {homepageData?.featureCards && homepageData.featureCards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                {homepageData.featureCards.map((card: UiFeatureCardEntry, index: number) => (
                  <Link
                    key={index}
                    href={card.linkUrl ?? '/'}
                    className="group bg-primary-700 hover:bg-primary-600 rounded-xl p-6 transition-all duration-300 hover:scale-105"
                  >
                    <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2">{card.title}</h3>
                    <p className="text-sm text-neutral-200">{card.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {productsList.length > 0 && (
        <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">{homepageData?.featuredSectionTitle}</h2>
                <p className="text-neutral-600 dark:text-neutral-400">{homepageData?.featuredSectionSubtitle}</p>
              </div>
              <Link
                href={`/${lang}/products`}
                className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
              >
                {homepageData?.seeAllProductsText}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsList.map((product: Product) => (
                <Link
                  key={product.id}
                  href={`/${lang}/${product.slug}`}
                  className="group bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-primary-100 dark:border-primary-900 hover:border-tertiary-400 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 h-48 flex items-center justify-center">
                    <svg className="w-20 h-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="absolute top-4 right-4">
                      <span className="bg-secondary-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {homepageData?.featuredBadgeText}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                      {product.title}
                    </h3>
                    {product.excerpt ? (
                      <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">{product.excerpt}</p>
                    ) : null}
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-auto">
                      {homepageData?.viewDetailsButtonText}
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Info - Only show if CMS template available */}
            {homepageData?.showingProductsTemplate && (
              <div className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
                {homepageData.showingProductsTemplate
                  .replace('{count}', String(productsList.length))
                  .replace('{total}', String(productsList.length))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonial Section */}
      <section className="py-16 bg-tertiary-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-white">
              <div className="text-6xl mb-6 opacity-30">"</div>
              {homepageData?.testimonialsText && (
                <blockquote className="text-2xl md:text-3xl font-bold mb-8">{homepageData.testimonialsText}</blockquote>
              )}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">{homepageData?.testimonialAuthor}</div>
                  <div className="text-sm text-white/80">{homepageData?.testimonialRole}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - Only show if CMS data available (no fallbacks) */}
      {homepageData?.trustCards && homepageData.trustCards.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">
              {homepageData.whyChooseUsTitle ? (
                <>
                  {homepageData.whyChooseUsTitle.split('**').map((part: string, i: number) =>
                    i % 2 === 1 ? (
                      <span key={i} className="text-secondary-500">
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
                </>
              ) : null}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {homepageData.trustCards.map((card: Record<string, unknown>, index: number) => (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 dark:bg-primary-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{String(card.title)}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">{String(card.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
