// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Brand Features Section Component
 *
 * Renders a grid of feature cards highlighting brand values/benefits.
 * All content comes from CMS - no hardcoded strings.
 * Uses Label composite for feature items and ButtonLink for CTA.
 */

import { ButtonLink, Header } from '@/components/elements'
import {
  AlignmentEnum,
  DirectionEnum,
  type ElementsHeaderEntry,
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
    showHeader,
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
  const alignmentClass = `flex ${headerAlignment === AlignmentEnum.CENTER ? 'justify-center' : 'justify-start'}`

  // Determine layout based on feature count
  const useGridLayout = features.length >= 4

  // Render features without header section (standalone feature cards)
  if (!showHeader) {
    return (
      <div
        className={`grid grid-flow-col grid-rows-3 gap-4`}
        aria-label={headerAriaDescription ?? ''}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {features.map((feature, index) => {
          if (!feature.header) {
            return null
          }
          return (
            <div
              key={feature.id ?? index}
              className={`
                flex items-center justify-start
                rounded-xl border
                border-neutral-200 bg-white
                p-6 shadow-sm
                dark:border-white/5 dark:bg-surface-dark
                dark:shadow-none
              `}
            >
              <Header data={feature} level={3} direction={direction} className="w-full" />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <section
      className={`
        relative overflow-hidden rounded-xl border border-neutral-200
        bg-white p-8 shadow-md
        md:p-16 dark:border-white/5 dark:bg-surface-dark
        dark:shadow-none
      `}
      aria-label={headerAriaDescription ?? ''}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Decorative background elements */}
      <div
        className={`
        absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-primary/5
        blur-3xl
      `}
      />
      <div
        className={`
        absolute bottom-0 left-0 -mb-20 -ml-20 size-80 rounded-full
        bg-blue-500/5 blur-3xl
      `}
      />

      <div
        className={`
        relative z-10
        lg:flex lg:items-stretch lg:gap-20
      `}
      >
        {/* Left column - Header and CTA */}
        <div
          className={`
          mb-10 flex flex-col justify-between
          lg:mb-0 lg:w-1/3
        `}
        >
          <Header
            data={
              {
                header: headerText
                  ? {
                      text: headerText,
                      ariaDescription: headerAriaDescription ?? '',
                      iconPosition: isRTL ? IconPositionEnum.AFTER_TEXT : IconPositionEnum.BEFORE_TEXT,
                    }
                  : { text: '', ariaDescription: '', iconPosition: IconPositionEnum.BEFORE_TEXT },
                subheader: subheaderText
                  ? {
                      text: subheaderText,
                      ariaDescription: '',
                      iconPosition: isRTL ? IconPositionEnum.AFTER_TEXT : IconPositionEnum.BEFORE_TEXT,
                    }
                  : undefined,
                alignment: headerAlignment ?? AlignmentEnum.LANGUAGE_DIRECTION,
              } as ElementsHeaderEntry
            }
            level={2}
            direction={direction}
          />
          {learnMoreButtonUrl && learnMoreButtonText && (
            <div className={`mt-8 ${alignmentClass}`}>
              <ButtonLink
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
                variant="link-1"
              />
            </div>
          )}
        </div>

        {/* Right column - Feature layout (grid or vertical) */}
        <div
          className={`
          mt-8
          ${useGridLayout ? 'grid grid-cols-1 gap-8 md:grid-cols-2' : 'flex flex-col gap-6'}
          lg:mt-0 lg:w-2/3
        `}
        >
          {features.map((feature, index) => {
            if (!feature.header) {
              return null
            }

            return (
              <div key={feature.id ?? index} className={`flex items-start gap-4`}>
                <Header data={feature} level={3} direction={direction} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BrandFeaturesSection
