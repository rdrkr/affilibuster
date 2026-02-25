// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import NextImage from 'next/image'
import Link from 'next/link'

/**
 * Edit Profile client component.
 * Renders the profile editing form with name, email, bio fields and avatar.
 * @returns The edit profile form UI
 */
const EditProfileClient = () => {
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
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">Edit Profile</h1>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-md dark:border-white/5 dark:bg-surface-dark dark:shadow-none">
        <div className="mb-8 flex justify-center">
          <div className="group relative cursor-pointer">
            <div
              className={`
              relative size-24 overflow-hidden rounded-full border-2
              border-neutral-200 dark:border-white/10
            `}
            >
              <NextImage
                src="/images/profile-avatar-placeholder.webp"
                alt="Profile"
                fill
                className={`
                  object-cover transition-opacity
                  group-hover:opacity-75
                `}
                sizes="96px"
              />
            </div>
            <div
              className={`
                absolute inset-0 flex items-center justify-center opacity-0
                transition-opacity
                group-hover:opacity-100
              `}
            >
              <span
                className={`
                material-symbols-outlined text-2xl text-white drop-shadow-lg
                dark:text-white
              `}
              >
                photo_camera
              </span>
            </div>
          </div>
        </div>

        <form className="space-y-6">
          <div
            className={`
            grid gap-6
            md:grid-cols-2
          `}
          >
            <div>
              <label
                className={`
                mb-2 block text-sm font-medium text-neutral-600 dark:text-text-secondary-dark
              `}
              >
                First Name
              </label>
              <input
                type="text"
                defaultValue="Alex"
                className={`
                  w-full rounded-xl border border-neutral-200 bg-neutral-50
                  p-3 text-neutral-800 outline-none
                  focus:border-transparent focus:ring-2 focus:ring-primary
                  dark:border-white/10 dark:bg-background-dark dark:text-white
                `}
              />
            </div>
            <div>
              <label
                className={`
                mb-2 block text-sm font-medium text-neutral-600 dark:text-text-secondary-dark
              `}
              >
                Last Name
              </label>
              <input
                type="text"
                defaultValue="Green"
                className={`
                  w-full rounded-xl border border-neutral-200 bg-neutral-50
                  p-3 text-neutral-800 outline-none
                  focus:border-transparent focus:ring-2 focus:ring-primary
                  dark:border-white/10 dark:bg-background-dark dark:text-white
                `}
              />
            </div>
          </div>
          <div>
            <label
              className={`
              mb-2 block text-sm font-medium text-neutral-600 dark:text-text-secondary-dark
            `}
            >
              Email
            </label>
            <input
              type="email"
              defaultValue="alex.green@example.com"
              className={`
                w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3
                text-neutral-800 outline-none
                focus:border-transparent focus:ring-2 focus:ring-primary
                dark:border-white/10 dark:bg-background-dark dark:text-white
              `}
            />
          </div>
          <div>
            <label
              className={`
              mb-2 block text-sm font-medium text-neutral-600 dark:text-text-secondary-dark
            `}
            >
              Bio
            </label>
            <textarea
              rows={4}
              defaultValue="Passionate about sustainable living and finding eco-friendly alternatives for everyday products."
              className={`
                w-full resize-none rounded-xl border border-neutral-200
                bg-neutral-50 p-3 text-neutral-800 outline-none
                focus:border-transparent focus:ring-2 focus:ring-primary
                dark:border-white/10 dark:bg-background-dark dark:text-white
              `}
            ></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link
              href="/profile"
              className={`
                rounded-full px-6 py-3 font-medium text-neutral-600
                transition-colors hover:bg-neutral-100 hover:text-neutral-800
                dark:text-text-secondary-dark dark:hover:bg-white/5 dark:hover:text-white
              `}
            >
              Cancel
            </Link>
            <button
              className={`
                rounded-full bg-primary px-8 py-3 font-bold text-background-dark
                shadow-lg shadow-primary/20 transition-colors
                hover:bg-primary-hover
              `}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileClient
