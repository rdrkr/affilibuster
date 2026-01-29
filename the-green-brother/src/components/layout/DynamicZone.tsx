// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Dynamic Zone Layout Component
 *
 * Renders CMS dynamic zone sections with support for horizontal layout markers
 * and tabbed layout mode. Sections between start and end horizontal markers are
 * rendered in a flex row. In tabbed mode, sections become tabs.
 * Respects language direction (LTR/RTL) for all layouts.
 */

import type { ReactNode } from 'react'

import { Label } from '@/components/elements/Label'
import { DirectionEnum, type ElementsTextBlockEntry } from '@/lib/generated/types.gen'
import { TabbedDynamicZone } from './TabbedDynamicZone'

/**
 * Section with component discriminator
 */
interface DynamicSection {
  __component: string
  id?: number
}

/**
 * Rendered section group (vertical or horizontal)
 */
interface SectionGroup {
  layout: 'vertical' | 'horizontal'
  sections: { section: DynamicSection; element: ReactNode | Promise<ReactNode>; index: number }[]
}

/**
 * Vertical alignment options for horizontal layout
 */
export type VerticalAlignment = 'top' | 'center' | 'bottom'

/**
 * Layout mode for the dynamic zone
 */
export type DynamicZoneLayout = 'vertical' | 'horizontal' | 'tabbed'

/**
 * Props for the DynamicZone component
 */
export interface DynamicZoneProps<T extends DynamicSection> {
  /** Array of sections from CMS dynamic zone */
  sections: T[]
  /** Function to render each section based on its type */
  renderSection: (section: T) => ReactNode | Promise<ReactNode>
  /** Language direction for RTL support (defaults to DirectionEnum.LTR) */
  direction: DirectionEnum
  /** Additional className for the container */
  className?: string
  /** Vertical alignment for horizontal layout groups */
  verticalAlignment: VerticalAlignment
  /** Layout mode: vertical (default), horizontal, or tabbed */
  layout?: DynamicZoneLayout
  /** Function to extract tab labels from sections (for tabbed layout) */
  getTabLabel?: (section: T) => ReactNode
}

/**
 * Horizontal layout marker component discriminators
 */
const START_MARKER = 'markers.start-horizontal-layout-marker'
const END_MARKER = 'markers.end-horizontal-layout-marker'
const TEXT_BLOCK_COMPONENT = 'elements.text-block'

/**
 * Strips the header from a TextBlock section to avoid duplicate rendering in tabbed mode.
 * When a TextBlock is rendered as a tab, its header is used as the tab label,
 * so we remove it from the content to prevent showing it twice.
 * @param section - The section to process
 * @returns Section with header removed if it's a TextBlock, otherwise unchanged
 */
function stripTextBlockHeader<T extends DynamicSection>(section: T): T {
  if (section.__component === TEXT_BLOCK_COMPONENT) {
    const textBlock = section as unknown as ElementsTextBlockEntry & DynamicSection
    const { header: _, ...rest } = textBlock
    void _ // Suppress unused variable warning for destructured header
    return rest as unknown as T
  }
  return section
}

/**
 * Groups sections based on horizontal layout markers.
 * Sections between start and end markers are grouped together.
 * @param sections - Array of sections from CMS
 * @param renderSection - Function to render each section
 * @returns Array of section groups with layout type
 */
function groupSections<T extends DynamicSection>(
  sections: T[],
  renderSection: (section: T) => ReactNode | Promise<ReactNode>
): SectionGroup[] {
  const groups: SectionGroup[] = []
  let currentGroup: SectionGroup = { layout: 'vertical', sections: [] }

  sections.forEach((section, sectionIndex) => {
    const component = section.__component

    if (component === START_MARKER) {
      // Save current vertical group if it has sections
      if (currentGroup.sections.length > 0) {
        groups.push(currentGroup)
      }
      // Start new horizontal group
      currentGroup = { layout: 'horizontal', sections: [] }
      return
    }

    if (component === END_MARKER) {
      // Save horizontal group if it has sections
      if (currentGroup.sections.length > 0) {
        groups.push(currentGroup)
      }
      // Start new vertical group
      currentGroup = { layout: 'vertical', sections: [] }
      return
    }

    // Render the section and add to current group
    const element = renderSection(section)
    if (element !== null) {
      currentGroup.sections.push({ section, element, index: sectionIndex })
    }
  })

  // Add final group if it has sections
  if (currentGroup.sections.length > 0) {
    groups.push(currentGroup)
  }

  return groups
}

