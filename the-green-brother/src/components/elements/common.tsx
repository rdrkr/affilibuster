// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Button Common Utilities
 *
 * Shared types, styles, and utility functions for ButtonAction and ButtonLink components.
 * This ensures consistency across both interactive (client) and navigation (server/client) buttons.
 */

import type { ReactNode } from 'react'

import { DirectionEnum, type ElementsLabelEntry } from '@/lib/generated/types.gen'
import { Label } from './Label'

/**
 * Button variant styles
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost-1'
  | 'ghost-2'
  | 'ghost-3'
  | 'link-1'
  | 'link-2'
  | 'scroll-arrow'

/**
 * Button size options
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

/**
 * Icon size options
 */
const iconSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const
export type IconSize = (typeof iconSizes)[number]

/**
 * Check if a value is a valid IconSize
 * @param value - Value to check
 * @returns True if the value is a valid IconSize, false otherwise
 */
export function isIconSize(value: unknown): value is IconSize {
  return typeof value === 'string' && iconSizes.includes(value as IconSize)
}

/**
 * Get CSS classes for button variant
 * @param variant - Button variant
 * @param isActive - Whether the button is currently active
 * @param noAnimation - Whether to disable animation for link variant
 * @param direction - Text direction for RTL/LTR layout
 * @param hasIcon - Whether the button has an icon (affects ghost-2 justification)
 * @returns Tailwind CSS classes
 */
export function getVariantClasses(
  variant: ButtonVariant,
  isActive: boolean,
  noAnimation: boolean,
  direction: DirectionEnum,
  hasIcon: boolean
): string {
  const isRTL = direction === DirectionEnum.RTL
  const variants: Record<ButtonVariant, string> = {
    primary: `
      cursor-pointer transform
      ${isRTL ? 'ms-0.5 me-1.5' : 'ms-1.5 me-0.5'}
      bg-primary text-background-dark font-bold
      hover:bg-primary-hover active:bg-primary-700
      disabled:bg-tertiary-500 disabled:cursor-not-allowed
    `,
    secondary: `
      cursor-pointer
      bg-black/5 text-primary font-semibold text-shadow-sm
      dark:bg-white/5 dark:text-shadow-none
      hover:bg-primary hover:text-background-dark active:bg-primary-600
      disabled:bg-tertiary-500 disabled:text-tertiary-500 disabled:cursor-not-allowed
    `,
    outline: `
      cursor-pointer
      border-2 border-primary text-primary font-bold text-shadow-sm
      dark:text-shadow-none
      hover:bg-primary hover:text-background-dark active:bg-primary-600
      disabled:border-tertiary-500 disabled:text-tertiary-500 disabled:cursor-not-allowed
    `,
    'ghost-1': `
      cursor-pointer
      font-medium bg-transparent whitespace-nowrap rounded-full
      transition-colors
      ${
        isActive
          ? `text-primary text-shadow-sm dark:text-primary dark:text-shadow-none`
          : `text-black dark:text-text-secondary-dark`
      }
      hover:bg-transparent hover:text-primary hover:text-shadow-sm dark:hover:text-shadow-none
      active:text-primary-600 dark:active:text-primary-400
      disabled:text-tertiary-500 disabled:cursor-not-allowed
      ${
        noAnimation
          ? ''
          : `
          [&]:inline-flex [&]:overflow-hidden [&]:whitespace-nowrap
          [&]:transition-all [&]:duration-300 [&]:ease-out
          [&>span]:inline-flex [&>span]:overflow-hidden [&>span]:whitespace-nowrap
          [&>span]:transition-all [&>span]:duration-300 [&>span]:ease-out
          [&>span>span]:inline-flex [&>span>span]:overflow-hidden [&>span>span]:whitespace-nowrap
          [&>span>span]:transition-all [&>span>span]:duration-300 [&>span>span]:ease-out
          `
      }
    `,
    'ghost-2': `
      cursor-pointer
      flex w-full items-center justify-center ${hasIcon ? (isRTL ? 'sm:justify-end' : 'sm:justify-start') : ''}
      font-medium whitespace-nowrap rounded-full
      transition-colors text-neutral-700 dark:text-white
      ${isActive ? `bg-neutral-100 dark:bg-white/5` : `bg-transparent`}
      hover:bg-neutral-100 dark:hover:bg-white/10
      active:bg-neutral-200 dark:active:bg-white/20
      disabled:text-tertiary-500 disabled:cursor-not-allowed
    `,
    'ghost-3': `
      cursor-pointer
      font-medium whitespace-nowrap rounded-full
      transition-colors
      ${
        isActive
          ? `bg-primary text-background-dark hover:bg-primary-hover active:bg-primary-700`
          : `bg-neutral-100 text-neutral-700 dark:bg-white/5 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/10 active:bg-neutral-300 dark:active:bg-white/20`
      }
      disabled:text-tertiary-500 disabled:cursor-not-allowed
    `,
    'link-1': `
      cursor-pointer
      font-medium font-semibold no-underline
      text-primary text-shadow-sm hover:text-primary-hover active:text-primary-600
      dark:text-primary dark:text-shadow-none dark:hover:text-primary-hover dark:active:text-primary-400
      disabled:text-tertiary-500 disabled:cursor-not-allowed
      ${
        noAnimation
          ? ''
          : 'transition-all duration-300 hover:scale-105 hover:text-shadow-shimmer disabled:hover:scale-100 active:scale-95'
      }
    `,
    'link-2': `
      cursor-pointer
      font-medium no-underline
      text-neutral-600 hover:text-neutral-800 active:text-neutral-900
      dark:text-text-secondary-dark dark:hover:text-text-main-dark dark:active:text-white
      disabled:text-tertiary-500 disabled:cursor-not-allowed
      ${
        noAnimation
          ? ''
          : 'transition-all duration-300 hover:scale-105 hover:text-shadow-shimmer disabled:hover:scale-100 active:scale-95'
      }
    `,
    'scroll-arrow': `
      cursor-pointer
      rounded-full! border
      border-neutral-200 bg-white/50
      shadow-lg backdrop-blur-sm
      transition-opacity duration-300 ease-in-out
      hover:bg-white/70 active:bg-white/90
      dark:border-white/10 dark:bg-neutral-800/30
      dark:hover:bg-neutral-800/50 dark:active:bg-neutral-800/70
    `,
  }
  return variants[variant]
}

