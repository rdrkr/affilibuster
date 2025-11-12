// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * Forgot Password page component.
 * Displays the form to request a password reset email.
 */

import { useRouter } from 'next/navigation'
import { ForgotPasswordForm } from '@/components/auth'

/**
 * Forgot Password page props
 */
interface ForgotPasswordPageProps {
  params: Promise<{
    lang: string
  }>
}

/**
 * Forgot Password page component
 *
 * @param props - Page props with language parameter
 * @returns Forgot Password page
 */
export default function ForgotPasswordPage({ params }: ForgotPasswordPageProps): React.ReactElement {
  const router = useRouter()

  /**
   * Handle successful password reset request
   */
  const handleSuccess = (): void => {
    console.info('Password reset email sent')
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
        <ForgotPasswordForm onSuccess={handleSuccess} onLoginClick={handleLoginClick} />
      </div>
    </main>
  )
}
