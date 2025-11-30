// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Elements Barrel Export
 *
 * Exports all shared CMS-driven components and functions.
 *
 * Primitives (1:1 with Strapi fields):
 * - CMSText → Strapi text field
 * - CMSIcon → Strapi icon string field
 * - CMSImage → Strapi media field
 *
 * Composites (1:1 with Strapi components):
 * - Label → elements.label (icon + text + ariaDescription)
 * - Header → elements.header (header Label + subheader Label + alignment)
 * - Button → elements.button (icon + text + url + openInNewTab + ariaDescription)
 * - TextBlock → elements.text-block (header + rich text content)
 */

// Primitive Components
export { CMSIcon, resolveIcon, type CMSIconProps, type ResolvedIcon } from './CMSIcon'
export { CMSImage, type CMSImageProps, type CMSMedia } from './CMSImage'
export { CMSText, resolveTextFormatHtml, type CMSTextProps } from './CMSText'

// Composite Components
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './Button'
export { Header, type HeaderProps } from './Header'
export { Label, type LabelProps } from './Label'
export { TextBlock, type TextBlockProps } from './TextBlock'
