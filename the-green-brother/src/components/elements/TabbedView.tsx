// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * TabbedView Component
 *
 * A reusable tabbed view component that combines a horizontally scrollable tab bar
 * with content panels. Uses Carousel for the tab bar and native buttons for tabs.
 * Supports RTL layouts and accessibility features (tablist, tab, tabpanel roles).
 */

import type { ReactNode } from 'react'

import { Carousel, type CarouselGap } from '@/components/layout/Carousel'
import { DirectionEnum } from '@/lib/generated/types.gen'

import { ButtonAction } from './ButtonAction'

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
}

/**
 * TabbedView component for displaying content in tabs with a horizontally scrollable tab bar.
 *
 * Features:
 * - Horizontally scrollable tabs via Carousel
 * - Proper accessibility with tablist, tab, and tabpanel roles
 * - RTL layout support
 * - Active state styling via ButtonAction ghost-3 variant
 * - Optional afterTabBar content for additional controls
 * - Optional showPanel prop to render tab bar only
 * @param props - Component props
 * @param props.tabs - Array of tab configurations
 * @param props.activeKey - Currently active tab key
 * @param props.onTabChange - Callback when tab selection changes
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.carouselGap - Gap between tab buttons (default: 'sm')
 * @param props.className - Additional CSS classes for the container
 * @param props.afterTabBar - Content rendered after tab bar (e.g., filters, sort controls)
 * @param props.showPanel - When false, only renders tab bar without panel content (default: true)
 * @returns TabbedView component
 * @example
 * ```tsx
 * <TabbedView
 *   tabs={[
 *     { key: 'tab1', label: 'First', content: <div>Content 1</div> },
 *     { key: 'tab2', label: 'Second', content: <div>Content 2</div> },
 *   ]}
 *   activeKey="tab1"
 *   onTabChange={(key) => setActiveKey(key)}
 *   direction={DirectionEnum.LTR}
 * />
 * ```
 */
export function TabbedView<T = unknown>({
  tabs,
  activeKey,
  onTabChange,
  direction,
  carouselGap = 'sm',
  className = '',
  afterTabBar,
  showPanel = true,
}: TabbedViewProps<T>) {
  const isRTL = direction === DirectionEnum.RTL

  // Find active tab index for carousel initial scroll position
  const activeTabIndex = tabs.findIndex(tab => tab.key === activeKey)
  const scrollIndex = activeTabIndex >= 0 ? activeTabIndex : 0

  // Find active tab content
  const activeTab = tabs.find(tab => tab.key === activeKey)

  // Don't render if no tabs
  if (tabs.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Tab bar - tablist wraps the Carousel so Carousel sees individual tab children */}
      <div role="tablist" aria-label="Tab navigation">
        <Carousel direction={direction} gap={carouselGap} startScrollItemIndex={scrollIndex}>
          {tabs.map(tab => {
            const isActive = activeKey === tab.key
            return (
              <ButtonAction
                key={tab.key}
                direction={direction}
                variant="ghost-3"
                size="sm"
                isActive={isActive}
                onClick={() => {
                  onTabChange(tab.key)
                }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.key}`}
                id={`tab-${tab.key}`}
                data-testid={`tab-${tab.key}`}
              >
                {tab.label}
              </ButtonAction>
            )
          })}
        </Carousel>
      </div>

      {/* After tab bar content (e.g., filters, sort controls) */}
      {afterTabBar}

      {/* Tab panel - conditional on showPanel */}
      {showPanel && activeTab && (
        <div
          id={`tabpanel-${activeTab.key}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab.key}`}
          data-testid={`tabpanel-${activeTab.key}`}
        >
          {activeTab.content}
        </div>
      )}
    </div>
  )
}

export default TabbedView
