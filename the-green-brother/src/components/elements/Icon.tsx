// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Icon Component
 *
 * Renders either a local image icon or Material Symbol based on CMS icon data.
 * Supports both local SVG/image icons and Material Symbols icons.
 */

import NextImage from 'next/image'
import { IconSize } from './common'

/**
 * Icon resolution result indicating whether the icon is a local file or Material Symbol.
 */
export interface ResolvedIcon {
  /** Type of icon - 'local' for file path, 'material' for Material Symbols */
  type: 'local' | 'material'
  /** The resolved value - file path for local, icon name for material */
  value: string
}

/**
 * Convert icon name to Material Symbols format.
 *
 * Material Symbols expects icon names in lowercase with underscores (e.g., 'account_circle').
 * CMS might store them in various formats:
 * - Title Case with spaces: "Account Circle"
 * - Title Case: "AccountCircle"
 * - Already correct: "account_circle"
 * @param iconName - Icon name from CMS (may have spaces or mixed case)
 * @returns Icon name in Material Symbols format (lowercase with underscores)
 * @example
 * ```typescript
 * toMaterialIcon('Account Circle') // returns 'account_circle'
 * toMaterialIcon('account_circle') // returns 'account_circle'
 * toMaterialIcon('ViewList') // returns 'view_list'
 * ```
 */
function toMaterialIcon(iconName: string): string {
  // Replace spaces with underscores and convert to lowercase
  return iconName
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/([a-z])([A-Z])/g, '$1_$2') // Handle PascalCase: insert underscore before capitals
    .toLowerCase()
}

/**
 * Resolve an icon string to either a local file path or Material Symbols name.
 *
 * If the icon has a file extension (e.g., '.svg', '.png'), it's treated as a local icon
 * and returns the path to `/icons/{filename}`.
 * Otherwise, it's treated as a Material Symbol and converted to the proper format.
 * @param icon - Icon name from CMS (either a filename or Material Symbol name)
 * @returns Resolved icon with type and value, or null if no icon
 * @example
 * ```typescript
 * resolveIcon('brand.svg')      // { type: 'local', value: '/icons/brand.svg' }
 * resolveIcon('home')           // { type: 'material', value: 'home' }
 * resolveIcon('Account Circle') // { type: 'material', value: 'account_circle' }
 * resolveIcon(null)             // null
 * ```
 */
function resolveIcon(icon: string | undefined | null): ResolvedIcon | null {
  if (!icon) {
    return null
  }

  const trimmed = icon.trim()
  if (!trimmed) {
    return null
  }

  // Check if it's a local file (has file extension)
  const fileExtensionMatch = /\.(svg|png|jpg|jpeg|gif|webp|ico)$/i.exec(trimmed)
  if (fileExtensionMatch) {
    return {
      type: 'local',
      value: `/icons/${trimmed}`,
    }
  }

  // Otherwise, treat as Material Symbol
  return {
    type: 'material',
    value: toMaterialIcon(trimmed),
  }
}

/**
 * Props for the Icon component
 */
export interface IconProps {
  /** Icon name from CMS - either a filename (e.g., 'brand.svg') or Material Symbol name */
  icon: string | undefined | null
  /** Size class for the icon (defaults to 'text-xl' for material, 24x24 for local) */
  size?: IconSize
  /** Additional CSS classes */
  className?: string
  /** Aria label for accessibility */
  ariaLabel?: string
  /** When true, renders the icon larger with a circular background */
  promoted?: boolean
  /** Controls visibility - when false, element is hidden from layout */
  visible?: boolean
  /** When true, renders the icon as a mask with current text color (only for local icons) */
  masked?: boolean
  /** When true, loads the icon with high priority (for LCP optimization, local icons only) */
  priority?: boolean
}

/**
 * Size mappings for different icon sizes (in pixels)
 */
const sizeMappings = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
  '6xl': 72,
}

/**
 * Renders an icon, automatically detecting if it's a local file or Material Symbol.
 * @param props - Icon component props
 * @param props.icon - Icon name from CMS (filename or Material Symbol name)
 * @param props.size - Size class for the icon
 * @param props.className - Additional CSS classes
 * @param props.ariaLabel - Aria label for accessibility
 * @param props.promoted - When true, renders the icon larger with a circular background
 * @param props.visible - Controls visibility (false = hidden from layout)
 * @param props.masked - When true, renders local icon as a mask to inherit color
 * @param props.priority - When true, loads local icon with high priority (for LCP)
 * @returns Icon element or null if no icon or not visible
 * @example
 * ```tsx
 * <Icon icon="brand.svg" size="lg" priority />
 * <Icon icon="social.svg" size="md" masked />
 * <Icon icon="home" size="md" />
 * <Icon icon="Account Circle" />
 * <Icon icon="menu" visible={isMenuVisible} />
 * ```
 */
export function Icon({
  icon,
  size = 'lg',
  className = '',
  ariaLabel,
  promoted = false,
  visible,
  masked = false,
  priority = false,
}: IconProps) {
  const resolved = resolveIcon(icon)

  if (!resolved || visible === false) {
    return null
  }

  // Use larger size when promoted
  const effectiveSize = promoted ? 'xl' : size
  const sizeValue = sizeMappings[effectiveSize]

  // Promoted styling: circular background with fixed size for perfect circle
  // Calculate container size: icon size + 2 * padding
  const promotedContainerSize = sizeValue + 24 // p-3 = 12px on each side = 24px total
  const promotedClasses = promoted ? 'inline-flex items-center justify-center rounded-full bg-primary/10 shrink-0' : ''
  const promotedStyle = promoted
    ? { width: `${String(promotedContainerSize)}px`, height: `${String(promotedContainerSize)}px` }
    : {}

  if (resolved.type === 'local') {
    // If masked is true, render as a colored div with mask-image
    // This allows the icon to take the current text color (bg-current)
    if (masked) {
      const maskStyle = {
        maskImage: `url(${resolved.value})`,
        WebkitMaskImage: `url(${resolved.value})`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        width: `${String(sizeValue)}px`,
        height: `${String(sizeValue)}px`,
        backgroundColor: 'currentColor',
      }

      const maskElement = (
        <span
          className={`
             inline-block bg-current
             ${promoted ? '' : className}
          `}
          style={maskStyle}
          role="img"
          aria-label={ariaLabel ?? ''}
          aria-hidden={!ariaLabel}
        />
      )

      if (promoted) {
        return (
          <span className={`${promotedClasses} ${className}`} style={promotedStyle}>
            {maskElement}
          </span>
        )
      }

      return maskElement
    }

    const imageElement = (
      <NextImage
        src={resolved.value}
        alt={ariaLabel ?? ''}
        width={sizeValue}
        height={sizeValue}
        priority={priority}
        className={`
          drop-shadow-icon-sm dark:drop-shadow-none
          ${promoted ? '' : className}
        `}
        aria-hidden={!ariaLabel}
      />
    )

    if (promoted) {
      return (
        <span className={`${promotedClasses} ${className}`} style={promotedStyle}>
          {imageElement}
        </span>
      )
    }

    return imageElement
  }

  // Material Symbol - use inline style for precise font-size control
  const materialIcon = (
    <span
      className={`
        material-symbols-outlined-bold
        ${promoted ? 'text-primary text-shadow-sm dark:text-shadow-none' : className}
      `}
      style={{ fontSize: `${String(sizeValue)}px` }}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    >
      {resolved.value}
    </span>
  )

  if (promoted) {
    return (
      <span className={`${promotedClasses} ${className}`} style={promotedStyle}>
        {materialIcon}
      </span>
    )
  }

  return materialIcon
}

export default Icon
