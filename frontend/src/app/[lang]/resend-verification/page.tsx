// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * Resend Verification page component.
 * Displays the form to resend email verification.
 */

import { useRouter } from 'next/navigation'
import { ResendVerificationForm } from '@/components/auth'

/**
 * Resend Verification page props
 */
interface ResendVerificationPageProps {
  params: Promise<{
    lang: string
  }>
}

/**
 * Resend Verification page component
 *
 * @param props - Page props with language parameter
 * @returns Resend Verification page
 */
export default function ResendVerificationPage({ params }: ResendVerificationPageProps): React.ReactElement {
  const router = useRouter()

  /**
   * Handle successful resend
   */
  const handleSuccess = (): void => {
    console.info('Verification email resent')
  }

  /**
   * Handle login link click
   */
  const handleLoginClick = (): void => {
    void params.then(({ lang }) => {
      router.push(`/${lang}/login`)
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
      <div className="w-full max-w-md">
        <ResendVerificationForm onSuccess={handleSuccess} onLoginClick={handleLoginClick} />
      </div>
    </main>
  )
}
