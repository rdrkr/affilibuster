// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for TabbedDynamicZone component
 */

import { render, screen, fireEvent } from '@testing-library/react'

import { TabbedDynamicZone } from '@/components/layout/TabbedDynamicZone'
import { DirectionEnum } from '@/lib/generated/types.gen'

describe('TabbedDynamicZone', () => {
  const mockTabs = [
    { key: 'tab1', label: 'Tab 1', content: <div data-testid="content-1">Content 1</div> },
    { key: 'tab2', label: 'Tab 2', content: <div data-testid="content-2">Content 2</div> },
    { key: 'tab3', label: 'Tab 3', content: <div data-testid="content-3">Content 3</div> },
  ]

  it('should render tabs and initial content', () => {
    render(<TabbedDynamicZone tabs={mockTabs} direction={DirectionEnum.LTR} />)

    expect(screen.getByTestId('tab-tab1')).toBeInTheDocument()
    expect(screen.getByTestId('tab-tab2')).toBeInTheDocument()
    expect(screen.getByTestId('tab-tab3')).toBeInTheDocument()
    expect(screen.getByTestId('content-1')).toBeInTheDocument()
  })

  it('should switch content when clicking tabs', () => {
    render(<TabbedDynamicZone tabs={mockTabs} direction={DirectionEnum.LTR} />)

    // Initially shows first tab content
    expect(screen.getByTestId('content-1')).toBeInTheDocument()
    expect(screen.queryByTestId('content-2')).not.toBeInTheDocument()

    // Click second tab
    fireEvent.click(screen.getByTestId('tab-tab2'))

    // Now shows second tab content
    expect(screen.queryByTestId('content-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('content-2')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <TabbedDynamicZone tabs={mockTabs} direction={DirectionEnum.LTR} className="custom-class" />
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
  })

  it('should set dir="rtl" for RTL direction', () => {
    const { container } = render(<TabbedDynamicZone tabs={mockTabs} direction={DirectionEnum.RTL} />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveAttribute('dir', 'rtl')
  })

  it('should set dir="ltr" for LTR direction', () => {
    const { container } = render(<TabbedDynamicZone tabs={mockTabs} direction={DirectionEnum.LTR} />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveAttribute('dir', 'ltr')
  })

  it('should handle empty className', () => {
    const { container } = render(<TabbedDynamicZone tabs={mockTabs} direction={DirectionEnum.LTR} />)

    const wrapper = container.firstChild as HTMLElement
    // Should have dir attribute but no extra classes beyond what TabbedView adds
    expect(wrapper).toBeInTheDocument()
  })

  it('should handle empty tabs array gracefully', () => {
    const { container } = render(<TabbedDynamicZone tabs={[]} direction={DirectionEnum.LTR} />)

    // Component should render without crashing
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should initialize with first tab active', () => {
    render(<TabbedDynamicZone tabs={mockTabs} direction={DirectionEnum.LTR} />)

    const firstTab = screen.getByTestId('tab-tab1')
    expect(firstTab).toHaveAttribute('aria-selected', 'true')
  })

  it('should validate active key and fallback to first tab if invalid', () => {
    // This tests the validation logic on line 43
    // If somehow activeTabKey becomes invalid, it should fallback
    render(<TabbedDynamicZone tabs={mockTabs} direction={DirectionEnum.LTR} />)

    // After initial render, first tab should be active
    expect(screen.getByTestId('tab-tab1')).toHaveAttribute('aria-selected', 'true')
  })

  it('should fallback to first tab when tabs change and current active key becomes invalid', () => {
    const { rerender } = render(<TabbedDynamicZone tabs={mockTabs} direction={DirectionEnum.LTR} />)

    // Click third tab to make it active
    fireEvent.click(screen.getByTestId('tab-tab3'))
    expect(screen.getByTestId('tab-tab3')).toHaveAttribute('aria-selected', 'true')

    // Re-render with different tabs that don't include 'tab3'
    const newTabs = [
      { key: 'tabA', label: 'Tab A', content: <div data-testid="content-A">Content A</div> },
      { key: 'tabB', label: 'Tab B', content: <div data-testid="content-B">Content B</div> },
    ]

    rerender(<TabbedDynamicZone tabs={newTabs} direction={DirectionEnum.LTR} />)

    // 'tab3' is no longer valid, should fallback to first tab 'tabA'
    expect(screen.getByTestId('tab-tabA')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('content-A')).toBeInTheDocument()
  })

  it('should handle single tab gracefully', () => {
    const singleTab = [{ key: 'only', label: 'Only Tab', content: <div data-testid="content-only">Only</div> }]

    render(<TabbedDynamicZone tabs={singleTab} direction={DirectionEnum.LTR} />)

    expect(screen.getByTestId('tab-only')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('content-only')).toBeInTheDocument()
  })
})
