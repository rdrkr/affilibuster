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
              mx-auto mb-6 flex h-20 w-20 items-center justify-center
              rounded-xl border border-white/10 bg-surface-dark shadow-xl
            `}
          >
            <span className="material-symbols-outlined text-4xl text-primary">eco</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-text-secondary-dark">Log in to continue your eco-friendly journey.</p>
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
              <div className="mb-2 flex items-center justify-between">
                <label
                  className={`
                  block text-sm font-medium text-text-secondary-dark
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
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className={`
                    absolute top-1/2 right-4 -translate-y-1/2
                    text-text-secondary-dark
                    hover:text-white
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
            <div className="h-px grow bg-white/10"></div>
            <span className="text-sm text-text-secondary-dark">Or continue with</span>
            <div className="h-px grow bg-white/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              className={`
                flex items-center justify-center gap-2 rounded-xl border
                border-white/10 bg-background-dark py-3 font-medium text-white
                transition-colors
                hover:bg-white/5
              `}
            >
              <Image src="/icons/google.svg" width={20} height={20} alt="Google" />
              Google
            </button>
            <button
              className={`
                flex items-center justify-center gap-2 rounded-xl border
                border-white/10 bg-background-dark py-3 font-medium text-white
                transition-colors
                hover:bg-white/5
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

        <p className="mt-8 text-center text-text-secondary-dark">
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
