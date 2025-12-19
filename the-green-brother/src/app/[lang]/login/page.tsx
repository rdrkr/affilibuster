// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'

const Login = () => {
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
          <h1 className="mb-2 text-3xl font-bold text-neutral-800 dark:text-white">Welcome Back</h1>
          <p className="text-neutral-600 dark:text-text-secondary-dark">
            Log in to continue your eco-friendly journey.
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
              <div className="mb-2 flex items-center justify-between">
                <label
                  className={`
                  block text-sm font-medium text-neutral-600 dark:text-text-secondary-dark
                `}
                >
                  Password
                </label>
                <a
                  href="#"
                  className={`
                  text-xs font-semibold text-primary
                  hover:underline
                `}
                >
                  Forgot?
                </a>
              </div>
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
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className={`
                    absolute top-1/2 right-4 -translate-y-1/2
                    text-neutral-400 hover:text-neutral-700
                    dark:text-text-secondary-dark dark:hover:text-white
                  `}
                >
                  <span className="material-symbols-outlined text-xl">visibility_off</span>
                </button>
              </div>
            </div>
            <button
              className={`
                w-full rounded-xl bg-primary py-3.5 font-bold
                text-background-dark shadow-lg shadow-primary/20
                transition-colors
                hover:bg-primary-hover
              `}
            >
              Log In
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px grow bg-neutral-200 dark:bg-white/10"></div>
            <span className="text-sm text-neutral-600 dark:text-text-secondary-dark">Or continue with</span>
            <div className="h-px grow bg-neutral-200 dark:bg-white/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              className={`
                flex items-center justify-center gap-2 rounded-xl border
                border-neutral-200 bg-neutral-50 py-3 font-medium text-neutral-800
                transition-colors hover:bg-neutral-100
                dark:border-white/10 dark:bg-background-dark dark:text-white
                dark:hover:bg-white/5
              `}
            >
              <Image src="/icons/google.svg" width={20} height={20} alt="Google" />
              Google
            </button>
            <button
              className={`
                flex items-center justify-center gap-2 rounded-xl border
                border-neutral-200 bg-neutral-50 py-3 font-medium text-neutral-800
                transition-colors hover:bg-neutral-100
                dark:border-white/10 dark:bg-background-dark dark:text-white
                dark:hover:bg-white/5
              `}
            >
              <Image
                src="/icons/apple.svg"
                width={20}
                height={20}
                className={`
                invert
              `}
                alt="Apple"
              />
              Apple
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-neutral-600 dark:text-text-secondary-dark">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className={`
            font-bold text-primary
            hover:underline
          `}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
