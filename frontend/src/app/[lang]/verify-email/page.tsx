// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * Verify Email page component.
 * Handles email verification with token from email link.
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { verifyEmail } from '@/lib/auth/api'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'

/**
 * Verify Email page props
 */
interface VerifyEmailPageProps {
  params: Promise<{
    lang: string
  }>
}

/**
 * Verify Email page component
 *
 * @param props - Page props with language parameter
 * @returns Verify Email page
 */
export default function VerifyEmailPage({ params }: VerifyEmailPageProps): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lang, setLang] = useState('en')

  // Get language from params
  useEffect(() => {
    void params.then(({ lang: l }) => {
      setLang(l)
    })
  }, [params])

  // Verify email on mount
  useEffect(() => {
    if (!token) {
      setIsVerifying(false)
      setError('No verification token provided')
      return
    }

    const verify = async (): Promise<void> => {
      try {
        await verifyEmail(token)
        setIsSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify email')
      } finally {
        setIsVerifying(false)
      }
    }

    void verify()
  }, [token])

  // Show loading state
  if (isVerifying) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
        <div className="w-full max-w-md">
          <Card variant="info">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-300">Verifying your email...</p>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  // Show success state
  if (isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
        <div className="w-full max-w-md">
          <Card variant="info">
            <div className="text-center" data-testid="email-verified-success" role="status">
              <svg
                className="w-16 h-16 text-success-600 dark:text-success-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">Email Verified!</h2>
              <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                Your email has been successfully verified. You now have full access to all features.
              </p>
              <Link href={`/${lang}`} data-testid="continue-after-verification">
                <Button variant="primary" fullWidth>
                  Continue to Homepage
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  // Show error state
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
      <div className="w-full max-w-md">
        <Card variant="info">
          <div className="text-center" data-testid="verification-error">
            <svg
              className="w-16 h-16 text-error-600 dark:text-error-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">Verification Failed</h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              {error ?? 'The verification link is invalid or has expired.'}
            </p>
            <button
              onClick={() => {
                router.push(`/${lang}/resend-verification`)
              }}
              className="text-tertiary-600 dark:text-tertiary-400 hover:underline font-semibold"
              data-testid="request-new-verification"
            >
              Request New Verification Email
            </button>
          </div>
        </Card>
      </div>
    </main>
  )
}
