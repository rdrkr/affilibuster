// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Link from 'next/link'

const DeleteAccount = () => {
  return (
    <div className="py-8 max-w-lg mx-auto text-center">
      <div className="bg-surface-dark rounded-2xl border border-white/5 p-8 md:p-12">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Are you sure?</h1>
        <p className="text-text-secondary-dark mb-8">
          This action is irreversible. All your data, affiliations, and settings will be permanently deleted.
        </p>

        <form className="text-left space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary-dark mb-2">
              Enter your password to confirm
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-dark">
                lock
              </span>
              <input
                type="password"
                className="w-full bg-background-dark border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button className="w-full bg-red-500 text-white font-bold py-3.5 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
              Confirm Delete
            </button>
            <Link
              href="/profile"
              className="w-full bg-transparent border border-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/5 transition-colors text-center"
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
