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

import { ButtonAction, TextBlock } from '@/components/elements'
import { frostedGlassStyle } from '@/components/elements/common'
import { getConsentCategories, getConsentPage, useConsent } from '@/lib/consent'
import type {
  ConsentCategoryGetConsentCategoriesResponses,
  ConsentGetConsentResponses,
  ElementsTextBlockEntry,
} from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'
import { useCallback, useEffect, useState } from 'react'

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
  const [isClosing, setIsClosing] = useState(false)
  const [prevIsSettingsOpen, setPrevIsSettingsOpen] = useState(false)

  /** Duration of the slide-down exit animation in milliseconds. */
  const CLOSE_ANIMATION_MS = 300

  /** Whether the banner is displayed in edit mode (user re-opening to change preferences). */
  const isEditMode = hasConsented && isSettingsOpen

  /** Whether the banner should be visible at all. */
  const shouldShow = !hasConsented || isSettingsOpen

  const isRTL = direction === DirectionEnum.RTL

  // Fetch CMS data when banner should be visible
  useEffect(() => {
    if (!shouldShow) return
    if (consentPage && categories.length > 0) return // Skip fetching if already loaded

    const fetchData = async (): Promise<void> => {
      const [pageResult, categoriesResult] = await Promise.all([getConsentPage(lang), getConsentCategories(lang)])

      if (pageResult?.data) {
        setConsentPage(pageResult.data)
      }

      if (categoriesResult?.data) {
        setCategories(categoriesResult.data)

        // Pre-select required categories on first visit
        // Edit mode state is handled synchronously in a separate effect below
        if (!isEditMode) {
          const requiredUids = new Set(categoriesResult.data.filter(c => c.required).map(c => c.uid))
          setSelectedCategories(requiredUids)
        }
      }

      setIsLoading(false)
    }

    void fetchData()
  }, [shouldShow, lang, isEditMode, consentPage, categories.length])

  // Synchronously set up edit mode state to prevent settings panel pop-in
  if (isSettingsOpen && !prevIsSettingsOpen && categories.length > 0) {
    setPrevIsSettingsOpen(true)
    setShowSettings(true)
    setSelectedCategories(new Set(acceptedCategories))
  } else if (!isSettingsOpen && prevIsSettingsOpen) {
    setPrevIsSettingsOpen(false)
  }

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

  /**
   * Plays the slide-down exit animation, then executes the dismiss action.
   * @param action - The callback to run after the animation completes
   */
  const dismissWithAnimation = useCallback(
    (action: () => void) => {
      setIsClosing(true)
      setTimeout(() => {
        action()
        setIsClosing(false)
      }, CLOSE_ANIMATION_MS)
    },
    [CLOSE_ANIMATION_MS]
  )

  const handleAcceptAll = useCallback(() => {
    dismissWithAnimation(() => {
      acceptAll(allCategoryUids, consentVersion)
    })
  }, [dismissWithAnimation, acceptAll, allCategoryUids, consentVersion])

  const handleRejectAll = useCallback(() => {
    if (!requiredCategoryUid) return
    dismissWithAnimation(() => {
      rejectAll(requiredCategoryUid, consentVersion)
    })
  }, [dismissWithAnimation, rejectAll, requiredCategoryUid, consentVersion])

  const handleSaveCustom = useCallback(() => {
    dismissWithAnimation(() => {
      saveCustom(Array.from(selectedCategories), consentVersion)
    })
  }, [dismissWithAnimation, saveCustom, selectedCategories, consentVersion])

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
    dismissWithAnimation(() => {
      closeSettings()
      setShowSettings(false)
    })
  }, [dismissWithAnimation, closeSettings])

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
      className={`fixed inset-x-4 bottom-8 z-50 mx-auto max-w-6xl p-8 sm:inset-x-6 sm:p-6
        ${frostedGlassStyle}
        rounded-xl! bg-white/80! dark:bg-surface-dark/80!
        ${isClosing ? 'animate-[slideDownOut_0.3s_ease-in_forwards]' : 'animate-[slideUp_0.3s_ease-out_forwards]'}
      `}
    >
      <div className="relative">
        {/* Close button for edit mode — positioned at top corner */}
        {isEditMode && (
          <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'}`}>
            <ButtonAction
              data={consentPage.exitButton}
              direction={direction}
              variant="ghost-2"
              iconSize="sm"
              size="sm"
              onClick={handleClose}
              showText={false}
            />
          </div>
        )}

        {/* Banner content */}
        <TextBlock
          data={asTextBlock(consentPage.consentInformation)}
          headerLevel={3}
          headerIconSize="xl"
          direction={direction}
          className="mb-4 prose-headings:mb-2!"
        />

        {/* Do Not Track indicator */}
        {isDoNotTrackEnabled && (
          <TextBlock
            data={asTextBlock(consentPage.doNotTrackNotice)}
            headerLevel={5}
            direction={direction}
            className={`
              -mt-2 mb-4 rounded-xl border border-neutral-200 p-4
              shadow-lg dark:border-white/5
              dark:shadow-none prose-headings:mb-0!
            `}
            data-testid="dnt-notice"
          />
        )}

        {/* Action buttons */}
        <div className={`flex flex-row flex-wrap justify-start gap-3`} dir={isRTL ? 'rtl' : 'ltr'}>
          <ButtonAction
            flex-w
            data={consentPage.acceptAllButton}
            direction={direction}
            variant="primary"
            size="sm"
            onClick={handleAcceptAll}
          />

          <ButtonAction
            data={consentPage.rejectAllButton}
            direction={direction}
            variant="outline"
            size="sm"
            onClick={handleRejectAll}
          />

          {!isEditMode && (
            <ButtonAction
              data={consentPage.settingsButton}
              direction={direction}
              variant="link-2"
              size="sm"
              onClick={handleToggleSettings}
            />
          )}
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div
            className={`
              mt-4 rounded-xl border
              border-neutral-200
              p-8 shadow-lg
              dark:border-white/5 dark:shadow-none
            `}
          >
            <div className="space-y-3">
              {categories.map(category => (
                <label key={category.documentId} className={`flex flex-row items-start gap-3`}>
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category.uid)}
                      disabled={category.required === true}
                      onChange={() => {
                        handleCategoryToggle(category.uid, category.required)
                      }}
                      className={`
                        size-4 cursor-pointer rounded-full
                        border-tertiary-500 accent-primary
                        disabled:cursor-not-allowed disabled:opacity-60
                      `}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <TextBlock
                      data={asTextBlock(category.content)}
                      direction={direction}
                      headerLevel={5}
                      className="prose-headings:mb-0!"
                    />
                  </div>
                </label>
              ))}
            </div>

            <div className={`mt-2 flex justify-end`}>
              <ButtonAction
                data={consentPage.saveButton}
                direction={direction}
                variant="primary"
                size="sm"
                onClick={handleSaveCustom}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CookieConsentBanner
