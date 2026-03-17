// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for DynamicZone component
 */

import { render, screen } from '@testing-library/react'
import React from 'react'

import { DynamicZone, getAlignmentClass, type VerticalAlignment } from '@/components/layout/DynamicZone'
import { DirectionEnum, IconPositionEnum, AlignmentEnum } from '@/lib/generated/types.gen'

// Mock Label component - only mock Label, let other components pass through
jest.mock('@/components/elements/Label', () => ({
  Label: function MockLabel({ data }: { data: { text?: string; icon?: string } }) {
    return (
      <span data-testid="mock-label">
        {data.icon && <span data-testid="mock-label-icon">{data.icon}</span>}
        {data.text}
      </span>
    )
  },
}))

// Mock TabbedDynamicZone to avoid nested component issues
jest.mock('@/components/layout/TabbedDynamicZone', () => ({
  TabbedDynamicZone: function MockTabbedDynamicZone({
    tabs,
    direction,
    className,
  }: {
    tabs: { key: string; label: React.ReactNode; content: React.ReactNode }[]
    direction: string
    className?: string
  }) {
    const [activeKey, setActiveKey] = React.useState(tabs[0]?.key ?? '')
    const activeTab = tabs.find(t => t.key === activeKey)
    return (
      <div className={className} dir={direction === 'rtl' ? 'rtl' : 'ltr'}>
        <div role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeKey === tab.key}
              onClick={() => {
                setActiveKey(tab.key)
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab && (
          <div role="tabpanel" data-testid={`tabpanel-${activeTab.key}`}>
            {activeTab.content}
          </div>
        )}
      </div>
    )
  },
}))

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

  describe('Tabbed Layout Mode', () => {
    it('should render sections as tabs when layout is tabbed', () => {
      const sections: TestSection[] = [
        { __component: 'sections.hero', id: 1, title: 'Hero Content' },
        { __component: 'sections.features', id: 2, title: 'Features Content' },
      ]

      render(
        <DynamicZone
          verticalAlignment="center"
          direction={DirectionEnum.LTR}
          sections={sections}
          renderSection={mockRenderSection}
          layout="tabbed"
        />
      )

      // Should render tabs using TabbedView (which renders tablist)
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getAllByRole('tab')).toHaveLength(2)
    })

    it('should render tab labels from component names when no getTabLabel provided', () => {
      const sections: TestSection[] = [
        { __component: 'sections.hero', id: 1, title: 'Hero Content' },
        { __component: 'sections.features', id: 2, title: 'Features Content' },
      ]

      render(
        <DynamicZone
          verticalAlignment="center"
          direction={DirectionEnum.LTR}
          sections={sections}
          renderSection={mockRenderSection}
          layout="tabbed"
        />
      )

      // Should extract component name without namespace prefix
      expect(screen.getByRole('tab', { name: /hero/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /features/i })).toBeInTheDocument()
    })

    it('should use custom getTabLabel function for tab labels', () => {
      const sections: TestSection[] = [
        { __component: 'sections.hero', id: 1, title: 'Hero Content' },
        { __component: 'sections.features', id: 2, title: 'Features Content' },
      ]

      render(
        <DynamicZone
          verticalAlignment="center"
          direction={DirectionEnum.LTR}
          sections={sections}
          renderSection={mockRenderSection}
          layout="tabbed"
          getTabLabel={section => section.title}
        />
      )

      expect(screen.getByRole('tab', { name: 'Hero Content' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Features Content' })).toBeInTheDocument()
    })

    it('should show first tab content by default in tabbed mode', () => {
      const sections: TestSection[] = [
        { __component: 'sections.hero', id: 1, title: 'First Tab Content' },
        { __component: 'sections.features', id: 2, title: 'Second Tab Content' },
      ]

      render(
        <DynamicZone
          verticalAlignment="center"
          direction={DirectionEnum.LTR}
          sections={sections}
          renderSection={mockRenderSection}
          layout="tabbed"
        />
      )

      // First tab content should be visible
      expect(screen.getByText('First Tab Content')).toBeInTheDocument()
    })

    it('should filter out marker sections in tabbed mode', () => {
      const sections: TestSection[] = [
        { __component: 'markers.start-horizontal-layout-marker', id: 0 },
        { __component: 'sections.hero', id: 1, title: 'Hero Content' },
        { __component: 'markers.end-horizontal-layout-marker', id: 2 },
      ]

      render(
        <DynamicZone
          verticalAlignment="center"
          direction={DirectionEnum.LTR}
          sections={sections}
          renderSection={mockRenderSection}
          layout="tabbed"
        />
      )

      // Should only have 1 tab (markers filtered out)
      expect(screen.getAllByRole('tab')).toHaveLength(1)
      expect(screen.getByRole('tab', { name: /hero/i })).toBeInTheDocument()
    })

    it('should fall back to vertical layout when empty sections in tabbed mode', () => {
      const { container } = render(
        <DynamicZone
          verticalAlignment="center"
          direction={DirectionEnum.LTR}
          sections={[]}
          renderSection={mockRenderSection}
          layout="tabbed"
        />
      )

      // Should not render tablist (falls back to vertical which is empty)
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
      expect(container.firstChild).toHaveClass('gap-16')
    })

    it('should apply RTL direction in tabbed mode', () => {
      const sections: TestSection[] = [{ __component: 'sections.hero', id: 1, title: 'Hero Content' }]

      const { container } = render(
        <DynamicZone
          verticalAlignment="center"
          direction={DirectionEnum.RTL}
          sections={sections}
          renderSection={mockRenderSection}
          layout="tabbed"
        />
      )

      expect(container.firstChild).toHaveAttribute('dir', 'rtl')
    })

    it('should apply className in tabbed mode', () => {
      const sections: TestSection[] = [{ __component: 'sections.hero', id: 1, title: 'Hero Content' }]

      const { container } = render(
        <DynamicZone
          verticalAlignment="center"
          direction={DirectionEnum.LTR}
          sections={sections}
          renderSection={mockRenderSection}
          layout="tabbed"
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should handle sections with only markers (no renderable sections) in tabbed mode', () => {
      const sections: TestSection[] = [
        { __component: 'markers.start-horizontal-layout-marker', id: 0 },
        { __component: 'markers.end-horizontal-layout-marker', id: 1 },
      ]

      const { container } = render(
        <DynamicZone
          verticalAlignment="center"
          direction={DirectionEnum.LTR}
          sections={sections}
          renderSection={mockRenderSection}
          layout="tabbed"
        />
      )

      // Should fall back to vertical layout since no renderable sections
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
      expect(container.firstChild).toHaveClass('gap-16')
    })

    describe('TextBlock Header Handling', () => {
      interface TextBlockSection {
        __component: 'elements.text-block'
        id?: number
        content?: string
        header?: {
          alignment: string
          promoteHeaderIcon: boolean
          header?: {
            text: string
            icon?: string
            iconPosition: string
            ariaDescription?: string
          }
        }
      }

      type MixedSection = TestSection | TextBlockSection

      const textBlockRenderSection = (section: MixedSection) => {
        if (section.__component === 'elements.text-block') {
          const textBlock = section as TextBlockSection
          return (
            <div data-testid={`textblock-${String(textBlock.id)}`}>
              {textBlock.header?.header && <h2 data-testid="textblock-header">{textBlock.header.header.text}</h2>}
              <div data-testid="textblock-content">{textBlock.content}</div>
            </div>
          )
        }
        if (section.__component.startsWith('markers.')) {
          return null
        }
        const testSection = section as TestSection
        return <div data-testid={`section-${String(testSection.id)}`}>{testSection.title}</div>
      }

      it('should use TextBlock header as tab label when no getTabLabel provided', () => {
        const sections: TextBlockSection[] = [
          {
            __component: 'elements.text-block',
            id: 1,
            content: 'Text content',
            header: {
              alignment: AlignmentEnum.CENTER,
              promoteHeaderIcon: false,
              header: {
                text: 'My Tab Title',
                icon: 'info',
                iconPosition: IconPositionEnum.BEFORE_TEXT,
              },
            },
          },
        ]

        render(
          <DynamicZone
            verticalAlignment="center"
            direction={DirectionEnum.LTR}
            sections={sections}
            renderSection={textBlockRenderSection}
            layout="tabbed"
          />
        )

        // Tab label should use the Label component with header data
        const tabLabel = screen.getByTestId('mock-label')
        expect(tabLabel).toHaveTextContent('My Tab Title')
      })

      it('should render icon in TextBlock tab label', () => {
        const sections: TextBlockSection[] = [
          {
            __component: 'elements.text-block',
            id: 1,
            content: 'Text content',
            header: {
              alignment: AlignmentEnum.CENTER,
              promoteHeaderIcon: false,
              header: {
                text: 'Tab with Icon',
                icon: 'settings',
                iconPosition: IconPositionEnum.BEFORE_TEXT,
              },
            },
          },
        ]

        render(
          <DynamicZone
            verticalAlignment="center"
            direction={DirectionEnum.LTR}
            sections={sections}
            renderSection={textBlockRenderSection}
            layout="tabbed"
          />
        )

        // Should render icon in tab label
        const iconElement = screen.getByTestId('mock-label-icon')
        expect(iconElement).toHaveTextContent('settings')
      })

      it('should use fallback "Text" label when TextBlock has no header', () => {
        const sections: TextBlockSection[] = [
          {
            __component: 'elements.text-block',
            id: 1,
            content: 'Text content without header',
          },
        ]

        render(
          <DynamicZone
            verticalAlignment="center"
            direction={DirectionEnum.LTR}
            sections={sections}
            renderSection={textBlockRenderSection}
            layout="tabbed"
          />
        )

        // Should show fallback "Text" label
        expect(screen.getByRole('tab', { name: /Text/i })).toBeInTheDocument()
      })

      it('should strip header from TextBlock content in tabbed mode', () => {
        const sections: TextBlockSection[] = [
          {
            __component: 'elements.text-block',
            id: 1,
            content: 'Body text content',
            header: {
              alignment: AlignmentEnum.CENTER,
              promoteHeaderIcon: false,
              header: {
                text: 'Header Title',
                iconPosition: IconPositionEnum.BEFORE_TEXT,
              },
            },
          },
        ]

        // Render section that checks for header presence
        const renderSectionTrackingHeader = (section: MixedSection) => {
          if (section.__component === 'elements.text-block') {
            const textBlock = section as TextBlockSection
            return (
              <div data-testid="textblock-content">
                {textBlock.header?.header ? (
                  <span data-testid="has-header">Has Header</span>
                ) : (
                  <span data-testid="no-header">No Header</span>
                )}
                <div>{textBlock.content}</div>
              </div>
            )
          }
          return null
        }

        render(
          <DynamicZone
            verticalAlignment="center"
            direction={DirectionEnum.LTR}
            sections={sections}
            renderSection={renderSectionTrackingHeader}
            layout="tabbed"
          />
        )

        // Header should be stripped from content (used in tab label instead)
        expect(screen.getByTestId('no-header')).toBeInTheDocument()
        expect(screen.queryByTestId('has-header')).not.toBeInTheDocument()
      })

      it('should use getTabLabel over TextBlock header when provided', () => {
        const sections: TextBlockSection[] = [
          {
            __component: 'elements.text-block',
            id: 1,
            content: 'Text content',
            header: {
              alignment: AlignmentEnum.CENTER,
              promoteHeaderIcon: false,
              header: {
                text: 'Original Header',
                iconPosition: IconPositionEnum.BEFORE_TEXT,
              },
            },
          },
        ]

        render(
          <DynamicZone
            verticalAlignment="center"
            direction={DirectionEnum.LTR}
            sections={sections}
            renderSection={textBlockRenderSection}
            layout="tabbed"
            getTabLabel={() => 'Custom Label'}
          />
        )

        // Should use custom label, not the TextBlock header
        expect(screen.getByRole('tab', { name: 'Custom Label' })).toBeInTheDocument()
        expect(screen.queryByTestId('mock-label')).not.toBeInTheDocument()
      })

      it('should handle mixed sections with TextBlock in tabbed mode', () => {
        const sections: MixedSection[] = [
          { __component: 'sections.hero', id: 1, title: 'Hero Content' } as TestSection,
          {
            __component: 'elements.text-block',
            id: 2,
            content: 'Text content',
            header: {
              alignment: AlignmentEnum.CENTER,
              promoteHeaderIcon: false,
              header: {
                text: 'Text Block Tab',
                iconPosition: IconPositionEnum.BEFORE_TEXT,
              },
            },
          } as TextBlockSection,
        ]

        render(
          <DynamicZone
            verticalAlignment="center"
            direction={DirectionEnum.LTR}
            sections={sections}
            renderSection={textBlockRenderSection}
            layout="tabbed"
          />
        )

        // Should have 2 tabs
        expect(screen.getAllByRole('tab')).toHaveLength(2)

        // Hero section uses component name (default behavior)
        expect(screen.getByRole('tab', { name: /hero/i })).toBeInTheDocument()

        // TextBlock uses header text via Label
        expect(screen.getByTestId('mock-label')).toHaveTextContent('Text Block Tab')
      })
    })
  })
})
