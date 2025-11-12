// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Register page component.
 * Displays the registration form for new user signup.
 */

import type { Metadata } from 'next'
import { RegisterPageClient } from './RegisterPageClient'

/**
 * Register page props
 */
interface RegisterPageProps {
  params: Promise<{
    lang: string
  }>
}

/**
 * Generate metadata for the register page
 *
 * @returns Metadata object
 */
export function generateMetadata(): Metadata {
  return {
    title: 'Sign Up - Affilibuster',
    description: 'Create an Affilibuster account to get personalized product recommendations.',
    robots: 'noindex, nofollow', // Don't index registration page
  }
}

/**
 * Register page component (server component wrapper)
 *
 * @param props - Page props with language parameter
 * @returns Register page
 */
export default async function RegisterPage({ params }: RegisterPageProps): Promise<React.ReactElement> {
  const { lang } = await params

  return <RegisterPageClient lang={lang} />
}
