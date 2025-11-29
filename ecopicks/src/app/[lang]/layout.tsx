// Copyright (c) 2025 Affilibuster by Ronen Druker.

import BackToTopButton from '@/components/BackToTopButton'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import '@/styles/globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

interface Props {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params

  // Validate that the incoming `lang` parameter is valid
  if (!['en', 'it', 'he'].includes(lang)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(lang)

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex flex-col min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          <Navbar />
          <main className="grow px-4 sm:px-6 lg:px-8">{children}</main>
          <Footer />
        </div>
        <BackToTopButton />
      </div>
    </NextIntlClientProvider>
  )
}
