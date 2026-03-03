// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * ProfileClient Component
 *
 * Client component for the Profile dashboard.
 * Renders profile menu/dashboard using CMS data for labels.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { exportUserData, getUserProfile } from '@/lib/auth/api'
import { openCookieSettings } from '@/lib/consent'
import {
  type ApiProfileProfileDocument,
  DirectionEnum,
  type ElementsHeaderEntry,
  type UserProfile,
} from '@/lib/generated/types.gen'
import { unsubscribeNewsletter } from '@/lib/newsletter'

import ButtonLink from '@/components/elements/ButtonLink'
import Header from '@/components/elements/Header'

interface ProfileClientProps {
  data: ApiProfileProfileDocument
  lang: string
  direction: DirectionEnum
}

/**
 * Profile Client component
 * @param root0 - Component props
 * @param root0.data - Profile data from CMS
 * @param root0.lang - Current language code
 * @param root0.direction - Text direction
 * @returns React component
 */
export default function ProfileClient({ data, lang, direction }: ProfileClientProps) {
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [isUnsubscribing, setIsUnsubscribing] = useState(false)
  const [unsubscribeStatus, setUnsubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    /**
     * Fetches the authenticated user's profile on mount.
     * Redirects to login if profile cannot be loaded (unauthenticated).
     */
    async function loadProfile(): Promise<void> {
      const profile = await getUserProfile()
      if (!profile) {
        router.push(`/${lang}/login`)
        return
      }
      setUserProfile(profile)
      setIsLoadingProfile(false)
    }
    void loadProfile()
  }, [lang, router])

  const {
    pageHeader,
    accountSettingsHeader,
    editProfileButton,
    wishlistHeader,
    currencyHeader,
    cookieSettingsHeader,
    exportDataHeader,
    newsletterUnsubscribeHeader,
    deleteAccountHeader,
    logoutButton,
  } = data

  // Helper to get text from header component
  const getHeaderText = (headerEntry: ElementsHeaderEntry | undefined) => headerEntry?.header?.text ?? ''

  /**
   * Handle export user data button click.
   * Fetches user data via GDPR DSAR endpoint and triggers a JSON file download.
   */
  const handleExportData = async (): Promise<void> => {
    setIsExporting(true)

    const exportData = await exportUserData()

    if (exportData) {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'my-data-export.json'
      link.click()
      URL.revokeObjectURL(url)
    }

    setIsExporting(false)
  }

  /**
   * Handle newsletter unsubscribe button click.
   * Calls the unsubscribe API with the user's email.
   * Shows success or error feedback inline (GDPR Art. 12(1) transparency).
   */
  const handleUnsubscribe = async (): Promise<void> => {
    if (!userProfile) return
    setIsUnsubscribing(true)
    setUnsubscribeStatus('idle')
    const result = await unsubscribeNewsletter(userProfile.email)
    setIsUnsubscribing(false)
    setUnsubscribeStatus(result?.success ? 'success' : 'error')
  }

  const handleLogout = () => {
    // Implement logout
    router.push(`/${lang}/login`)
  }

  const isRtl = direction === DirectionEnum.RTL

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center py-12" data-testid="profile-loading">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!userProfile) {
    return null
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-2xl px-4">
        {/* Page Header */}
        <Header
          data={pageHeader}
          direction={direction}
          level={1}
          className="mb-8 text-center"
          headerClassName="text-3xl font-bold text-neutral-800 dark:text-white"
          subheaderClassName="text-neutral-600 dark:text-text-secondary-dark"
        />

        <div
          className={`
          overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl
          dark:border-white/5 dark:bg-surface-dark
        `}
        >
          {/* User Info Section */}
          <div className="border-b border-neutral-100 bg-neutral-50 p-6 dark:border-white/5 dark:bg-white/5">
            <div className="flex items-center gap-4">
              <div
                className={`
                  flex size-16 items-center justify-center rounded-full
                  bg-primary text-2xl font-bold text-white shadow-lg shadow-primary/20
                `}
              >
                {userProfile.display_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">{userProfile.display_name}</h2>
                <p className="text-sm text-neutral-500 dark:text-text-secondary-dark">{userProfile.email}</p>
              </div>
              {/* Edit Profile Button */}
              {editProfileButton.label && (
                <ButtonLink
                  data={editProfileButton}
                  direction={direction}
                  variant="outline"
                  size="sm"
                  className="ml-auto" // Tailwind 'ms-auto' is better for logical properties but keeping simple for now
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </ButtonLink>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Account Settings Header */}
            <Header
              data={accountSettingsHeader}
              direction={direction}
              level={2}
              className="mb-4"
              headerClassName="text-lg font-bold text-neutral-800 dark:text-white"
            />

            <div className="space-y-2">
              {/* Wishlist Link */}
              <Link
                href={`/${lang}/profile/wishlist`}
                className={`
                    flex items-center gap-3 rounded-xl p-3
                    transition-colors hover:bg-neutral-50 dark:hover:bg-white/5
                  `}
              >
                <div
                  className={`
                    flex size-10 items-center justify-center rounded-lg
                    bg-secondary-100 text-secondary-600
                    dark:bg-secondary-900/30 dark:text-secondary-400
                  `}
                >
                  <span className="material-symbols-outlined">favorite</span>
                </div>
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  {getHeaderText(wishlistHeader)}
                </span>
                <span
                  className={`material-symbols-outlined text-neutral-400 ${isRtl ? 'mr-auto rotate-180' : 'ml-auto'}`}
                >
                  chevron_right
                </span>
              </Link>

              {/* Currency Link */}
              <Link
                href={`/${lang}/profile/currency`}
                className={`
                    flex items-center gap-3 rounded-xl p-3
                    transition-colors hover:bg-neutral-50 dark:hover:bg-white/5
                  `}
              >
                <div
                  className={`
                    flex size-10 items-center justify-center rounded-lg
                    bg-success-100 text-success-600
                    dark:bg-success-900/30 dark:text-success-400
                  `}
                >
                  <span className="material-symbols-outlined">attach_money</span>
                </div>
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  {getHeaderText(currencyHeader)}
                </span>
                <span
                  className={`material-symbols-outlined text-neutral-400 ${isRtl ? 'mr-auto rotate-180' : 'ml-auto'}`}
                >
                  chevron_right
                </span>
              </Link>

              {/* Export My Data Button (GDPR DSAR) */}
              <button
                onClick={() => void handleExportData()}
                disabled={isExporting}
                className={`
                    flex w-full items-center gap-3 rounded-xl p-3
                    transition-colors hover:bg-neutral-50
                    disabled:cursor-not-allowed disabled:opacity-50
                    dark:hover:bg-white/5
                  `}
              >
                <div
                  className={`
                    flex size-10 items-center justify-center rounded-lg
                    bg-primary-100 text-accent
                    dark:bg-primary-900/30
                  `}
                >
                  <span className="material-symbols-outlined">download</span>
                </div>
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  {getHeaderText(exportDataHeader)}
                </span>
                <span
                  className={`material-symbols-outlined text-neutral-400 ${isRtl ? 'mr-auto rotate-180' : 'ml-auto'}`}
                >
                  chevron_right
                </span>
              </button>

              {/* Cookie Settings Button */}
              <button
                onClick={openCookieSettings}
                className={`
                    flex w-full items-center gap-3 rounded-xl p-3
                    transition-colors hover:bg-neutral-50
                    dark:hover:bg-white/5
                  `}
              >
                <div
                  className={`
                    flex size-10 items-center justify-center rounded-lg
                    bg-tertiary-100 text-tertiary-600
                    dark:bg-tertiary-900/30 dark:text-tertiary-400
                  `}
                >
                  <span className="material-symbols-outlined">cookie</span>
                </div>
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  {getHeaderText(cookieSettingsHeader)}
                </span>
                <span
                  className={`material-symbols-outlined text-neutral-400 ${isRtl ? 'mr-auto rotate-180' : 'ml-auto'}`}
                >
                  chevron_right
                </span>
              </button>

              {/* Newsletter Unsubscribe Button */}
              <button
                onClick={() => void handleUnsubscribe()}
                disabled={isUnsubscribing}
                className={`
                    flex w-full items-center gap-3 rounded-xl p-3
                    transition-colors hover:bg-warning-50
                    disabled:cursor-not-allowed disabled:opacity-50
                    dark:hover:bg-warning-900/10
                  `}
              >
                <div
                  className={`
                    flex size-10 items-center justify-center rounded-lg
                    bg-warning-100 text-warning-600
                    dark:bg-warning-900/30 dark:text-warning-400
                  `}
                >
                  <span className="material-symbols-outlined">unsubscribe</span>
                </div>
                <span className="font-medium text-warning-600 dark:text-warning-400">
                  {getHeaderText(newsletterUnsubscribeHeader)}
                </span>
                <span
                  className={`material-symbols-outlined text-warning-400 ${isRtl ? 'mr-auto rotate-180' : 'ml-auto'}`}
                >
                  chevron_right
                </span>
              </button>
              {unsubscribeStatus === 'success' && newsletterUnsubscribeHeader.subheader?.text && (
                <div
                  className={`px-3 py-1 text-xs text-success-600 dark:text-success-400 ${isRtl ? 'text-right' : 'text-left'}`}
                  data-testid="unsubscribe-success"
                  role="status"
                >
                  {newsletterUnsubscribeHeader.subheader.text}
                </div>
              )}
              {unsubscribeStatus === 'error' &&
                (() => {
                  // CMS reuses ariaDescription for inline error text in this context
                  const unsubscribeErrorText = newsletterUnsubscribeHeader.subheader?.ariaDescription ?? ''
                  return unsubscribeErrorText ? (
                    <div
                      className={`px-3 py-1 text-xs text-error-600 dark:text-error-400 ${isRtl ? 'text-right' : 'text-left'}`}
                      data-testid="unsubscribe-error"
                      role="alert"
                    >
                      {unsubscribeErrorText}
                    </div>
                  ) : null
                })()}

              {/* Delete Account Link */}
              <Link
                href={`/${lang}/profile/delete`}
                className={`
                    flex items-center gap-3 rounded-xl p-3
                    transition-colors hover:bg-error-50 dark:hover:bg-error-900/10
                  `}
              >
                <div
                  className={`
                    flex size-10 items-center justify-center rounded-lg
                    bg-error-100 text-error-600
                    dark:bg-error-900/30 dark:text-error-400
                  `}
                >
                  <span className="material-symbols-outlined">delete</span>
                </div>
                <span className="font-medium text-error-600 dark:text-error-400">
                  {getHeaderText(deleteAccountHeader)}
                </span>
                <span
                  className={`material-symbols-outlined text-error-400 ${isRtl ? 'mr-auto rotate-180' : 'ml-auto'}`}
                >
                  chevron_right
                </span>
              </Link>
            </div>

            <div className="mt-8 border-t border-neutral-100 pt-6 dark:border-white/5">
              <button
                onClick={handleLogout}
                className={`
                    flex w-full items-center justify-center gap-2 rounded-xl
                    bg-neutral-100 py-3 font-medium text-neutral-600
                    transition-colors hover:bg-neutral-200
                    dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10
                  `}
              >
                <span className="material-symbols-outlined">logout</span>
                {logoutButton.label?.text}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
