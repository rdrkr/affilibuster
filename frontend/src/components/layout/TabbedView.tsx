// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * TabbedView Component
 *
 * A reusable tabbed view component that combines a horizontally scrollable tab bar
 * with content panels. Uses Carousel for the tab bar and native buttons for tabs.
 * Supports RTL layouts, accessibility features (tablist, tab, tabpanel roles),
 * animated content transitions, and container tab bar with sliding pill.
 */

import { ButtonAction } from '@/components/elements/ButtonAction'
import { Carousel } from '@/components/layout/Carousel'
import { DirectionEnum } from '@/lib/generated/types.gen'

import { ContainerTabBar } from '@/components/layout/ContainerTabBar'
import type { Tab, TabbedViewProps } from '@/components/layout/tabbed-view-types'

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
 * - Optional tabLayout prop for fill-width adaptive buttons
 * - Configurable background variant for Card-like container styling
 * - Controllable auto-scroll via autoScroll prop
 * - Animated content transitions with fade-in
 * - tab bar with sliding pill indicator for container variants
 * - Scroll arrows for overflowing tabs
 * @param props - Component props
 * @param props.tabs - Array of tab configurations
 * @param props.activeKey - Currently active tab key
 * @param props.onTabChange - Callback when tab selection changes
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.carouselGap - Gap between tab buttons (default: 'sm')
 * @param props.className - Additional CSS classes for the container
 * @param props.afterTabBar - Content rendered after tab bar (e.g., filters, sort controls)
 * @param props.showPanel - When false, only renders tab bar without panel content (default: true)
 * @param props.tabLayout - Tab bar layout: 'scroll' for carousel, 'fill' for full-width buttons (default: 'scroll')
 * @param props.backgroundVariant - Background styling: 'none', 'tabs' (tab bar only), 'content' (panel only), 'separate' (each in own container), 'all' (shared container) (default: 'none')
 * @param props.autoScroll - When false, disables auto-scroll to active tab in carousel (default: true)
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
  tabLayout = 'scroll',
  backgroundVariant = 'none',
  autoScroll = true,
}: TabbedViewProps<T>) {
  const isRTL = direction === DirectionEnum.RTL

  // Find active tab index for carousel initial scroll position.
  // When autoScroll is false, pass 0 so Carousel's effect returns early without scrolling.
  const activeTabIndex = tabs.findIndex(tab => tab.key === activeKey)
  const scrollIndex = autoScroll ? (activeTabIndex >= 0 ? activeTabIndex : 0) : 0

  // Find active tab content
  const activeTab = tabs.find(tab => tab.key === activeKey)

  // Don't render if no tabs
  if (tabs.length === 0) {
    return null
  }

  /** Whether the tab bar uses container design */
  const isContainerStyle =
    backgroundVariant === 'tabs' || backgroundVariant === 'separate' || backgroundVariant === 'all'

  /**
   * Renders a single tab button.
   * @param tab - Tab configuration
   * @returns Tab button JSX element
   */
  const renderTabButton = (tab: Tab<T>) => {
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
        className={tabLayout === 'fill' ? 'flex-1' : ''}
      >
        {tab.label}
      </ButtonAction>
    )
  }

  /** Background classes matching Card component look and feel */
  const bgClasses = 'rounded-xl border border-border bg-card p-5 shadow-md dark:shadow-none'

  /** Whether the tab bar should have its own background */
  const hasTabBarBg = backgroundVariant === 'tabs' || backgroundVariant === 'separate'

  /** Whether the tab panel should have its own background */
  const hasTabPanelBg = backgroundVariant === 'content' || backgroundVariant === 'separate'

  /** Default tab bar element */
  const defaultTabBar =
    tabLayout === 'fill' ? (
      <div role="tablist" aria-label="Tab navigation" className={`flex gap-2 ${hasTabBarBg ? bgClasses : ''}`}>
        {tabs.map(renderTabButton)}
      </div>
    ) : (
      <div role="tablist" aria-label="Tab navigation" className={hasTabBarBg ? bgClasses : ''}>
        <Carousel direction={direction} gap={carouselGap} startScrollItemIndex={scrollIndex}>
          {tabs.map(renderTabButton)}
        </Carousel>
      </div>
    )

  /** Choose tab bar based on background variant */
  const tabBar = isContainerStyle ? (
    <ContainerTabBar tabs={tabs} activeKey={activeKey} onTabChange={onTabChange} direction={direction} />
  ) : (
    defaultTabBar
  )

  /** Tab panel element with fade-in animation */
  const tabPanel =
    showPanel && activeTab ? (
      <div
        key={activeTab.key}
        id={`tabpanel-${activeTab.key}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab.key}`}
        data-testid={`tabpanel-${activeTab.key}`}
        className={`animate-fade-in ${hasTabPanelBg ? bgClasses : ''}`}
      >
        {activeTab.content}
      </div>
    ) : null

  return (
    <div className={`flex flex-col gap-4 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {backgroundVariant === 'all' ? (
        <div className={`flex flex-col gap-4 ${bgClasses}`}>
          {tabBar}
          {afterTabBar}
          {tabPanel}
        </div>
      ) : (
        <>
          {tabBar}
          {afterTabBar}
          {tabPanel}
        </>
      )}
    </div>
  )
}

export default TabbedView
