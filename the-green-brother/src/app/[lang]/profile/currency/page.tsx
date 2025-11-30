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
          rounded-full bg-surface-dark p-2 transition-colors
          hover:bg-white/10
        `}
        >
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </Link>
        <h1 className="text-3xl font-bold text-white">Select Currency</h1>
      </div>

      <div
        className={`
        rounded-xl border border-white/5 bg-surface-dark p-4
        md:p-8
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
                    ? 'border-primary bg-background-dark ring-1 ring-primary'
                    : `
                    border-white/5 bg-background-dark
                    hover:border-white/20
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
                  className="rounded object-cover shadow-sm"
                />
                <div>
                  <p className="font-bold text-white">{curr.code}</p>
                  <p className="text-sm text-text-secondary-dark">{curr.name}</p>
                </div>
              </div>
              <div
                className={`
                  flex h-5 w-5 items-center justify-center rounded-full border-2
                  ${
                    selected === curr.code
                      ? `border-primary`
                      : `
                    border-text-secondary-dark
                  `
                  }
                `}
              >
                {selected === curr.code && (
                  <div
                    className={`
                  h-2.5 w-2.5 rounded-full bg-primary
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
