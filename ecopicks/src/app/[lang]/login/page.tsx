// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'

const Login = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-surface-dark rounded-3xl mx-auto flex items-center justify-center border border-white/10 shadow-xl mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">eco</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-text-secondary-dark">Log in to continue your eco-friendly journey.</p>
        </div>

        <div className="bg-surface-dark p-8 rounded-3xl border border-white/5 shadow-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary-dark mb-2">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-dark">
                  mail
                </span>
                <input
                  type="email"
                  className="w-full bg-background-dark border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-text-secondary-dark">Password</label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-dark">
                  lock
                </span>
                <input
                  type="password"
                  className="w-full bg-background-dark border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary-dark hover:text-white"
                >
                  <span className="material-symbols-outlined text-xl">visibility_off</span>
                </button>
              </div>
            </div>
            <button className="w-full bg-primary text-background-dark font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
              Log In
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-white/10 grow"></div>
            <span className="text-sm text-text-secondary-dark">Or continue with</span>
            <div className="h-px bg-white/10 grow"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-background-dark border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white font-medium">
              <Image src="https://www.svgrepo.com/show/475656/google-color.svg" width={20} height={20} alt="Google" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-background-dark border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white font-medium">
              <Image
                src="https://www.svgrepo.com/show/511330/apple-173.svg"
                width={20}
                height={20}
                className="invert"
                alt="Apple"
              />
              Apple
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-text-secondary-dark">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
