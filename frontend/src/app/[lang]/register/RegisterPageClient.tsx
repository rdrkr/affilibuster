// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * Register page client component.
 * Handles client-side logic for the registration page.
 */

import { useRouter } from 'next/navigation'
import { RegisterForm } from '@/components/auth'
import type { User } from '@/lib/auth'

/**
 * Register page client props
 */
interface RegisterPageClientProps {
  /**
   * Language code for navigation
   */
  lang: string
}

/**
 * Register page client component
 *
 * @param props - Component props
 * @returns Register page client component
 */
export function RegisterPageClient({ lang }: RegisterPageClientProps): React.ReactElement {
  const router = useRouter()

  /**
   * Handle successful registration
   */
  const handleSuccess = (user: User): void => {
    // Redirect to homepage after successful registration
    router.push(`/${lang}`)
    // Log success for debugging
    console.info(`User ${user.email} registered successfully`)
  }

  /**
   * Handle login link click
   */
  const handleLoginClick = (): void => {
    router.push(`/${lang}/login`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
      <div className="w-full max-w-md">
        <RegisterForm onSuccess={handleSuccess} onLoginClick={handleLoginClick} />
      </div>
    </main>
  )
}
