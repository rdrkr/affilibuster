// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * Tabbed Dynamic Zone Client Component
 *
 * Client-side wrapper for tabbed layout in DynamicZone.
 * Manages tab state and renders TabbedView.
 */

import { useState } from 'react'

import { DirectionEnum } from '@/lib/generated/types.gen'
import { TabbedView } from './TabbedView'
import type { BackgroundVariant, Tab, TabLayout } from './tabbed-view-types'

/**
 * Props for the TabbedDynamicZone component
 */
export interface TabbedDynamicZoneProps {
  /** Pre-rendered tabs from parent component */
  tabs: Tab[]
  /** Language direction for RTL support */
  direction: DirectionEnum
  /** Additional className for the container */
  className?: string
  /** Tab bar layout mode: 'scroll' for carousel, 'fill' for full-width adaptive buttons (default: 'scroll') */
  tabLayout?: TabLayout
  /** Background variant: 'none' (default), 'tabs' (tab bar only), 'content' (panel only), 'separate' (each in own container), 'all' (shared container) */
  backgroundVariant?: BackgroundVariant
}

/**
 * Client component for managing tabbed layout state in DynamicZone.
 * Accepts pre-rendered tab content from server component.
 * @param props - Component props
 * @param props.tabs - Pre-rendered tabs from parent
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.className - Additional CSS classes
 * @param props.tabLayout - Tab bar layout: 'scroll' for carousel, 'fill' for full-width buttons (default: 'scroll')
 * @param props.backgroundVariant - Background styling: 'none', 'tabs' (tab bar only), 'content' (panel only), 'separate' (each in own container), 'all' (shared container) (default: 'none')
 * @returns Tabbed view with state management
 */
export function TabbedDynamicZone({
  tabs,
  direction,
  className = '',
  tabLayout,
  backgroundVariant,
}: TabbedDynamicZoneProps) {
  const [activeTabKey, setActiveTabKey] = useState<string>(tabs[0]?.key ?? '')
  const isRTL = direction === DirectionEnum.RTL

  // Validate active key
  const validActiveKey = tabs.some(tab => tab.key === activeTabKey) ? activeTabKey : (tabs[0]?.key ?? '')

  return (
    <div className={className} dir={isRTL ? 'rtl' : 'ltr'}>
      <TabbedView
        tabs={tabs}
        activeKey={validActiveKey}
        onTabChange={setActiveTabKey}
        direction={direction}
        {...(tabLayout !== undefined && { tabLayout })}
        {...(backgroundVariant !== undefined && { backgroundVariant })}
      />
    </div>
  )
}

export default TabbedDynamicZone
