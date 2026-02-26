// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * DeleteAccountClient Component
 *
 * Client component for the Delete Account page.
 * Renders confirmation form with CMS labels.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { deleteAccount } from '@/lib/auth/api'
import { type ApiProfileProfileDocument, DirectionEnum } from '@/lib/generated/types.gen'

import Header from '@/components/elements/Header'

interface DeleteAccountClientProps {
  data: ApiProfileProfileDocument
  lang: string
  direction: DirectionEnum
}

/**
 * Delete Account Client component
 * @param root0 - Component props
 * @param root0.data - Profile data from CMS
 * @param root0.lang - Current language code
 * @param root0.direction - Text direction
 * @returns React component
 */
export default function DeleteAccountClient({ data, lang, direction }: DeleteAccountClientProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { deleteAccountHeader, confirmButton, cancelButton } = data

  const isRtl = direction === DirectionEnum.RTL

  /**
   * Handle form submission for account deletion.
   * Calls the deleteAccount API with password verification.
   * @param e - The form submit event.
   */
  const handleDelete = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>): Promise<void> => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Cast to unknown then explicit type to avoid lint errors with generated types
    const result = (await deleteAccount({ password })) as unknown as {
      success: boolean
      message: string
    } | null

    if (result?.success) {
      router.push('/')
    } else {
      setError('Failed to delete account. Please check your password and try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      <div
        className={`
        rounded-xl border border-neutral-200 bg-white p-8 shadow-md
        md:p-12 dark:border-white/5 dark:bg-surface-dark dark:shadow-none
      `}
      >
        <div
          className={`
          mx-auto mb-6 flex size-20 items-center justify-center rounded-full
          bg-red-500/10
        `}
        >
          <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
        </div>

        <Header
          data={deleteAccountHeader}
          direction={direction}
          level={1}
          className="mb-4"
          headerClassName="text-3xl font-bold text-neutral-800 dark:text-white"
        />

        <form onSubmit={e => void handleDelete(e)} className="space-y-6 text-left">
          <div>
            <label
              className={`
              mb-2 block text-sm font-medium text-neutral-600 dark:text-text-secondary-dark
            `}
            >
              Enter your password to confirm
            </label>
            <div className="relative">
              <span
                className={`
                  material-symbols-outlined absolute top-1/2
                  -translate-y-1/2 text-neutral-400 dark:text-text-secondary-dark
                  ${isRtl ? 'right-4' : 'left-4'}
                `}
              >
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                }}
                className={`
                  w-full rounded-xl border border-neutral-200 bg-neutral-50
                  py-3 text-neutral-800 outline-none
                  focus:border-transparent focus:ring-2 focus:ring-red-500
                  dark:border-white/10 dark:bg-background-dark dark:text-white
                  ${isRtl ? 'pr-12 pl-4' : 'pr-4 pl-12'}
                `}
                placeholder="Password"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full rounded-xl bg-red-500 py-3.5 font-bold text-white
                shadow-lg shadow-red-500/20 transition-colors
                hover:bg-red-600
                disabled:cursor-not-allowed disabled:opacity-70
              `}
            >
              {isLoading ? 'Deleting...' : (confirmButton.label?.text ?? 'Confirm Delete')}
            </button>
            <Link
              href={`/${lang}/profile`}
              className={`
                w-full rounded-xl border border-neutral-200 bg-transparent py-3.5
                text-center font-bold text-neutral-600 transition-colors
                hover:bg-neutral-100 dark:border-white/10 dark:text-white
                dark:hover:bg-white/5
              `}
            >
              {cancelButton.label?.text ?? 'Cancel'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
