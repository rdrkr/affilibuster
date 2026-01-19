// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import NextImage from 'next/image'
import Link from 'next/link'

const Profile = () => {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-12 text-center">
        <div className="group relative mb-4 inline-block">
          <div
            className={`
            relative size-32 overflow-hidden rounded-full border-4
            border-neutral-200 shadow-xl dark:border-surface-dark
          `}
          >
            <NextImage
              src="/images/profile-avatar-placeholder.webp"
              alt="Profile"
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <Link
            href="/profile/edit"
            className={`
              absolute right-0 bottom-0 rounded-full bg-primary p-2
              text-background-dark shadow-lg transition-transform
              hover:scale-110
            `}
          >
            <span className="material-symbols-outlined block text-lg">edit</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">Alex Green</h1>
        <p className="mt-1 text-neutral-600 dark:text-text-secondary-dark">alex.green@example.com</p>
      </div>

      <div className="space-y-8">
        <div
          className={`
          overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md
          dark:border-white/5 dark:bg-surface-dark dark:shadow-none
        `}
        >
          <h2
            className={`
            px-6 pt-6 pb-2 text-sm font-bold tracking-wider
            text-neutral-600 uppercase dark:text-text-secondary-dark
          `}
          >
            Account Settings
          </h2>
          <div className="divide-y divide-neutral-200 dark:divide-white/5">
            <Link
              href="/profile/edit"
              className={`
                flex items-center justify-between p-6 transition-colors
                hover:bg-neutral-100 dark:hover:bg-white/5
              `}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`
                  material-symbols-outlined text-neutral-500 dark:text-text-secondary-dark
                `}
                >
                  person
                </span>
                <span className="font-semibold text-neutral-800 dark:text-white">Edit Profile</span>
              </div>
              <span
                className={`
                material-symbols-outlined text-neutral-400 dark:text-text-secondary-dark
              `}
              >
                chevron_right
              </span>
            </Link>
            <Link
              href="/profile/currency"
              className={`
                flex items-center justify-between p-6 transition-colors
                hover:bg-neutral-100 dark:hover:bg-white/5
              `}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`
                  material-symbols-outlined text-neutral-500 dark:text-text-secondary-dark
                `}
                >
                  payments
                </span>
                <span className="font-semibold text-neutral-800 dark:text-white">Currency</span>
              </div>
              <span
                className={`
                material-symbols-outlined text-neutral-400 dark:text-text-secondary-dark
              `}
              >
                chevron_right
              </span>
            </Link>
            <Link
              href="/profile/wishlist"
              className={`
                flex items-center justify-between p-6 transition-colors
                hover:bg-neutral-100 dark:hover:bg-white/5
              `}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`
                  material-symbols-outlined text-neutral-500 dark:text-text-secondary-dark
                `}
                >
                  favorite
                </span>
                <span className="font-semibold text-neutral-800 dark:text-white">Wishlist</span>
              </div>
              <span
                className={`
                material-symbols-outlined text-neutral-400 dark:text-text-secondary-dark
              `}
              >
                chevron_right
              </span>
            </Link>
          </div>
        </div>

        <div
          className={`
          overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md
          dark:border-white/5 dark:bg-surface-dark dark:shadow-none
        `}
        >
          <div className="divide-y divide-neutral-200 dark:divide-white/5">
            <button
              className={`
                group flex w-full items-center justify-between p-6
                transition-colors
                hover:bg-red-500/10
              `}
            >
              <div
                className={`
                flex items-center gap-4 text-red-400
                group-hover:text-red-500
              `}
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="font-semibold">Log Out</span>
              </div>
            </button>
            <Link
              href="/profile/delete"
              className={`
                group flex w-full items-center justify-between p-6
                transition-colors
                hover:bg-red-500/10
              `}
            >
              <div
                className={`
                flex items-center gap-4 text-neutral-500
                group-hover:text-red-400 dark:text-text-secondary-dark
              `}
              >
                <span className="material-symbols-outlined">delete</span>
                <span className="font-semibold">Delete Account</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
