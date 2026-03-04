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
          rounded-full bg-muted p-2 transition-colors
          hover:bg-muted dark:bg-card dark:hover:bg-white/10
        `}
        >
          <span className="material-symbols-outlined text-foreground">arrow_back</span>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-8 shadow-md dark:shadow-none">
        <div className="mb-8 flex justify-center">
          <div className="group relative cursor-pointer">
            <div
              className={`
              relative size-24 overflow-hidden rounded-full border-2
              border-border dark:border-white/10
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
                material-symbols-outlined text-2xl text-foreground-reversed drop-shadow-lg
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
                mb-2 block text-sm font-medium text-muted-foreground
              `}
              >
                First Name
              </label>
              <input
                type="text"
                defaultValue="Alex"
                className={`
                  w-full rounded-xl border border-input bg-input
                  p-3 text-foreground outline-none
                  focus:border-transparent focus:ring-2 focus:ring-primary
                  dark:border-white/10 dark:bg-background-dark dark:text-foreground
                `}
              />
            </div>
            <div>
              <label
                className={`
                mb-2 block text-sm font-medium text-muted-foreground
              `}
              >
                Last Name
              </label>
              <input
                type="text"
                defaultValue="Green"
                className={`
                  w-full rounded-xl border border-input bg-input
                  p-3 text-foreground outline-none
                  focus:border-transparent focus:ring-2 focus:ring-primary
                  dark:border-white/10 dark:bg-background-dark dark:text-foreground
                `}
              />
            </div>
          </div>
          <div>
            <label
              className={`
              mb-2 block text-sm font-medium text-muted-foreground
            `}
            >
              Email
            </label>
            <input
              type="email"
              defaultValue="alex.green@example.com"
              className={`
                w-full rounded-xl border border-input bg-input p-3
                text-foreground outline-none
                focus:border-transparent focus:ring-2 focus:ring-primary
                dark:border-white/10 dark:bg-background-dark dark:text-foreground
              `}
            />
          </div>
          <div>
            <label
              className={`
              mb-2 block text-sm font-medium text-muted-foreground
            `}
            >
              Bio
            </label>
            <textarea
              rows={4}
              defaultValue="Passionate about sustainable living and finding eco-friendly alternatives for everyday products."
              className={`
                w-full resize-none rounded-xl border border-input
                bg-input p-3 text-foreground outline-none
                focus:border-transparent focus:ring-2 focus:ring-primary
                dark:border-white/10 dark:bg-background-dark dark:text-foreground
              `}
            ></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link
              href="/profile"
              className={`
                rounded-full px-6 py-3 font-medium text-muted-foreground
                transition-colors hover:bg-muted hover:text-foreground
                dark:hover:bg-white/5
              `}
            >
              Cancel
            </Link>
            <button
              className={`
                rounded-full bg-primary px-8 py-3 font-bold text-foreground
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
