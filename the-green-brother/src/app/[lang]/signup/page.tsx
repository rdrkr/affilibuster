// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Link from 'next/link'

const Signup = () => {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div
            className={`
              mx-auto mb-6 flex size-20 items-center justify-center
              rounded-xl border border-neutral-200 bg-white shadow-xl
              dark:border-white/10 dark:bg-surface-dark
            `}
          >
            <span className="material-symbols-outlined text-4xl text-primary">eco</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-neutral-800 dark:text-white">Create Account</h1>
          <p className="text-neutral-600 dark:text-text-secondary-dark">
            Join the community driving sustainable change.
          </p>
        </div>

        <div
          className={`
          rounded-xl border border-neutral-200 bg-white p-8 shadow-2xl
          dark:border-white/5 dark:bg-surface-dark
        `}
        >
          <form className="space-y-6">
            <div>
              <label
                className={`
                mb-2 block text-sm font-medium text-neutral-600 dark:text-text-secondary-dark
              `}
              >
                Full Name
              </label>
              <div className="relative">
                <span
                  className={`
                    material-symbols-outlined absolute top-1/2 left-4
                    -translate-y-1/2 text-neutral-400 dark:text-text-secondary-dark
                  `}
                >
                  person
                </span>
                <input
                  type="text"
                  className={`
                    w-full rounded-xl border border-neutral-200 bg-neutral-50
                    py-3 pr-4 pl-12 text-neutral-800 outline-none
                    focus:border-transparent focus:ring-2 focus:ring-primary
                    dark:border-white/10 dark:bg-background-dark dark:text-white
                  `}
                  placeholder="Enter your name"
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
              <div className="relative">
                <span
                  className={`
                    material-symbols-outlined absolute top-1/2 left-4
                    -translate-y-1/2 text-neutral-400 dark:text-text-secondary-dark
                  `}
                >
                  mail
                </span>
                <input
                  type="email"
                  className={`
                    w-full rounded-xl border border-neutral-200 bg-neutral-50
                    py-3 pr-4 pl-12 text-neutral-800 outline-none
                    focus:border-transparent focus:ring-2 focus:ring-primary
                    dark:border-white/10 dark:bg-background-dark dark:text-white
                  `}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label
                className={`
                mb-2 block text-sm font-medium text-neutral-600 dark:text-text-secondary-dark
              `}
              >
                Password
              </label>
              <div className="relative">
                <span
                  className={`
                    material-symbols-outlined absolute top-1/2 left-4
                    -translate-y-1/2 text-neutral-400 dark:text-text-secondary-dark
                  `}
                >
                  lock
                </span>
                <input
                  type="password"
                  className={`
                    w-full rounded-xl border border-neutral-200 bg-neutral-50
                    px-12 py-3 text-neutral-800 outline-none
                    focus:border-transparent focus:ring-2 focus:ring-primary
                    dark:border-white/10 dark:bg-background-dark dark:text-white
                  `}
                  placeholder="Create a password"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="terms"
                className={`
                  size-5 rounded-sm border-neutral-200 bg-neutral-50
                  text-primary focus:ring-primary
                  dark:border-white/10 dark:bg-background-dark
                `}
              />
              <label
                htmlFor="terms"
                className={`
                text-sm text-neutral-600 dark:text-text-secondary-dark
              `}
              >
                I agree to the{' '}
                <a
                  href="#"
                  className={`
                  text-neutral-800 hover:underline dark:text-white
                `}
                >
                  Terms
                </a>{' '}
                &{' '}
                <a
                  href="#"
                  className={`
                  text-neutral-800 hover:underline dark:text-white
                `}
                >
                  Privacy Policy
                </a>
              </label>
            </div>
            <button
              className={`
                w-full rounded-xl bg-primary py-3.5 font-bold
                text-background-dark shadow-lg shadow-primary/20
                transition-colors
                hover:bg-primary-hover
              `}
            >
              Sign Up
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-neutral-600 dark:text-text-secondary-dark">
          Already have an account?{' '}
          <Link
            href="/login"
            className={`
            font-bold text-primary
            hover:underline
          `}
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
