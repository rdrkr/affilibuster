// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Dynamic Zone Layout Component
 *
 * Renders CMS dynamic zone sections with support for horizontal layout markers.
 * Sections between start and end horizontal markers are rendered in a flex row.
 * Respects language direction (LTR/RTL) for horizontal layouts.
 */

import type { ReactNode } from 'react'

import { DirectionEnum } from '@/lib/generated/types.gen'

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
}

/**
 * Horizontal layout marker component discriminators
 */
const START_MARKER = 'markers.start-horizontal-layout-marker'
const END_MARKER = 'markers.end-horizontal-layout-marker'

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
}: DynamicZoneProps<T>) {
  const groups = groupSections(sections, renderSection)
  const isRTL = direction === DirectionEnum.RTL
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
