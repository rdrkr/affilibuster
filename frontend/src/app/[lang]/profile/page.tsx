// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * Profile page component.
 * Displays user profile information and settings.
 * Requires authentication.
 */

import { ProfileForm } from '@/components/auth'
import { Card } from '@/components/Card'
import { useAuth, type User } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Profile page props
 */
interface ProfilePageProps {
  params: Promise<{
    lang: string
  }>
}

interface UserProfile extends User {
  display_name?: string
  email_verified?: boolean
  created_at?: string
}

/**
 * Profile page component
 *
 * @param props - Page props with language parameter
 * @returns Profile page
 */
export default function ProfilePage({ params }: ProfilePageProps): React.ReactElement {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      void params.then(({ lang }) => {
        router.push(`/${lang}/login`)
      })
    }
  }, [user, isLoading, router, params])

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
        <div className="w-full max-w-md">
          <Card variant="info">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
              <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          </Card>
        </div>
      </main>
    )
  }

  // Show auth required message if not logged in
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
        <div className="w-full max-w-md">
          <Card variant="info">
            <div className="text-center" data-testid="auth-required-message">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
                Authentication Required
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300">Please log in to view your profile.</p>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  /**
   * Handle successful profile update
   */
  const handleSuccess = (): void => {
    console.info('Profile updated successfully')
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-8">My Profile</h1>

        {/* Profile Information */}
        <div className="mb-8">
          <Card variant="info">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Name</label>
                <p className="text-lg text-neutral-800 dark:text-neutral-100" data-testid="profile-name">
                  {user.displayName || (user as UserProfile).display_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Email</label>
                <p className="text-lg text-neutral-800 dark:text-neutral-100" data-testid="profile-email">
                  {user.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Email Status</label>
                <p
                  className={`text-lg ${user.emailVerified || (user as UserProfile).email_verified ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-400'}`}
                  data-testid="profile-email-status"
                >
                  {user.emailVerified || (user as UserProfile).email_verified ? 'Verified' : 'Unverified'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Member Since</label>
                <p className="text-lg text-neutral-800 dark:text-neutral-100" data-testid="profile-registration-date">
                  {(user as Partial<User>).createdAt || (user as UserProfile).created_at
                    ? new Date(
                        (user as Partial<User>).createdAt ?? (user as UserProfile).created_at ?? ''
                      ).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Edit Form */}
        <ProfileForm onSuccess={handleSuccess} />
      </div>
    </main>
  )
}
