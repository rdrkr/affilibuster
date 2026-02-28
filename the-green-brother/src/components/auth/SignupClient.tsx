// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * SignupClient Component
 *
 * Client component for the Signup page.
 * Renders the signup form using CMS data for labels and text.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { type ApiAuthPageAuthPageDocument, DirectionEnum } from '@/lib/generated/types.gen'

import ButtonLink from '@/components/elements/ButtonLink'
import Header from '@/components/elements/Header'
import Label from '@/components/elements/Label'

interface SignupClientProps {
  data: ApiAuthPageAuthPageDocument
  lang: string
  direction: DirectionEnum
}

/**
 * SignupClient Component
 * @param root0 - Component props
 * @param root0.data - Page data from CMS
 * @param root0.lang - Current language code
 * @param root0.direction - Text direction
 * @returns React component
 */
export default function SignupClient({ data, lang, direction }: SignupClientProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Destructure CMS data
  const {
    signupHeader,
    nameLabel,
    namePlaceholder,
    emailLabel,
    emailPlaceholder,
    passwordLabel,
    passwordPlaceholder,
    signupButton,
    orDividerText,
    googleButton,
    appleButton,
    haveAccountText,
    loginLinkText,
    termsLinkText,
    privacyLinkText,
    termsText,
  } = data

  const handleSignup = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault()
    if (!termsAccepted) {
      alert('Please accept terms') // proper error handling later
      return
    }
    setIsLoading(true)

    // Simulate signup
    setTimeout(() => {
      setIsLoading(false)
      router.push(`/${lang}/profile`)
    }, 1000)
  }

  const isRtl = direction === DirectionEnum.RTL

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Header
            data={signupHeader}
            direction={direction}
            level={1}
            className="mb-2"
            headerClassName="text-3xl font-bold text-neutral-800 dark:text-white"
            subheaderClassName="text-neutral-600 dark:text-text-secondary-dark"
          />
        </div>

        <div
          className={`
          rounded-xl border border-neutral-200 bg-white p-8 shadow-2xl
          dark:border-white/5 dark:bg-surface-dark
        `}
        >
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Name Field */}
            <div>
              <Label
                data={nameLabel}
                direction={direction}
                className="mb-2 text-sm font-medium text-neutral-600 dark:text-text-secondary-dark"
              />
              <div className="relative">
                <span
                  className={`
                    material-symbols-outlined absolute top-1/2 -translate-y-1/2 text-neutral-400 dark:text-text-secondary-dark
                    ${isRtl ? 'right-4' : 'left-4'}
                  `}
                >
                  person
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                  }}
                  className={`
                    w-full rounded-xl border border-neutral-200 bg-neutral-50
                    py-3 text-neutral-800 outline-none
                    focus:border-transparent focus:ring-2 focus:ring-primary
                    dark:border-white/10 dark:bg-background-dark dark:text-white
                    ${isRtl ? 'pr-12 pl-4' : 'pr-4 pl-12'}
                  `}
                  placeholder={namePlaceholder}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <Label
                data={emailLabel}
                direction={direction}
                className="mb-2 text-sm font-medium text-neutral-600 dark:text-text-secondary-dark"
              />
              <div className="relative">
                <span
                  className={`
                    material-symbols-outlined absolute top-1/2 -translate-y-1/2 text-neutral-400 dark:text-text-secondary-dark
                    ${isRtl ? 'right-4' : 'left-4'}
                  `}
                >
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                  }}
                  className={`
                    w-full rounded-xl border border-neutral-200 bg-neutral-50
                    py-3 text-neutral-800 outline-none
                    focus:border-transparent focus:ring-2 focus:ring-primary
                    dark:border-white/10 dark:bg-background-dark dark:text-white
                    ${isRtl ? 'pr-12 pl-4' : 'pr-4 pl-12'}
                  `}
                  placeholder={emailPlaceholder}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <Label
                data={passwordLabel}
                direction={direction}
                className="mb-2 text-sm font-medium text-neutral-600 dark:text-text-secondary-dark"
              />
              <div className="relative">
                <span
                  className={`
                    material-symbols-outlined absolute top-1/2 -translate-y-1/2 text-neutral-400 dark:text-text-secondary-dark
                    ${isRtl ? 'right-4' : 'left-4'}
                  `}
                >
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                  }}
                  className={`
                    w-full rounded-xl border border-neutral-200 bg-neutral-50
                    px-12 py-3 text-neutral-800
                    outline-none focus:border-transparent focus:ring-2
                    focus:ring-primary dark:border-white/10 dark:bg-background-dark
                    dark:text-white
                  `}
                  placeholder={passwordPlaceholder}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword)
                  }}
                  className={`
                    absolute top-1/2 -translate-y-1/2
                    text-neutral-400 hover:text-neutral-700
                    dark:text-text-secondary-dark dark:hover:text-white
                    ${isRtl ? 'left-4' : 'right-4'}
                  `}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={e => {
                  setTermsAccepted(e.target.checked)
                }}
                className={`
                  size-5 rounded-sm border-neutral-200 bg-neutral-50
                  text-primary focus:ring-primary
                  dark:border-white/10 dark:bg-background-dark
                `}
                required
              />
              <label
                htmlFor="terms"
                className={`
                text-sm text-neutral-600 dark:text-text-secondary-dark
              `}
              >
                {termsText ? termsText + ' ' : 'I agree to the '}
                <Link
                  href="/terms"
                  className={`
                  text-neutral-800 hover:underline dark:text-white
                `}
                >
                  {termsLinkText || 'Terms'}
                </Link>{' '}
                &{' '}
                <Link
                  href="/privacy"
                  className={`
                  text-neutral-800 hover:underline dark:text-white
                `}
                >
                  {privacyLinkText || 'Privacy Policy'}
                </Link>
              </label>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full rounded-xl bg-primary py-3.5 font-bold
                text-background-dark shadow-lg shadow-primary/20
                transition-colors
                hover:bg-primary-hover
                disabled:cursor-not-allowed disabled:opacity-70
              `}
            >
              {signupButton.label?.text ?? 'Sign Up'}
            </button>
          </form>
          <div className="my-8 flex items-center gap-4">
            <div className="h-px grow bg-neutral-200 dark:bg-white/10"></div>
            <span className="text-sm text-neutral-600 dark:text-text-secondary-dark">{orDividerText}</span>
            <div className="h-px grow bg-neutral-200 dark:bg-white/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ButtonLink
              data={googleButton}
              direction={direction}
              variant="outline"
              className="w-full justify-center bg-neutral-50 dark:bg-background-dark"
            />

            <ButtonLink
              data={appleButton}
              direction={direction}
              variant="outline"
              className="w-full justify-center bg-neutral-50 dark:bg-background-dark"
            />
          </div>
        </div>

        <p className="mt-8 text-center text-neutral-600 dark:text-text-secondary-dark">
          {haveAccountText}{' '}
          <Link
            href={`/${lang}/login`}
            className={`
            font-bold text-primary
            hover:underline
          `}
          >
            {loginLinkText}
          </Link>
        </p>
      </div>
    </div>
  )
}
