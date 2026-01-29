// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * Tabbed Dynamic Zone Client Component
 *
 * Client-side wrapper for tabbed layout in DynamicZone.
 * Manages tab state and renders TabbedView.
 */

import { useState } from 'react'

import { TabbedView, type Tab } from '@/components/elements'
import { DirectionEnum } from '@/lib/generated/types.gen'

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
}

/**
 * Client component for managing tabbed layout state in DynamicZone.
 * Accepts pre-rendered tab content from server component.
 * @param props - Component props
 * @param props.tabs - Pre-rendered tabs from parent
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.className - Additional CSS classes
 * @returns Tabbed view with state management
 */
export function TabbedDynamicZone({ tabs, direction, className = '' }: TabbedDynamicZoneProps) {
  const [activeTabKey, setActiveTabKey] = useState<string>(tabs[0]?.key ?? '')
  const isRTL = direction === DirectionEnum.RTL

  // Validate active key
  const validActiveKey = tabs.some(tab => tab.key === activeTabKey) ? activeTabKey : (tabs[0]?.key ?? '')

  return (
    <div className={className} dir={isRTL ? 'rtl' : 'ltr'}>
      <TabbedView tabs={tabs} activeKey={validActiveKey} onTabChange={setActiveTabKey} direction={direction} />
    </div>
  )
}

export default TabbedDynamicZone
