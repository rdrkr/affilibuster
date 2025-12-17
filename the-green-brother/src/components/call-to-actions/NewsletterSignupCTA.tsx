// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Newsletter Signup CTA Component
 *
 * Renders a centered newsletter signup form with title and description.
 * All content comes from CMS - no hardcoded strings.
 * Uses CMSText for text and Button composites for actions.
 */

'use client'

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
 * @param props - Component props with CMS CTA data
 * @param props.data - Newsletter signup CTA data from CMS
 * @param props.direction - Language direction for RTL support
 * @returns Newsletter signup CTA component
 */
export function NewsletterSignupCTA({ data, direction }: NewsletterSignupCTAProps) {
  const { title, description, emailPlaceholder, submitButton } = data
  const isRTL = direction === DirectionEnum.RTL

  return (
    <section className="relative py-6" data-testid="newsletter-signup-cta" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-white/5 bg-white/5 p-8">
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
            headerClassName="text-white"
            subheaderClassName="text-sm"
          />
          <form
            className="flex gap-2"
            onSubmit={e => {
              e.preventDefault()
            }}
          >
            <input
              type="email"
              placeholder={emailPlaceholder.text}
              aria-label={emailPlaceholder.ariaDescription}
              className={`
                grow rounded-full border border-white/10 bg-black/20 px-4 py-2.5
                text-sm text-white placeholder-text-secondary-dark/50
                focus:border-primary/50 focus:ring-1 focus:ring-primary/50
                focus:outline-none
              `}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <ButtonAction
              data={submitButton}
              direction={direction}
              variant="primary"
              size="md"
              className={`
                rounded-full bg-primary px-6 py-2.5 text-sm font-bold
                whitespace-nowrap text-background-dark shadow-lg
                hover:bg-primary-hover
              `}
            />
          </form>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSignupCTA
