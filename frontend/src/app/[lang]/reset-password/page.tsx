// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * Reset Password page component.
 * Displays the form to reset password with a token.
 */

import { useRouter, useSearchParams } from 'next/navigation'
import { ResetPasswordForm } from '@/components/auth'
import { Card } from '@/components/Card'

/**
 * Reset Password page props
 */
interface ResetPasswordPageProps {
  params: Promise<{
    lang: string
  }>
}

/**
 * Reset Password page component
 *
 * @param props - Page props with language parameter
 * @returns Reset Password page
 */
export default function ResetPasswordPage({ params }: ResetPasswordPageProps): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  /**
   * Handle successful password reset
   */
  const handleSuccess = (): void => {
    console.info('Password reset successfully')
  }

  /**
   * Handle login link click
   */
  const handleLoginClick = (): void => {
    void params.then(({ lang }) => {
      router.push(`/${lang}/login`)
    })
  }

  // Show error if no token provided
  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
        <div className="w-full max-w-md">
          <Card variant="info">
            <div className="text-center" data-testid="missing-token-error">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">Invalid Reset Link</h2>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                The password reset link is missing or invalid. Please request a new password reset.
              </p>
              <button
                onClick={() => {
                  void params.then(({ lang }) => {
                    router.push(`/${lang}/forgot-password`)
                  })
                }}
                className="text-tertiary-600 dark:text-tertiary-400 hover:underline font-semibold"
                data-testid="request-new-reset"
              >
                Request New Reset Link
              </button>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
      <div className="w-full max-w-md">
        <ResetPasswordForm token={token} onSuccess={handleSuccess} onLoginClick={handleLoginClick} />
      </div>
    </main>
  )
}
