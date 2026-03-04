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
        rounded-xl border border-border bg-card p-8 shadow-md
        md:p-12 dark:shadow-none
      `}
      >
        <div
          className={`
          mx-auto mb-6 flex size-20 items-center justify-center rounded-full
          bg-error/10
        `}
        >
          <span className="material-symbols-outlined text-4xl text-error">warning</span>
        </div>

        <Header
          data={deleteAccountHeader}
          direction={direction}
          level={1}
          className="mb-4"
          headerClassName="text-3xl font-bold text-foreground"
        />

        <form onSubmit={e => void handleDelete(e)} className="space-y-6 text-left">
          <div>
            <label
              className={`
              mb-2 block text-sm font-medium text-muted-foreground
            `}
            >
              Enter your password to confirm
            </label>
            <div className="relative">
              <span
                className={`
                  material-symbols-outlined absolute top-1/2
                   -translate-y-1/2 text-muted-foreground
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
                  w-full rounded-xl border border-border bg-muted
                  py-3 text-foreground outline-none
                  focus:border-transparent focus:ring-2 focus:ring-error
                  dark:border-white/10 dark:bg-background-dark dark:text-foreground
                  ${isRtl ? 'pr-12 pl-4' : 'pr-4 pl-12'}
                `}
                placeholder="Password"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full rounded-xl bg-error py-3.5 font-bold text-foreground-reversed
                shadow-lg shadow-error/20 transition-colors
                hover:bg-error/90
                disabled:cursor-not-allowed disabled:opacity-70
              `}
            >
              {isLoading ? 'Deleting...' : (confirmButton.label?.text ?? 'Confirm Delete')}
            </button>
            <Link
              href={`/${lang}/profile`}
              className={`
                w-full rounded-xl border border-border bg-transparent py-3.5
                text-center font-bold text-muted-foreground transition-colors
                hover:bg-muted dark:border-white/10 dark:text-foreground
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
