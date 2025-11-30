// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Brand Features Section Component
 *
 * Renders a grid of feature cards highlighting brand values/benefits.
 * All content comes from CMS - no hardcoded strings.
 * Uses Label composite for feature items and Button for CTA.
 */

'use client'

import { Button, CMSIcon, CMSText, Label } from '@/components/elements'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type SectionsBrandFeaturesSectionEntry,
} from '@/lib/generated/types.gen'

/**
 * Props for the FeatureGridSection component
 */
export interface BrandFeaturesSectionProps {
  /** Brand features section data from CMS */
  data: SectionsBrandFeaturesSectionEntry & {
    __component: 'sections.brand-features-section'
  }
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Brand features section displaying brand values/benefits.
 * @param props - Component props with CMS section data
 * @param props.data - Brand features section data from CMS
 * @param props.direction - Language direction for RTL support
 * @returns Brand features section component
 */
export function BrandFeaturesSection({ data, direction }: BrandFeaturesSectionProps) {
  const {
    headerText,
    headerAriaDescription,
    headerAlignment,
    subheaderText,
    learnMoreButtonText,
    learnMoreButtonUrl,
    learnMoreButtonIcon,
    learnMoreButtonOpenInNewTab,
    learnMoreButtonAriaDescription,
    features,
  } = data

  const isRTL = direction === DirectionEnum.RTL

  // Map alignment to Tailwind classes
  // LANGUAGE_DIRECTION means start for LTR languages, end for RTL
  const getAlignmentClass = () => {
    if (headerAlignment === AlignmentEnum.CENTER) {
      return 'flex justify-center'
    }
    // LANGUAGE_DIRECTION: start for LTR, end for RTL
    return isRTL ? 'flex justify-end' : 'flex justify-start'
  }
  const alignmentClass = getAlignmentClass()

  return (
    <section
      className={`
        relative overflow-hidden rounded-xl border border-white/5
        bg-surface-dark p-8
        md:p-16
      `}
      aria-label={headerAriaDescription ?? ''}
    >
      {/* Decorative background elements */}
      <div
        className={`
        absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-primary/5
        blur-3xl
      `}
      />
      <div
        className={`
        absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full
        bg-blue-500/5 blur-3xl
      `}
      />

      <div
        className={`
        relative z-10
        lg:flex lg:items-center lg:gap-20
      `}
      >
        {/* Left column - Header and CTA */}
        <div
          className={`
          mb-10
          lg:mb-0 lg:w-1/3
        `}
        >
          {headerText && (
            <h3
              className={`
              text-3xl leading-tight font-bold text-white
              md:text-4xl
            `}
            >
              <CMSText text={headerText} />
            </h3>
          )}
          {subheaderText && (
            <p className="mt-6 text-lg text-text-secondary-dark">
              <CMSText text={subheaderText} />
            </p>
          )}
          {learnMoreButtonUrl && learnMoreButtonText && (
            <div className={`mt-8 ${alignmentClass}`}>
              <Button
                data={{
                  label: {
                    text: learnMoreButtonText,
                    iconPosition: IconPositionEnum.AFTER_TEXT,
                    ariaDescription: learnMoreButtonAriaDescription ?? '',
                    ...(learnMoreButtonIcon ? { icon: learnMoreButtonIcon } : {}),
                  },
                  url: learnMoreButtonUrl,
                  openInNewTab: learnMoreButtonOpenInNewTab ?? false,
                }}
                direction={direction}
                variant="link"
              />
            </div>
          )}
        </div>

        {/* Right column - Feature grid */}
        <div
          className={`
          mt-8 grid grid-cols-1 gap-8
          md:grid-cols-2
          lg:mt-0 lg:w-2/3
        `}
        >
          {features.map((feature, index) => {
            if (!feature.header) {
              return null
            }

            return (
              <div key={feature.id ?? index} className="flex items-start gap-4">
                <div className="shrink-0 text-primary">
                  <CMSIcon icon={feature.header.icon ?? 'star'} size="lg" />
                </div>
                <div>
                  <Label data={feature.header} as="h4" hideIcon className="text-lg font-bold" direction={direction} />
                  {feature.subheader?.text && (
                    <p
                      className={`
                      mt-1 text-text-secondary-light
                      dark:text-text-secondary-dark
                    `}
                    >
                      <CMSText text={feature.subheader.text} />
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BrandFeaturesSection