/**
 * Helper to get alignment utility class
 * @param alignment - Vertical alignment option
 * @returns Tailwind CSS class for alignment
 */
export const getAlignmentClass = (alignment: VerticalAlignment): string => {
  switch (alignment) {
    case 'top':
      return 'md:items-start'
    case 'bottom':
      return 'md:items-end'
    default:
      return 'md:items-center'
  }
}

/**
 * Dynamic zone renderer with horizontal layout marker support.
 *
 * Renders CMS dynamic zone sections, grouping sections between
 * horizontal layout markers into flex rows. Respects language
 * direction for RTL layouts.
 * @param props - Component props
 * @param props.sections - Array of sections from CMS dynamic zone
 * @param props.renderSection - Function to render each section
 * @param props.direction - Language direction (ltr/rtl)
 * @param props.className - Additional className for container
 * @param props.verticalAlignment - Vertical alignment for horizontal groups
 * @param props.layout - Layout mode: vertical, horizontal, or tabbed
 * @param props.getTabLabel - Function to extract tab labels from sections
 * @returns Rendered dynamic zone with horizontal groups
 * @example
 * ```tsx
 * <DynamicZone
 *   sections={homepage.sections}
 *   renderSection={(section) => ...}
 *   direction="ltr"
 *   verticalAlignment="center"
 * />
 * ```
 */
export function DynamicZone<T extends DynamicSection>({
  sections,
  renderSection,
  direction,
  className = '',
  verticalAlignment,
  layout,
  getTabLabel,
}: DynamicZoneProps<T>) {
  // Filter out marker sections for tabbed mode
  const renderableSections = sections.filter(
    section => section.__component !== START_MARKER && section.__component !== END_MARKER
  )

  const isRTL = direction === DirectionEnum.RTL

  // Tabbed layout mode
  if (layout === 'tabbed' && renderableSections.length > 0) {
    // Convert sections to tabs (render them here in the server component)
    const tabs = renderableSections.map((section, index) => {
      // Generate a unique key using component name and index
      const tabKey = `${section.__component}-${String(index)}`

      // Extract label: use getTabLabel if provided, or TextBlock header, or fallback to component name
      let label: ReactNode
      if (getTabLabel) {
        label = getTabLabel(section)
      } else if (section.__component === TEXT_BLOCK_COMPONENT) {
        const textBlock = section as unknown as ElementsTextBlockEntry & DynamicSection
        if (textBlock.header?.header) {
          label = <Label data={textBlock.header.header} direction={direction} display="inline" />
        } else {
          label = 'Text'
        }
      } else {
        label = section.__component.split('.').pop() ?? 'Tab'
      }

      // Strip header from TextBlock when rendering as tab content to avoid duplication
      const contentSection = section.__component === TEXT_BLOCK_COMPONENT ? stripTextBlockHeader(section) : section

      return {
        key: tabKey,
        label,
        content: renderSection(contentSection) as ReactNode,
      }
    })

    return <TabbedDynamicZone tabs={tabs} direction={direction} className={className} />
  }

  // Default: vertical/horizontal grouping mode
  const groups = groupSections(sections, renderSection)
  const alignmentClass = getAlignmentClass(verticalAlignment)

  return (
    <div className={`flex flex-col gap-16 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {groups.map((group, groupIndex) => {
        if (group.layout === 'horizontal') {
          return (
            <div
              key={`group-${String(groupIndex)}`}
              className={`
                flex flex-col gap-8
                md:flex-row
                ${alignmentClass}
              `}
            >
              {group.sections.map(({ element, index }) => (
                <div key={`section-${String(index)}`} className="flex-1">
                  {element as ReactNode}
                </div>
              ))}
            </div>
          )
        }

        // Vertical layout - render sections normally (fragments to avoid nested gaps)
        return group.sections.map(({ element, index }) => (
          <div key={`section-${String(index)}`}>{element as ReactNode}</div>
        ))
      })}
    </div>
  )
}
