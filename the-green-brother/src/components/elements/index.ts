// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Elements Barrel Export
 *
 * Exports all shared CMS-driven components and functions.
 *
 * Primitives (1:1 with Strapi fields):
 * - Text → Strapi text field
 * - Icon → Strapi icon string field
 * - Image → Strapi media field
 *
 * Composites (1:1 with Strapi components):
 * - Label → elements.label (icon + text + ariaDescription)
 * - Header → elements.header (header Label + subheader Label + alignment)
 * - Button → elements.button (icon + text + url + openInNewTab + ariaDescription)
 * - TextBlock → elements.text-block (header + rich text content)
 */

// Primitive Components
export { Icon, type IconProps, type ResolvedIcon } from './Icon'
export { DEFAULT_IMAGE, Image, type ImageProps } from './Image'
export { Text, resolveTextFormatHtml, type TextProps } from './Text'

// Composite Components
export { Breadcrumbs, type BreadcrumbsProps } from './Breadcrumbs'
export { ButtonAction, type ButtonActionProps } from './ButtonAction'
export { ButtonLink, type ButtonLinkProps } from './ButtonLink'
export { Card, type CardProps } from './Card'
export { getVisibilityClasses } from './common'
export { ContributorCard, type ContributorCardProps } from './ContributorCard'
export { Header, type HeaderProps } from './Header'
export { ImageGallery, type ImageGalleryProps } from './ImageGallery'
export { Label, type LabelProps } from './Label'
export { ScrollableTableWrapper, type ScrollableTableWrapperProps } from './ScrollableTableWrapper'
export { ShortcutsGrid, type ShortcutsGridProps } from './ShortcutsGrid'
export { TabbedView, type Tab, type TabbedViewProps } from './TabbedView'
export { TextBlock, type TextBlockProps } from './TextBlock'
