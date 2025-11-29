// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Link from 'next/link'

const Signup = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-surface-dark rounded-3xl mx-auto flex items-center justify-center border border-white/10 shadow-xl mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">eco</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-text-secondary-dark">Join the community driving sustainable change.</p>
        </div>

        <div className="bg-surface-dark p-8 rounded-3xl border border-white/5 shadow-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary-dark mb-2">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-dark">
                  person
                </span>
                <input
                  type="text"
                  className="w-full bg-background-dark border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Enter your name"
                />
              </div>
            </div>
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
              <label className="block text-sm font-medium text-text-secondary-dark mb-2">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-dark">
                  lock
                </span>
                <input
                  type="password"
                  className="w-full bg-background-dark border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Create a password"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="terms"
                className="w-5 h-5 rounded border-white/10 bg-background-dark text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-text-secondary-dark">
                I agree to the{' '}
                <a href="#" className="text-white hover:underline">
                  Terms
                </a>{' '}
                &{' '}
                <a href="#" className="text-white hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            <button className="w-full bg-primary text-background-dark font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
              Sign Up
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-text-secondary-dark">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
