// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * Login page client component.
 * Handles client-side logic for the login page.
 */

import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth'
import type { User } from '@/lib/auth'

/**
 * Login page client props
 */
interface LoginPageClientProps {
  /**
   * Language code for navigation
   */
  lang: string
}

/**
 * Login page client component
 *
 * @param props - Component props
 * @returns Login page client component
 */
export function LoginPageClient({ lang }: LoginPageClientProps): React.ReactElement {
  const router = useRouter()

  /**
   * Handle successful login
   */
  const handleSuccess = (user: User): void => {
    // Redirect to homepage after successful login
    router.push(`/${lang}`)
    // Log success for debugging
    console.info(`User ${user.email} logged in successfully`)
  }

  /**
   * Handle register link click
   */
  const handleRegisterClick = (): void => {
    router.push(`/${lang}/register`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
      <div className="w-full max-w-md">
        <LoginForm onSuccess={handleSuccess} onRegisterClick={handleRegisterClick} />
      </div>
    </main>
  )
}
