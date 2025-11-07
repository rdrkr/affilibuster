// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Contact Page
 * Static page available in all languages
 */

import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { getContact } from '@/lib/client'
import type { ApiContactContactDocument } from '@/lib/generated/types.gen'
import { _1Enum2 } from '@/lib/generated/types.gen'
import type { UiContactCardEntry, LanguageCode } from '@/lib/types'
import { SUPPORTED_LANGUAGE_CODES } from '@/lib/types'

interface Props {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGE_CODES.map(lang => ({ lang }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  try {
    const contactData = await getContact(lang as LanguageCode, [_1Enum2.CONTACT_CARDS])

    return {
      title: contactData?.metaTitle,
      description: contactData?.metaDescription,
    }
  } catch (error) {
    console.error('Failed to fetch contact metadata:', error)
    return {
      title: undefined,
      description: undefined,
    }
  }
}

export default async function ContactPage({ params }: Props) {
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

  let contactData: ApiContactContactDocument | null = null
  try {
    contactData = await getContact(lang, [_1Enum2.CONTACT_CARDS])
  } catch (error) {
    console.error('Failed to fetch contact page:', error)
  }

  // Don't render page if data is unavailable
  if (!contactData?.heroTitle || !contactData.contactCards) {
    return null
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {contactData.heroTitle && (
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {contactData.heroTitle.split('**').map((part: string, i: number) =>
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
            {contactData.heroSubtitle && <p className="text-xl text-neutral-200">{contactData.heroSubtitle}</p>}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {contactData.contactCards.map((card: UiContactCardEntry, index: number) => (
            <div
              key={index}
              className={`bg-white dark:bg-neutral-800 p-8 rounded-xl border shadow-lg hover:shadow-xl transition-shadow ${index % 2 === 0 ? 'border-primary-200 dark:border-primary-700' : 'border-secondary-200 dark:border-secondary-700'}`}
            >
              <div
                className={`${index % 2 === 0 ? 'bg-primary-100 dark:bg-primary-900' : 'bg-secondary-100 dark:bg-secondary-900'} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}
              >
                <svg
                  className={`w-7 h-7 ${index % 2 === 0 ? 'text-primary-600' : 'text-secondary-600'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">{card.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">{card.description}</p>
              <a
                href={`mailto:${card.email}`}
                className={`${index % 2 === 0 ? 'text-primary-600 dark:text-primary-400 hover:text-secondary-600 dark:hover:text-secondary-400' : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'} font-semibold inline-flex items-center gap-2 group`}
              >
                <span>{card.email}</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 p-8 rounded-2xl border border-primary-200 dark:border-primary-700 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-secondary-500 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">
                {contactData.responseTimeTitle}
              </h2>
              <p className="text-neutral-700 dark:text-neutral-200">{contactData.responseTimeText}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 p-8 rounded-2xl border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-start gap-4">
            <div className="bg-primary-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">
                {contactData.officeHoursTitle}
              </h2>
              <p className="text-neutral-700 dark:text-neutral-200">{contactData.officeHoursText}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