/**
 * Get CSS classes for button dimensions (padding, rounded, min-width)
 * @param size - Button size
 * @returns Tailwind CSS classes
 */
export function getSizeDimensions(size: ButtonSize): string {
  const sizes: Record<ButtonSize, string> = {
    xs: 'py-0.5 px-2 rounded-lg min-w-[38px] min-h-[38px]',
    sm: 'py-1.5 px-3 rounded-xl min-w-[46px] min-h-[46px]',
    md: 'py-2 px-4 rounded-xl min-w-[52px] min-h-[52px]',
    lg: 'py-3 px-5 rounded-xl min-w-[62px] min-h-[62px]',
    xl: 'py-4 px-6 rounded-2xl min-w-[66px] min-h-[66px]',
    '2xl': 'py-5 px-7 rounded-2xl min-w-[72px] min-h-[72px]',
    '3xl': 'py-6 px-8 rounded-3xl min-w-[82px] min-h-[82px]',
  }
  return sizes[size]
}

/**
 * Get CSS classes for button text size
 * @param size - Button size
 * @returns Tailwind CSS classes
 */
export function getSizeText(size: ButtonSize): string {
  const sizes: Record<ButtonSize, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  }
  return sizes[size]
}

/**
 * Params for computing button base classes
 */
export interface ButtonBaseClassesParams {
  /** Button visual variant */
  variant: ButtonVariant
  /** Button size */
  size: ButtonSize
  /** Whether the button is currently active */
  isActive: boolean
  /** Disable hover animations for link variant */
  noAnimation: boolean
  /** Enable animated text visibility */
  showText: boolean
  /** Text direction for RTL/LTR layout */
  direction: DirectionEnum
  /** Whether the button has an icon (affects ghost-2 justification) */
  hasIcon: boolean
  /** Additional CSS classes */
  className: string
}

/**
 * Get CSS classes for animated visibility
 * @param visible - Whether the element should be visible (default: true)
 * @param direction - Text direction for LTR/RTL support (default: LTR)
 * @param slideDirection - Animation slide direction (default: 'end-to-start')
 * @returns Tailwind CSS classes
 */
export function getVisibilityClasses(
  visible: boolean | undefined = true,
  direction: DirectionEnum = DirectionEnum.LTR,
  slideDirection: 'start-to-end' | 'end-to-start' = 'end-to-start'
): string {
  const isRTL = direction === DirectionEnum.RTL

  // Logic for translate direction based on slideDirection and RTL
  let translateClass = ''

  if (slideDirection === 'end-to-start') {
    translateClass = isRTL ? 'translate-x-4' : '-translate-x-4'
  } else {
    translateClass = isRTL ? '-translate-x-4' : 'translate-x-4'
  }

  return visible
    ? 'translate-x-0'
    : `w-0! min-w-0! !p-0 !m-0 opacity-0 overflow-hidden pointer-events-none ${translateClass}`
}

