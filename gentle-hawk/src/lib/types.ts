// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Centralized Type Exports
 *
 * Re-exports and derives commonly used types from generated OpenAPI types
 * for convenient importing across GentleHawk.
 */

import { LanguageCode, DirectionEnum } from './generated/types.gen'

/**
 * Language code enum - re-exported from OpenAPI generated LanguageCode.
 * @example
 * ```typescript
 * const code = LanguageCode.EN
 * ```
 */
export { LanguageCode }

/**
 * Text direction enum - alias for OpenAPI generated DirectionEnum.
 * @example
 * ```typescript
 * const direction = Direction.LTR
 * ```
 */
export const Direction = DirectionEnum

/**
 * Direction type for type annotations.
 */
export type Direction = DirectionEnum

/**
 * Array of all supported language codes.
 */
export const SUPPORTED_LANGUAGE_CODES = Object.values(LanguageCode)

/**
 * Default language code used as fallback.
 */
export const DEFAULT_LANGUAGE_CODE = LanguageCode.EN

/**
 * Check if a string is a valid language code.
 * @param value - The value to check
 * @returns True if the value is a valid language code
 */
export function isLanguageCode(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGE_CODES.includes(value as LanguageCode)
}

// Re-export navigation type
export type { ApiNavigationNavigationDocument } from './generated/types.gen'
