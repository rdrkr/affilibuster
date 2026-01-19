// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for DynamicZone component
 */

import { render, screen } from '@testing-library/react'

import { DynamicZone, getAlignmentClass, type VerticalAlignment } from '@/components/layout/DynamicZone'
import { DirectionEnum } from '@/lib/generated/types.gen'

describe('DynamicZone', () => {
  interface TestSection {
    __component: string
    id?: number
    title?: string
  }

  const mockRenderSection = (section: TestSection) => {
    if (section.__component.startsWith('markers.')) {
      return null
    }
    return <div data-testid={`section-${String(section.id)}`}>{section.title}</div>
  }

  it('should render sections in vertical layout by default', () => {
    const sections: TestSection[] = [
      { __component: 'sections.hero', id: 1, title: 'Hero' },
      { __component: 'sections.features', id: 2, title: 'Features' },
    ]

    render(
      <DynamicZone
        verticalAlignment="center"
        direction={DirectionEnum.LTR}
        sections={sections}
        renderSection={mockRenderSection}
      />
    )

    expect(screen.getByText('Hero')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })

  it('should group sections between horizontal markers', () => {
    const sections: TestSection[] = [
      { __component: 'markers.start-horizontal-layout-marker', id: 0 },
      { __component: 'sections.hero', id: 1, title: 'Hero' },
      { __component: 'sections.features', id: 2, title: 'Features' },
      { __component: 'markers.end-horizontal-layout-marker', id: 3 },
    ]

    const { container } = render(
      <DynamicZone
        verticalAlignment="center"
        direction={DirectionEnum.LTR}
        sections={sections}
        renderSection={mockRenderSection}
      />
    )

    // Should have horizontal flex container
    const horizontalGroup = container.querySelector('[class*="md:flex-row"]')
    expect(horizontalGroup).toBeInTheDocument()
  })

  it('should apply RTL class when direction is rtl', () => {
    const sections: TestSection[] = [
      { __component: 'markers.start-horizontal-layout-marker', id: 0 },
      { __component: 'sections.hero', id: 1, title: 'Hero' },
      { __component: 'markers.end-horizontal-layout-marker', id: 2 },
    ]

    const { container } = render(
      <DynamicZone
        verticalAlignment="center"
        sections={sections}
        renderSection={mockRenderSection}
        direction={DirectionEnum.RTL}
      />
    )

    // Should rely on dir="rtl" on container, not specific class on the group
    const containerDiv = container.firstChild
    expect(containerDiv).toHaveAttribute('dir', 'rtl')

    const horizontalGroup = container.querySelector('[class*="md:flex-row"]')
    expect(horizontalGroup).toBeInTheDocument()
  })

  it('should not apply RTL class when direction is ltr', () => {
    const sections: TestSection[] = [
      { __component: 'markers.start-horizontal-layout-marker', id: 0 },
      { __component: 'sections.hero', id: 1, title: 'Hero' },
      { __component: 'markers.end-horizontal-layout-marker', id: 2 },
    ]

    const { container } = render(
      <DynamicZone
        verticalAlignment="center"
        sections={sections}
        renderSection={mockRenderSection}
        direction={DirectionEnum.LTR}
      />
    )

    // Should have flex-row but not flex-row-reverse
    const reverseGroups = container.querySelectorAll('[class*="flex-row-reverse"]')
    expect(reverseGroups.length).toBe(0)
  })

  it('should apply custom className to container', () => {
    const sections: TestSection[] = [{ __component: 'sections.hero', id: 1, title: 'Hero' }]

    const { container } = render(
      <DynamicZone
        verticalAlignment="center"
        direction={DirectionEnum.LTR}
        sections={sections}
        renderSection={mockRenderSection}
        className="w-full"
      />
    )

    expect(container.firstChild).toHaveClass('w-full')
  })

  it('should handle empty sections array', () => {
    const { container } = render(
      <DynamicZone
        verticalAlignment="center"
        direction={DirectionEnum.LTR}
        sections={[]}
        renderSection={mockRenderSection}
      />
    )

    expect(container.firstChild).toBeEmptyDOMElement()
  })

  it('should render vertical sections in gap-16 container', () => {
    const sections: TestSection[] = [
      { __component: 'sections.hero', id: 1, title: 'Hero' },
      { __component: 'sections.features', id: 2, title: 'Features' },
    ]

    const { container } = render(
      <DynamicZone
        verticalAlignment="center"
        direction={DirectionEnum.LTR}
        sections={sections}
        renderSection={mockRenderSection}
      />
    )

    const verticalGroup = container.querySelector('[class*="gap-16"]')
    expect(verticalGroup).toBeInTheDocument()
  })

  it('should handle multiple groups (vertical, horizontal, vertical)', () => {
    const sections: TestSection[] = [
      { __component: 'sections.hero', id: 1, title: 'Hero' },
      { __component: 'markers.start-horizontal-layout-marker', id: 2 },
      { __component: 'sections.features', id: 3, title: 'Features' },
      { __component: 'sections.about', id: 4, title: 'About' },
      { __component: 'markers.end-horizontal-layout-marker', id: 5 },
      { __component: 'sections.contact', id: 6, title: 'Contact' },
    ]

    render(
      <DynamicZone
        verticalAlignment="center"
        direction={DirectionEnum.LTR}
        sections={sections}
        renderSection={mockRenderSection}
      />
    )

    // All sections should be rendered
    expect(screen.getByText('Hero')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('should skip null elements from renderSection', () => {
    const sections: TestSection[] = [
      { __component: 'sections.hero', id: 1, title: 'Hero' },
      { __component: 'markers.start-horizontal-layout-marker', id: 2 },
    ]

    // Render section that is a marker returns null
    const { container } = render(
      <DynamicZone
        verticalAlignment="center"
        direction={DirectionEnum.LTR}
        sections={sections}
        renderSection={mockRenderSection}
      />
    )

    // Should only render Hero, marker returns null
    expect(screen.getByText('Hero')).toBeInTheDocument()
    expect(container.textContent).not.toContain('marker')
  })

  it('should handle start marker at end without end marker', () => {
    const sections: TestSection[] = [
      { __component: 'sections.hero', id: 1, title: 'Hero' },
      { __component: 'markers.start-horizontal-layout-marker', id: 2 },
      { __component: 'sections.features', id: 3, title: 'Features' },
    ]

    render(
      <DynamicZone
        verticalAlignment="center"
        direction={DirectionEnum.LTR}
        sections={sections}
        renderSection={mockRenderSection}
      />
    )

    expect(screen.getByText('Hero')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })

  it('should wrap horizontal group items in flex-1', () => {
    const sections: TestSection[] = [
      { __component: 'markers.start-horizontal-layout-marker', id: 0 },
      { __component: 'sections.hero', id: 1, title: 'Hero' },
      { __component: 'markers.end-horizontal-layout-marker', id: 2 },
    ]

    const { container } = render(
      <DynamicZone
        verticalAlignment="center"
        direction={DirectionEnum.LTR}
        sections={sections}
        renderSection={mockRenderSection}
      />
    )

    const flexItems = container.querySelectorAll('.flex-1')
    expect(flexItems.length).toBeGreaterThan(0)
  })

  it('should skip unknown marker components', () => {
    const sections: TestSection[] = [
      { __component: 'sections.hero', id: 1, title: 'Hero' },
      { __component: 'markers.unknown-marker', id: 2 },
      { __component: 'sections.features', id: 3, title: 'Features' },
    ]

    const customRenderSection = (section: TestSection) => {
      // Return null for all markers (including unknown ones)
      if (section.__component.startsWith('markers.')) {
        return null
      }
      return <div data-testid={`section-${String(section.id)}`}>{section.title}</div>
    }

    render(
      <DynamicZone
        verticalAlignment="center"
        direction={DirectionEnum.LTR}
        sections={sections}
        renderSection={customRenderSection}
      />
    )

    // Unknown marker should be skipped, sections should still render
    expect(screen.getByText('Hero')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })

  it('should apply vertical alignment classes', () => {
    const sections: TestSection[] = [
      { __component: 'markers.start-horizontal-layout-marker', id: 0 },
      { __component: 'sections.hero', id: 1, title: 'Hero' },
      { __component: 'markers.end-horizontal-layout-marker', id: 2 },
    ]

    const { container: topContainer } = render(
      <DynamicZone
        verticalAlignment="top"
        direction={DirectionEnum.LTR}
        sections={sections}
        renderSection={mockRenderSection}
      />
    )
    expect(topContainer.querySelector('.md\\:items-start')).toBeInTheDocument()

    const { container: bottomContainer } = render(
      <DynamicZone
        verticalAlignment="bottom"
        direction={DirectionEnum.LTR}
        sections={sections}
        renderSection={mockRenderSection}
      />
    )
    expect(bottomContainer.querySelector('.md\\:items-end')).toBeInTheDocument()
  })

  describe('getAlignmentClass', () => {
    it('should return correct classes', () => {
      expect(getAlignmentClass('top')).toBe('md:items-start')
      expect(getAlignmentClass('bottom')).toBe('md:items-end')
      expect(getAlignmentClass('center')).toBe('md:items-center')
      // Testing fallback for runtime safety
      expect(getAlignmentClass('invalid' as unknown as VerticalAlignment)).toBe('md:items-center')
    })
  })
})