/**
 * Compute base CSS classes for button components
 * Shared logic between ButtonAction and ButtonLink
 * @param params - Button styling parameters
 * @returns Computed CSS classes string
 */
export function getButtonBaseClasses(params: ButtonBaseClassesParams): string {
  const { variant, size, isActive, noAnimation, showText, direction, hasIcon, className } = params

  return `
    inline-flex items-center justify-center transition-all duration-300 w-fit
    ${!showText ? 'gap-0' : 'gap-2'}
    ${getVariantClasses(variant, isActive, noAnimation, direction, hasIcon)}
    ${getSizeText(size)}
    ${variant === 'link-1' || variant === 'link-2' ? 'p-0' : getSizeDimensions(size)}
    ${!showText ? '!px-0' : ''}
    ${className}
  `
}

/**
 * Params for composing button content
 */
export interface ComposeButtonContentParams {
  /** Label data from CMS */
  label: ElementsLabelEntry | undefined
  /** Custom children to append to label */
  children: ReactNode
  /** Text direction for RTL/LTR layout */
  direction: DirectionEnum
  /** Icon size */
  iconSize: IconSize
  /** Enable animated text visibility */
  showText?: boolean | undefined
  /** Position of children relative to label */
  childrenPosition?: 'start' | 'end'
  /** Use masked icon for local icons */
  maskedIcon?: boolean
  /** Additional CSS classes for the label text */
  textClassName?: string
  /** Load icon with high priority (for LCP optimization) */
  iconPriority?: boolean
}

/**
 * Compose button content with label and children
 * Handles RTL ordering: LTR = label then children, RTL = children then label
 * Shared logic between ButtonAction and ButtonLink
 * @param params - Content composition parameters
 * @returns Composed React node or null if no content
 */
export function composeButtonContent(params: ComposeButtonContentParams): ReactNode {
  const {
    label,
    children,
    direction,
    iconSize,
    showText,
    childrenPosition = 'end',
    maskedIcon,
    textClassName,
    iconPriority,
  } = params

  let content: ReactNode = children

  // Return null if no content and no label
  if (!content && !label) {
    return null
  }

  // When label exists, append children to it
  if (label) {
    // Determine order based on direction and childrenPosition
    // childrenPosition 'end' (default):
    //   LTR: Label -> Children
    //   RTL: Children -> Label
    // childrenPosition 'start':
    //   LTR: Children -> Label
    //   RTL: Label -> Children

    const isRtl = direction === DirectionEnum.RTL
    const isChildrenAtStart = childrenPosition === 'start'

    // Effectively, we swap strict "Label First" logic if children should be at start
    // Logic table for "Children First in DOM":
    // | RTL | Start | Children First? |
    // |  F  |   F   |       F         | (Label -> Children)
    // |  F  |   T   |       T         | (Children -> Label)
    // |  T  |   F   |       T         | (Children -> Label) (RTL visual swap handled by flex-row/reversed semantics usually, but here doing manual DOM order)
    //
    // WAIT: The previous logic was:
    // const isRtl = direction === DirectionEnum.RTL
    // LTR: Label -> Children
    // RTL: Children -> Label (swapped in DOM)
    // This assumes the container DOES NOT have dir="rtl" or flex-row-reverse distinct from this.
    // Actually, `Label` has `dir={isRtl ? 'rtl' : 'ltr'}` but `ButtonAction` just puts things in flex.
    // If we want "start" to mean "visually before label", then in LTR it should be [Children, Label].
    // If we want "end" to mean "visually after label", then in LTR it should be [Label, Children].

    const labelElement = (
      <Label
        data={label}
        direction={direction}
        as="span"
        iconSize={iconSize}
        display="inline"
        className={`items-center justify-center ${showText === false ? 'gap-0!' : ''}`}
        showText={showText ?? true}
        maskedIcon={maskedIcon ?? false}
        textClassName={textClassName ?? ''}
        iconPriority={iconPriority ?? false}
      />
    )

    const renderChildrenFirst = (!isRtl && isChildrenAtStart) || (isRtl && !isChildrenAtStart)

    content = (
      <>
        {renderChildrenFirst ? children : labelElement}
        {renderChildrenFirst ? labelElement : children}
      </>
    )
  }

  return content
}
