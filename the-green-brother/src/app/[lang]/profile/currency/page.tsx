// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const Currency = () => {
  const [selected, setSelected] = useState('USD')

  const currencies = [
    {
      code: 'USD',
      name: 'United States Dollar',
      flag: '/images/flag-usd.webp',
    },
    {
      code: 'EUR',
      name: 'Euro',
      flag: '/images/flag-eur.webp',
    },
    {
      code: 'GBP',
      name: 'British Pound',
      flag: '/images/flag-gbp.webp',
    },
    {
      code: 'CAD',
      name: 'Canadian Dollar',
      flag: '/images/flag-cad.webp',
    },
    {
      code: 'AUD',
      name: 'Australian Dollar',
      flag: '/images/flag-aud.webp',
    },
  ]

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/profile"
          className={`
          rounded-full bg-neutral-100 p-2 transition-colors
          hover:bg-neutral-200 dark:bg-surface-dark dark:hover:bg-white/10
        `}
        >
          <span className="material-symbols-outlined text-neutral-800 dark:text-white">arrow_back</span>
        </Link>
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">Select Currency</h1>
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
              key={curr.code}
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
              }}
            >
              <div className="flex items-center gap-4">
                <Image
                  src={curr.flag}
                  alt={curr.name}
                  width={40}
                  height={28}
                  className="rounded-sm object-cover shadow-sm"
                />
                <div>
                  <p className="font-bold text-neutral-800 dark:text-white">{curr.code}</p>
                  <p className="text-sm text-neutral-600 dark:text-text-secondary-dark">{curr.name}</p>
                </div>
              </div>
              <div
                className={`
                  flex size-5 items-center justify-center rounded-full border-2
                  ${
                    selected === curr.code
                      ? `border-primary`
                      : `
                    border-neutral-400 dark:border-text-secondary-dark
                  `
                  }
                `}
              >
                {selected === curr.code && (
                  <div
                    className={`
                  size-2.5 rounded-full bg-primary
                `}
                  />
                )}
              </div>
            </label>
          ))}
        </div>
        <button
          className={`
            mt-8 w-full rounded-xl bg-primary py-3.5 font-bold
            text-background-dark shadow-lg shadow-primary/20 transition-colors
            hover:bg-primary-hover
          `}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default Currency
