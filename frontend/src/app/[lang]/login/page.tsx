// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Login page component.
 * Displays the login form for user authentication.
 */

import type { Metadata } from 'next'
import { LoginPageClient } from './LoginPageClient'

/**
 * Login page props
 */
interface LoginPageProps {
  params: Promise<{
    lang: string
  }>
}

/**
 * Generate metadata for the login page
 *
 * @returns Metadata object
 */
export function generateMetadata(): Metadata {
  return {
    title: 'Log In - Affilibuster',
    description: 'Log in to your Affilibuster account to access personalized product recommendations.',
    robots: 'noindex, nofollow', // Don't index login page
  }
}

/**
 * Login page component (server component wrapper)
 *
 * @param props - Page props with language parameter
 * @returns Login page
 */
export default async function LoginPage({ params }: LoginPageProps): Promise<React.ReactElement> {
  const { lang } = await params

  return <LoginPageClient lang={lang} />
}
