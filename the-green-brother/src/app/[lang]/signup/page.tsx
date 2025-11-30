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
              mx-auto mb-6 flex h-20 w-20 items-center justify-center
              rounded-xl border border-white/10 bg-surface-dark shadow-xl
            `}
          >
            <span className="material-symbols-outlined text-4xl text-primary">eco</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Create Account</h1>
          <p className="text-text-secondary-dark">Join the community driving sustainable change.</p>
        </div>

        <div
          className={`
          rounded-xl border border-white/5 bg-surface-dark p-8 shadow-2xl
        `}
        >
          <form className="space-y-6">
            <div>
              <label
                className={`
                mb-2 block text-sm font-medium text-text-secondary-dark
              `}
              >
                Full Name
              </label>
              <div className="relative">
                <span
                  className={`
                    material-symbols-outlined absolute top-1/2 left-4
                    -translate-y-1/2 text-text-secondary-dark
                  `}
                >
                  person
                </span>
                <input
                  type="text"
                  className={`
                    w-full rounded-xl border border-white/10 bg-background-dark
                    py-3 pr-4 pl-12 text-white outline-none
                    focus:border-transparent focus:ring-2 focus:ring-primary
                  `}
                  placeholder="Enter your name"
                />
              </div>
            </div>
            <div>
              <label
                className={`
                mb-2 block text-sm font-medium text-text-secondary-dark
              `}
              >
                Email
              </label>
              <div className="relative">
                <span
                  className={`
                    material-symbols-outlined absolute top-1/2 left-4
                    -translate-y-1/2 text-text-secondary-dark
                  `}
                >
                  mail
                </span>
                <input
                  type="email"
                  className={`
                    w-full rounded-xl border border-white/10 bg-background-dark
                    py-3 pr-4 pl-12 text-white outline-none
                    focus:border-transparent focus:ring-2 focus:ring-primary
                  `}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label
                className={`
                mb-2 block text-sm font-medium text-text-secondary-dark
              `}
              >
                Password
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
                    py-3 pr-12 pl-12 text-white outline-none
                    focus:border-transparent focus:ring-2 focus:ring-primary
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
                  h-5 w-5 rounded border-white/10 bg-background-dark
                  text-primary
                  focus:ring-primary
                `}
              />
              <label
                htmlFor="terms"
                className={`
                text-sm text-text-secondary-dark
              `}
              >
                I agree to the{' '}
                <a
                  href="#"
                  className={`
                  text-white
                  hover:underline
                `}
                >
                  Terms
                </a>{' '}
                &{' '}
                <a
                  href="#"
                  className={`
                  text-white
                  hover:underline
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

        <p className="mt-8 text-center text-text-secondary-dark">
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
