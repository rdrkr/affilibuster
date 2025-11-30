// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Link from 'next/link'

const DeleteAccount = () => {
  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      <div
        className={`
        rounded-xl border border-white/5 bg-surface-dark p-8
        md:p-12
      `}
      >
        <div
          className={`
          mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full
          bg-red-500/10
        `}
        >
          <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-white">Are you sure?</h1>
        <p className="mb-8 text-text-secondary-dark">
          This action is irreversible. All your data, affiliations, and settings will be permanently deleted.
        </p>

        <form className="space-y-6 text-left">
          <div>
            <label
              className={`
              mb-2 block text-sm font-medium text-text-secondary-dark
            `}
            >
              Enter your password to confirm
            </label>
            <div className="relative">
              <span
                className={`
                  material-symbols-outlined absolute top-1/2 left-4
                  -translate-y-1/2 text-text-secondary-dark
                `}
              >
                lock
              </span>
              <input
                type="password"
                className={`
                  w-full rounded-xl border border-white/10 bg-background-dark
                  py-3 pr-4 pl-12 text-white outline-none
                  focus:border-transparent focus:ring-2 focus:ring-red-500
                `}
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              className={`
                w-full rounded-xl bg-red-500 py-3.5 font-bold text-white
                shadow-lg shadow-red-500/20 transition-colors
                hover:bg-red-600
              `}
            >
              Confirm Delete
            </button>
            <Link
              href="/profile"
              className={`
                w-full rounded-xl border border-white/10 bg-transparent py-3.5
                text-center font-bold text-white transition-colors
                hover:bg-white/5
              `}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeleteAccount
