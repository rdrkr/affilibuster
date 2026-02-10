// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * CookieConsentBanner Component
 *
 * A CMS-driven cookie consent banner that appears on first visit.
 * Fetches content and categories from the backend CMS proxy, then
 * displays accept/reject/customize options with per-category toggles.
 * Persists consent to a first-party cookie and records to the backend
 * for GDPR audit trail.
 *
 * Supports "edit mode" for GDPR Art. 7(3) consent withdrawal: when
 * triggered via the Cookie Settings button, re-displays the banner
 * with previously saved category preferences pre-filled.
 */

import { useCallback, useEffect, useState } from 'react'

import { TextBlock } from '@/components/elements'
import { getConsentCategories, getConsentPage, useConsent } from '@/lib/consent'
import type {
  ConsentCategoryGetConsentCategoriesResponses,
  ConsentGetConsentResponses,
  ElementsTextBlockEntry,
} from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'

/** Props for the CookieConsentBanner component. */
interface CookieConsentBannerProps {
  /** The current language code for fetching localized CMS content. */
  lang: string
  /** Text direction for RTL/LTR support. */
  direction: DirectionEnum
}

/** TextBlock component discriminator for CMS component fields. */
const TEXT_BLOCK_COMPONENT = 'elements.text-block' as const

/**
 * Add the __component discriminator required by TextBlock.
 * CMS component fields lack this discriminator in the generated types.
 * @param data - The text block entry from CMS
 * @returns The text block entry with __component discriminator
 */
function asTextBlock(data: ElementsTextBlockEntry): ElementsTextBlockEntry & { __component: 'elements.text-block' } {
  return { ...data, __component: TEXT_BLOCK_COMPONENT }
}

/** Extracted consent page data type. */
type ConsentPageData = ConsentGetConsentResponses[200]['data']

/** Extracted consent category item type. */
type ConsentCategoryItem = ConsentCategoryGetConsentCategoriesResponses[200]['data'][number]

/**
 * Cookie consent banner displayed at the bottom of the page.
 *
 * Shows a banner on first visit (when no consent cookie exists).
 * Content is fetched from the CMS and supports all project languages.
 * Users can accept all, reject all, or customize per-category.
 * @param props - Component props
 * @param props.lang - Language code for localized content
 * @param props.direction - Text direction (ltr/rtl)
 * @returns CookieConsentBanner component or null if already consented
 */
const CookieConsentBanner = ({ lang, direction }: CookieConsentBannerProps): React.ReactElement | null => {
  const {
    hasConsented,
    acceptedCategories,
    isSettingsOpen,
    isDoNotTrackEnabled,
    acceptAll,
    rejectAll,
    saveCustom,
    closeSettings,
  } = useConsent()
  const [consentPage, setConsentPage] = useState<ConsentPageData | null>(null)
  const [categories, setCategories] = useState<ConsentCategoryItem[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  /** Whether the banner is displayed in edit mode (user re-opening to change preferences). */
  const isEditMode = hasConsented && isSettingsOpen

  /** Whether the banner should be visible at all. */
  const shouldShow = !hasConsented || isSettingsOpen

  const isRTL = direction === DirectionEnum.RTL

  // Fetch CMS data when banner should be visible
  useEffect(() => {
    if (!shouldShow) return

    const fetchData = async (): Promise<void> => {
      const [pageResult, categoriesResult] = await Promise.all([getConsentPage(lang), getConsentCategories(lang)])

      if (pageResult?.data) {
        setConsentPage(pageResult.data)
      }

      if (categoriesResult?.data) {
        setCategories(categoriesResult.data)

        // Pre-select required categories (first visit) or saved categories (edit mode)
        if (isEditMode) {
          setSelectedCategories(new Set(acceptedCategories))
          setShowSettings(true)
        } else {
          const requiredUids = new Set(categoriesResult.data.filter(c => c.required).map(c => c.uid))
          setSelectedCategories(requiredUids)
        }
      }

      setIsLoading(false)
    }

    void fetchData()
  }, [shouldShow, lang, isEditMode, acceptedCategories])

  // Auto-reject when Do Not Track is enabled and user has not yet consented
  useEffect(() => {
    if (!isDoNotTrackEnabled || hasConsented || isLoading || categories.length === 0) return

    const requiredUid = categories.find(c => c.required)?.uid
    if (!requiredUid) return

    const version = consentPage?.publishedAt ?? '1.0'
    rejectAll(requiredUid, version)
  }, [isDoNotTrackEnabled, hasConsented, isLoading, categories, consentPage, rejectAll])

  const consentVersion = consentPage?.publishedAt ?? '1.0'

  const allCategoryUids = categories.map(c => c.uid)
  const requiredCategory = categories.find(c => c.required)
  const requiredCategoryUid = requiredCategory?.uid

  const handleAcceptAll = useCallback(() => {
    acceptAll(allCategoryUids, consentVersion)
  }, [acceptAll, allCategoryUids, consentVersion])

  const handleRejectAll = useCallback(() => {
    if (!requiredCategoryUid) return
    rejectAll(requiredCategoryUid, consentVersion)
  }, [rejectAll, requiredCategoryUid, consentVersion])

  const handleSaveCustom = useCallback(() => {
    saveCustom(Array.from(selectedCategories), consentVersion)
  }, [saveCustom, selectedCategories, consentVersion])

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev)
  }, [])

  const handleCategoryToggle = useCallback((uid: string, required: boolean | null) => {
    if (required) return
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(uid)) {
        next.delete(uid)
      } else {
        next.add(uid)
      }
      return next
    })
  }, [])

  const handleClose = useCallback(() => {
    closeSettings()
    setShowSettings(false)
  }, [closeSettings])

  // Don't render if no required category found in CMS data (misconfiguration)
  if (!isLoading && categories.length > 0 && !categories.find(c => c.required)) return null
  // Don't render if already consented (unless in edit mode) or still loading
  if (hasConsented && !isSettingsOpen) return null
  if (isLoading || !consentPage) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-tertiary-700 bg-surface-dark p-4 shadow-lg sm:p-6"
    >
      <div className="mx-auto max-w-7xl">
        {/* Close button for edit mode */}
        {isEditMode && (
          <div className={`mb-2 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
            <button
              onClick={handleClose}
              aria-label="Close cookie settings"
              className="rounded-full p-1 text-text-secondary-dark transition-colors hover:text-text-main-dark focus:ring-2 focus:ring-focus-ring focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Banner content */}
        <div className="mb-4">
          <TextBlock data={asTextBlock(consentPage.consentInformation)} direction={direction} />
        </div>

        {/* Do Not Track indicator */}
        {isDoNotTrackEnabled && (
          <div className="mb-4" data-testid="dnt-notice">
            <TextBlock data={asTextBlock(consentPage.doNotTrackNotice)} direction={direction} />
          </div>
        )}

        {/* Action buttons */}
        <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <button
            onClick={handleAcceptAll}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-background-dark transition-colors hover:bg-primary-hover focus:ring-2 focus:ring-focus-ring focus:outline-none"
          >
            {consentPage.acceptAllButton.label?.text}
          </button>

          <button
            onClick={handleRejectAll}
            className="rounded-lg border border-tertiary-500 bg-transparent px-6 py-2.5 text-sm font-semibold text-text-main-dark transition-colors hover:border-tertiary-300 hover:bg-subtle-dark focus:ring-2 focus:ring-focus-ring focus:outline-none"
          >
            {consentPage.rejectAllButton.label?.text}
          </button>

          {!isEditMode && (
            <button
              onClick={handleToggleSettings}
              className="rounded-lg px-6 py-2.5 text-sm font-semibold text-text-secondary-dark underline-offset-2 transition-colors hover:text-text-main-dark hover:underline focus:ring-2 focus:ring-focus-ring focus:outline-none"
            >
              {consentPage.settingsButton.label?.text}
            </button>
          )}
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mt-4 rounded-lg border border-tertiary-700 bg-background-dark p-4">
            <div className="space-y-3">
              {categories.map(category => (
                <label
                  key={category.documentId}
                  className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category.uid)}
                      disabled={category.required === true}
                      onChange={() => {
                        handleCategoryToggle(category.uid, category.required)
                      }}
                      className="size-4 cursor-pointer rounded-sm border-tertiary-500 accent-primary disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <TextBlock data={asTextBlock(category.content)} direction={direction} />
                  </div>
                </label>
              ))}
            </div>

            <div className={`mt-4 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <button
                onClick={handleSaveCustom}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-background-dark transition-colors hover:bg-primary-hover focus:ring-2 focus:ring-focus-ring focus:outline-none"
              >
                {consentPage.saveButton.label?.text}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CookieConsentBanner
