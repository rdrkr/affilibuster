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
export { Icon, type IconProps, type ResolvedIcon } from '@/components/elements/Icon'
export { Image, type ImageProps } from '@/components/elements/Image'
export { DEFAULT_IMAGE, getAltText, resolveImageUrl } from '@/components/elements/imageUtils'
export { Text, resolveTextFormatHtml, type TextProps } from '@/components/elements/Text'

// Composite Components
export { TabbedView, type BackgroundVariant, type Tab, type TabLayout, type TabbedViewProps } from '@/components/layout'
export { Breadcrumbs, type BreadcrumbsProps } from '@/components/elements/Breadcrumbs'
export { ButtonAction, type ButtonActionProps } from '@/components/elements/ButtonAction'
export { ButtonLink, type ButtonLinkProps } from '@/components/elements/ButtonLink'
export { Card, type CardProps } from '@/components/elements/Card'
export { getVisibilityClasses } from '@/components/elements/common'
export { ContributorCard, type ContributorCardProps } from '@/components/elements/ContributorCard'
export { Header, type HeaderProps } from '@/components/elements/Header'
export { ImageGallery, type ImageGalleryProps } from '@/components/elements/ImageGallery'
export { Label, type LabelProps } from '@/components/elements/Label'
export { ScrollableTableWrapper, type ScrollableTableWrapperProps } from '@/components/elements/ScrollableTableWrapper'
export { ShortcutsGrid, type ShortcutsGridProps } from '@/components/elements/ShortcutsGrid'
export { DynamicTextBlock } from '@/components/elements/DynamicTextBlock'
export { TextBlock, type TextBlockProps } from '@/components/elements/TextBlock'
