// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'

const Profile = () => {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-12 text-center">
        <div className="group relative mb-4 inline-block">
          <div
            className={`
            relative h-32 w-32 overflow-hidden rounded-full border-4
            border-surface-dark shadow-xl
          `}
          >
            <Image
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
        <h1 className="text-3xl font-bold text-white">Alex Green</h1>
        <p className="mt-1 text-text-secondary-dark">alex.green@example.com</p>
      </div>

      <div className="space-y-8">
        <div
          className={`
          overflow-hidden rounded-xl border border-white/5 bg-surface-dark
        `}
        >
          <h2
            className={`
            px-6 pt-6 pb-2 text-sm font-bold tracking-wider
            text-text-secondary-dark uppercase
          `}
          >
            Account Settings
          </h2>
          <div className="divide-y divide-white/5">
            <Link
              href="/profile/edit"
              className={`
                flex items-center justify-between p-6 transition-colors
                hover:bg-white/5
              `}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`
                  material-symbols-outlined text-text-secondary-dark
                `}
                >
                  person
                </span>
                <span className="font-semibold text-white">Edit Profile</span>
              </div>
              <span
                className={`
                material-symbols-outlined text-text-secondary-dark
              `}
              >
                chevron_right
              </span>
            </Link>
            <Link
              href="/profile/currency"
              className={`
                flex items-center justify-between p-6 transition-colors
                hover:bg-white/5
              `}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`
                  material-symbols-outlined text-text-secondary-dark
                `}
                >
                  payments
                </span>
                <span className="font-semibold text-white">Currency</span>
              </div>
              <span
                className={`
                material-symbols-outlined text-text-secondary-dark
              `}
              >
                chevron_right
              </span>
            </Link>
            <Link
              href="/profile/wishlist"
              className={`
                flex items-center justify-between p-6 transition-colors
                hover:bg-white/5
              `}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`
                  material-symbols-outlined text-text-secondary-dark
                `}
                >
                  favorite
                </span>
                <span className="font-semibold text-white">Wishlist</span>
              </div>
              <span
                className={`
                material-symbols-outlined text-text-secondary-dark
              `}
              >
                chevron_right
              </span>
            </Link>
          </div>
        </div>

        <div
          className={`
          overflow-hidden rounded-xl border border-white/5 bg-surface-dark
        `}
        >
          <div className="divide-y divide-white/5">
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
                flex items-center gap-4 text-text-secondary-dark
                group-hover:text-red-400
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
