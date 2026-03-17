// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * CookieSettingsAction Component
 *
 * A thin client wrapper around ButtonAction that opens the cookie consent
 * banner in edit mode. Used in server components (e.g. Footer) where
 * an onClick handler is needed for GDPR Art. 7(3) consent withdrawal.
 */

import { useCallback } from 'react'

import { ButtonAction } from '@/components/elements'
import { openCookieSettings } from '@/lib/consent'
import type { DirectionEnum, ElementsButtonEntry } from '@/lib/generated/types.gen'

import type { ButtonSize, ButtonVariant } from '@/components/elements/common'

/** Props for the CookieSettingsAction component. */
interface CookieSettingsActionProps {
  /** Button data from CMS (label, icon, etc.) */
  data: ElementsButtonEntry
  /** Text direction for RTL/LTR layout */
  direction: DirectionEnum
  /** Button visual variant (default: link-2) */
  variant?: ButtonVariant
  /** Button size (default: xs) */
  size?: ButtonSize
}

/**
 * Button that opens the cookie consent settings banner in edit mode.
 *
 * Wraps ButtonAction with the openCookieSettings handler.
 * Designed for use in server components (e.g. Footer) where
 * an onClick handler cannot be passed inline.
 * @param props - Component props
 * @param props.data - Button data from CMS
 * @param props.direction - Text direction
 * @param props.variant - Visual variant (default: link-2)
 * @param props.size - Button size (default: xs)
 * @returns CookieSettingsAction component
 */
const CookieSettingsAction = ({
  data,
  direction,
  variant = 'link-2',
  size = 'xs',
}: CookieSettingsActionProps): React.ReactElement | null => {
  const handleClick = useCallback(() => {
    openCookieSettings()
  }, [])

  return <ButtonAction data={data} direction={direction} variant={variant} size={size} onClick={handleClick} />
}

export default CookieSettingsAction
