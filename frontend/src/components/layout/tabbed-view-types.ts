// Copyright (c) 2026 Affilibuster by Ronen Druker.

import type { ReactNode } from 'react'

import { CarouselGap } from '@/components/layout/Carousel'
import { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Tab bar layout mode
 * - 'scroll': Horizontal scroll carousel (default)
 * - 'fill': Tabs fill available parent width with adaptive button widths
 */
export type TabLayout = 'scroll' | 'fill'

/**
 * Background variant for the tabbed view container
 * - 'none': No background styling (default)
 * - 'tabs': Background only on the tab bar (with sliding pill)
 * - 'content': Background only on the tab panel content
 * - 'separate': Background on both tab bar and tab panel, each in its own container (with sliding pill)
 * - 'all': Background on both tab bar and tab panel in a single shared container
 */
export type BackgroundVariant = 'none' | 'tabs' | 'content' | 'separate' | 'all'

/**
 * Individual tab configuration
 */
export interface Tab<T = unknown> {
  /** Unique identifier for the tab */
  key: string
  /** Tab button content (can be string or ReactNode) */
  label: ReactNode
  /** Tab panel content */
  content: ReactNode
  /** Optional associated data */
  data?: T
}

/**
 * Props for the TabbedView component
 */
export interface TabbedViewProps<T = unknown> {
  /** Array of tab configurations */
  tabs: Tab<T>[]
  /** Currently active tab key */
  activeKey: string
  /** Callback when tab selection changes */
  onTabChange: (key: string) => void
  /** Text direction for RTL/LTR layout */
  direction: DirectionEnum
  /** Gap between tab buttons (default: 'sm') */
  carouselGap?: CarouselGap
  /** Additional CSS classes for the container */
  className?: string
  /** Content rendered after tab bar (e.g., filters, sort controls) */
  afterTabBar?: ReactNode
  /** When false, only renders tab bar without panel content (default: true) */
  showPanel?: boolean
  /** Tab bar layout mode: 'scroll' for carousel, 'fill' for full-width adaptive buttons (default: 'scroll') */
  tabLayout?: TabLayout
  /** Background variant: 'none' (default), 'tabs' (tab bar only), 'content' (panel only), 'separate' (each in own container), 'all' (shared container) (default: 'none') */
  backgroundVariant?: BackgroundVariant
  /** When false, disables auto-scroll to active tab in carousel (default: true) */
  autoScroll?: boolean
}
