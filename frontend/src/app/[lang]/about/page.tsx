// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * About Page
 * Static page available in all languages
 */

import { setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'
import { getAbout } from '@/lib/client'
import type { ApiAboutAboutDocument } from '@/lib/generated/types.gen'
import type { UiFeatureItemEntry } from '@/lib/types'

// Important: Strapi CMS must be running during build for content to be fetched
// Pages are rendered statically with ISR revalidation

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'it' }, { lang: 'he' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params

  try {
    const aboutData = await getAbout()

    return {
      title: aboutData?.metaTitle,
      description: aboutData?.metaDescription,
    }
  } catch (error) {
    console.error('Failed to fetch about metadata:', error)
    return {
      title: undefined,
      description: undefined,
    }
  }
}

export default async function AboutPage({ params }: Props) {
  let lang = 'en'
  try {
    const resolvedParams = await params
    if (resolvedParams?.lang) {
      lang = resolvedParams.lang
    }
  } catch (e) {
    console.error('Failed to resolve params:', e)
  }

  // Enable static rendering
  if (lang) {
    setRequestLocale(lang)
  }

  let aboutData: ApiAboutAboutDocument | null = null
  try {
    aboutData = await getAbout()
  } catch (error) {
    console.error('Failed to fetch about page:', error)
  }

  // Don't render page if data is unavailable
  if (!aboutData || !aboutData.heroTitle || !aboutData.missionTitle) {
    return null
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {aboutData?.heroTitle && (
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {aboutData.heroTitle.split('**').map((part: string, i: number) =>
                  i % 2 === 1 ? (
                    <span key={i} className="text-secondary-400">
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
              </h1>
            )}
            {aboutData?.heroSubtitle && <p className="text-xl text-neutral-200">{aboutData.heroSubtitle}</p>}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose dark:prose-invert max-w-none">
          {aboutData?.missionTitle && (
            <>
              <h2 className="text-3xl font-bold mt-8 mb-4 text-primary-800 dark:text-primary-300">
                {aboutData.missionTitle}
              </h2>
              {aboutData?.missionContent && (
                <div
                  className="text-lg text-neutral-700 dark:text-neutral-300 mb-6"
                  dangerouslySetInnerHTML={{ __html: aboutData.missionContent }}
                />
              )}
            </>
          )}

          {aboutData?.featuresList && aboutData.featuresList.length > 0 && (
            <>
              <h2 className="text-3xl font-bold mt-12 mb-6 text-primary-800 dark:text-primary-300">
                {aboutData.featuresTitle}
              </h2>
              <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                {aboutData.featuresList.map((feature: UiFeatureItemEntry, index: number) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700 shadow-sm"
                  >
                    <div className="bg-primary-100 dark:bg-primary-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-neutral-900 dark:text-white">{feature.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 className="text-3xl font-bold mt-12 mb-4 text-primary-800 dark:text-primary-300">
            {aboutData?.techStackTitle}
          </h2>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-8">{aboutData?.techStackDescription}</p>

          {aboutData?.ctaTitle && (
            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 p-8 rounded-2xl my-8 border border-secondary-200 dark:border-secondary-700">
              <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">{aboutData.ctaTitle}</h2>
              {aboutData.ctaText && (
                <p
                  className="text-neutral-700 dark:text-neutral-200"
                  dangerouslySetInnerHTML={{ __html: aboutData.ctaText }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
