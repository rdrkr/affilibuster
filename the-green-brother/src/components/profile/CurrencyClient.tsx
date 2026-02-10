// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * CurrencyClient Component
 *
 * Client component for the Currency selection page.
 * Renders list of currencies fetched from CMS.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  type ApiProfileProfileDocument,
  type CurrencyGetCurrenciesResponses,
  DirectionEnum,
} from '@/lib/generated/types.gen'

// Infer Currency type from response
type Currency = CurrencyGetCurrenciesResponses[200]['data'][number]

interface CurrencyClientProps {
  profileData: ApiProfileProfileDocument
  currencies: Currency[]
  lang: string
  direction: DirectionEnum
}

/**
 * Currency Client component
 * @param root0 - Component props
 * @param root0.profileData - Profile data from CMS
 * @param root0.currencies - List of available currencies
 * @param root0.lang - Current language code
 * @param root0.direction - Text direction
 * @returns React component
 */
export default function CurrencyClient({ profileData, currencies, lang, direction }: CurrencyClientProps) {
  const router = useRouter()
  // Default to first currency or 'USD' if available
  // Ideally this comes from user preferences
  const [selected, setSelected] = useState(currencies[0]?.code ?? 'USD')

  const { currencyHeader } = profileData

  const handleSave = () => {
    // In a real app, we would save the preference here
    router.push(`/${lang}/profile`)
  }

  const isRtl = direction === DirectionEnum.RTL

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`/${lang}/profile`}
          className={`
          rounded-full bg-neutral-100 p-2 transition-colors
          hover:bg-neutral-200 dark:bg-surface-dark dark:hover:bg-white/10
        `}
        >
          <span className={`material-symbols-outlined text-neutral-800 dark:text-white ${isRtl ? 'rotate-180' : ''}`}>
            arrow_back
          </span>
        </Link>
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
          {currencyHeader.header?.text ?? 'Select Currency'}
        </h1>
      </div>

      <div
        className={`
        rounded-xl border border-neutral-200 bg-white p-4 shadow-md
        md:p-8 dark:border-white/5 dark:bg-surface-dark dark:shadow-none
      `}
      >
        <div className="space-y-4">
          {currencies.map(curr => (
            <label
              key={curr.code} // Assuming code is unique
              className={`
                flex cursor-pointer items-center justify-between rounded-xl
                border p-4 transition-all
                ${
                  selected === curr.code
                    ? 'border-primary bg-primary-50 ring-1 ring-primary dark:bg-background-dark'
                    : `
                    border-neutral-200 bg-neutral-50
                    hover:border-neutral-300
                    dark:border-white/5 dark:bg-background-dark
                    dark:hover:border-white/20
                  `
                }
              `}
              onClick={() => {
                setSelected(curr.code)
              }} // Assuming code exists
            >
              <div className="flex items-center gap-4">
                {/* Flag rendering omitted as we don't know if CMS provides it yet.
                     If code is available, we could map to local flags if needed,
                     but for now just text is safer to avoid broken images.
                  */}
                <div>
                  <p className="font-bold text-neutral-800 dark:text-white">{curr.code}</p>
                  <p className="text-sm text-neutral-600 dark:text-text-secondary-dark">{curr.name}</p>
                </div>
              </div>
              <div
                className={`
                  flex size-5 items-center justify-center rounded-full border-2
                  ${selected === curr.code ? 'border-primary' : 'border-neutral-400 dark:border-text-secondary-dark'}
                `}
              >
                {selected === curr.code && <div className="size-2.5 rounded-full bg-primary" />}
              </div>
            </label>
          ))}
        </div>
        <button
          onClick={handleSave}
          className={`
            mt-8 w-full rounded-xl bg-primary py-3.5 font-bold
            text-background-dark shadow-lg shadow-primary/20 transition-colors
            hover:bg-primary-hover
          `}
        >
          {
            /* Could use 'saveButton' from profileData if available, but it's not passed explicitly in current destructuring. */
            'Save Changes'
          }
        </button>
      </div>
    </div>
  )
}
