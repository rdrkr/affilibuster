// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Newsletter Signup CTA Component
 *
 * Renders a centered newsletter signup form with title and description.
 * All content comes from CMS - no hardcoded strings.
 * Uses Text for text and Button composites for actions.
 * Includes GDPR consent checkbox when consentLabel is provided from CMS.
 */

'use client'

import { useState } from 'react'

import { ButtonAction, Header } from '@/components/elements'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type CallToActionsNewsletterSignupCtaEntry,
  type ElementsHeaderEntry,
} from '@/lib/generated/types.gen'

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

/**
 * Newsletter signup CTA section.
 * Renders a centered newsletter signup form with title and description.
 * Includes a GDPR-compliant consent checkbox when consentLabel is provided from CMS.
 * @param props - Component props with CMS CTA data
 * @param props.data - Newsletter signup CTA data from CMS
 * @param props.direction - Language direction for RTL support
 * @returns Newsletter signup CTA component
 */
export function NewsletterSignupCTA({ data, direction }: NewsletterSignupCTAProps) {
  const { title, description, emailPlaceholder, submitButton, consentLabel } = data
  const isRTL = direction === DirectionEnum.RTL
  const [consentChecked, setConsentChecked] = useState(false)
  const requiresConsent = Boolean(consentLabel)

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
          <form
            className="flex flex-col gap-3"
            onSubmit={e => {
              e.preventDefault()
            }}
          >
            <div className="flex gap-2">
              <input
                type="email"
                id="newsletter-email"
                name="email"
                autoComplete="email"
                placeholder={emailPlaceholder.text}
                aria-label={emailPlaceholder.ariaDescription}
                className={`
                  grow rounded-full border border-neutral-200 bg-white px-4 py-2.5
                  text-sm text-neutral-800 placeholder-neutral-400
                  focus:border-primary/50 focus:ring-1 focus:ring-primary/50
                  focus:outline-none
                  dark:border-white/10 dark:bg-black/20 dark:text-white
                  dark:placeholder-text-secondary-dark/50
                `}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <ButtonAction
                data={submitButton}
                direction={direction}
                showText={true}
                variant="primary"
                size="md"
                disabled={requiresConsent && !consentChecked}
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
            {consentLabel && (
              <label
                htmlFor="newsletter-consent"
                className={`flex items-start gap-2 text-xs text-neutral-600 dark:text-text-secondary-dark ${
                  isRTL ? 'flex-row-reverse text-right' : 'text-left'
                }`}
              >
                <input
                  type="checkbox"
                  id="newsletter-consent"
                  name="consent"
                  checked={consentChecked}
                  onChange={e => {
                    setConsentChecked(e.target.checked)
                  }}
                  className="mt-0.5 shrink-0"
                  aria-label={consentLabel.ariaDescription}
                />
                <span>{consentLabel.text}</span>
              </label>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
