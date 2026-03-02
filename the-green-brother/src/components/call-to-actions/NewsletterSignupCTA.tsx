// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Newsletter Signup CTA Component
 *
 * Renders a centered newsletter signup form with title and description.
 * All content comes from CMS - no hardcoded strings.
 * Uses Text for text and Button composites for actions.
 * Includes a mandatory consent checkbox (GDPR Art. 7) with privacy policy link.
 * Uses Double Opt-In: shows pending confirmation message after subscribe.
 * Submits email subscriptions to the backend API.
 */

'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

import { ButtonAction, Header } from '@/components/elements'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type CallToActionsNewsletterSignupCtaEntry,
  type ElementsHeaderEntry,
} from '@/lib/generated/types.gen'
import { subscribeNewsletter } from '@/lib/newsletter'

/**
 * Props for the NewsletterSignupCTA component
 */
export interface NewsletterSignupCTAProps {
  /** Newsletter signup CTA data from CMS */
  data: CallToActionsNewsletterSignupCtaEntry & {
    __component: 'call-to-actions.newsletter-signup-cta'
  }
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/** Simple email format validation regex. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Newsletter signup CTA section.
 * Renders a centered newsletter signup form with title and description.
 * Includes a mandatory GDPR consent checkbox with CMS-driven label.
 * Displays DOI pending confirmation message on successful submit.
 * @param props - Component props with CMS CTA data
 * @param props.data - Newsletter signup CTA data from CMS
 * @param props.direction - Language direction for RTL support
 * @returns Newsletter signup CTA component
 */
export function NewsletterSignupCTA({ data, direction }: NewsletterSignupCTAProps) {
  const {
    title,
    description,
    emailPlaceholder,
    submitButton,
    consentLabel,
    consentRequiredError,
    pendingConfirmationMessage,
    errorMessage,
    emailRequiredError,
    emailInvalidError,
  } = data
  const isRTL = direction === DirectionEnum.RTL

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)
  const [consentError, setConsentError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  /**
   * Validates the form inputs (email + consent checkbox).
   * @returns Whether the form is valid
   */
  function validateForm(): boolean {
    let valid = true

    if (!email.trim()) {
      setEmailError(emailRequiredError.text)
      valid = false
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError(emailInvalidError.text)
      valid = false
    } else {
      setEmailError('')
    }

    if (!consentChecked) {
      setConsentError(consentRequiredError.text)
      valid = false
    } else {
      setConsentError('')
    }

    return valid
  }

  /**
   * Handles form submission.
   * @param e - Form submit event
   */
  async function handleSubmit(e: React.SyntheticEvent): Promise<void> {
    e.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    const result = await subscribeNewsletter(email.trim())
    setIsSubmitting(false)

    if (result?.success) {
      setIsSuccess(true)
    } else {
      setSubmitError(errorMessage.text)
    }
  }

  return (
    <section className="relative py-6" data-testid="newsletter-signup-cta" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-2xl">
        <div
          className={`
          rounded-xl border
          border-neutral-200 bg-neutral-50 p-8
          shadow-md
          dark:border-white/5 dark:bg-surface-dark dark:shadow-none
        `}
        >
          <Header
            data={
              {
                header: {
                  text: title,
                  ariaDescription: '',
                  iconPosition: IconPositionEnum.BEFORE_TEXT,
                },
                subheader: {
                  text: description,
                  ariaDescription: '',
                  iconPosition: IconPositionEnum.BEFORE_TEXT,
                },
                alignment: AlignmentEnum.CENTER,
              } as ElementsHeaderEntry
            }
            level={4}
            direction={direction}
            className="mb-6"
            headerClassName="text-neutral-800 dark:text-white"
            subheaderClassName="text-sm text-neutral-600 dark:text-text-secondary-dark"
          />
          {isSuccess ? (
            <div
              className="text-center text-sm text-primary-600 dark:text-primary-400"
              data-testid="newsletter-success"
              role="status"
            >
              {pendingConfirmationMessage.text}
            </div>
          ) : (
            <form
              className="flex flex-col gap-3"
              onSubmit={e => {
                void handleSubmit(e)
              }}
            >
              <div className="flex gap-2">
                <div className="flex grow flex-col">
                  <input
                    type="email"
                    id="newsletter-email"
                    name="email"
                    autoComplete="email"
                    placeholder={emailPlaceholder.text}
                    aria-label={emailPlaceholder.ariaDescription}
                    aria-invalid={emailError ? true : undefined}
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      if (emailError) {
                        setEmailError('')
                      }
                    }}
                    className={`
                      grow rounded-full border bg-white px-4 py-2.5
                      text-sm text-neutral-800 placeholder-neutral-400
                      focus:border-primary/50 focus:ring-1 focus:ring-primary/50
                      focus:outline-none
                      dark:bg-black/20 dark:text-white
                      dark:placeholder-text-secondary-dark/50
                      ${emailError ? 'border-error-500' : 'border-neutral-200 dark:border-white/10'}
                    `}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    disabled={isSubmitting}
                  />
                  {emailError && (
                    <span
                      className={`mt-1 text-xs text-error-500 ${isRTL ? 'text-right' : 'text-left'}`}
                      data-testid="email-error"
                      role="alert"
                    >
                      {emailError}
                    </span>
                  )}
                </div>
                <ButtonAction
                  data={submitButton}
                  direction={direction}
                  showText={true}
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSubmitting || !email.trim() || !consentChecked}
                  className={`
                    rounded-full bg-primary px-6 py-2.5 text-sm font-bold
                    whitespace-nowrap text-background-dark shadow-lg
                    hover:bg-primary-hover active:bg-primary-800
                  `}
                  onClick={() => {
                    // Submit is handled by form onSubmit, but onClick is required by ButtonAction
                  }}
                />
              </div>
              {submitError && (
                <span className="text-center text-xs text-error-500" data-testid="submit-error" role="alert">
                  {submitError}
                </span>
              )}
              <label
                className={`flex items-start gap-2 text-xs text-neutral-600 dark:text-text-secondary-dark ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
                data-testid="consent-text"
              >
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => {
                    setConsentChecked(e.target.checked)
                    if (consentError) {
                      setConsentError('')
                    }
                  }}
                  className="mt-0.5 shrink-0 accent-primary"
                  data-testid="consent-checkbox"
                  disabled={isSubmitting}
                />
                <span className="leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                    {consentLabel.text}
                  </ReactMarkdown>
                </span>
              </label>
              {consentError && (
                <span
                  className={`text-xs text-error-500 ${isRTL ? 'text-right' : 'text-left'}`}
                  data-testid="consent-error"
                  role="alert"
                >
                  {consentError}
                </span>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
