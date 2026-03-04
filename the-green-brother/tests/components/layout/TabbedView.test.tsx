// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for TabbedView component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { TabbedView } from '@/components/layout/TabbedView'
import type { Tab } from '@/components/layout/tabbed-view-types'
import { DirectionEnum } from '@/lib/generated/types.gen'

// Mock Carousel component
jest.mock('@/components/layout/Carousel', () => ({
  Carousel: function MockCarousel({ children }: { children: React.ReactNode }) {
    return <div data-testid="mock-carousel">{children}</div>
  },
}))

// Mock ButtonAction component
jest.mock('@/components/elements/ButtonAction', () => ({
  ButtonAction: function MockButtonAction({
    children,
    onClick,
    isActive,
    role,
    'aria-selected': ariaSelected,
    'aria-controls': ariaControls,
    id,
    'data-testid': dataTestId,
  }: {
    children: React.ReactNode
    onClick: () => void
    isActive?: boolean
    role?: string
    'aria-selected'?: boolean
    'aria-controls'?: string
    id?: string
    'data-testid'?: string
  }) {
    return (
      <button
        onClick={onClick}
        data-active={isActive}
        role={role}
        aria-selected={ariaSelected}
        aria-controls={ariaControls}
        id={id}
        data-testid={dataTestId}
      >
        {children}
      </button>
    )
  },
}))

// Mock Icon component
jest.mock('@/components/elements/Icon', () => ({
  Icon: function MockIcon({ icon, size }: { icon: string; size?: string }) {
    return <span data-testid={`mock-icon-${icon}`} data-size={size} />
  },
}))

describe('TabbedView', () => {
  const mockTabs: Tab[] = [
    { key: 'tab1', label: 'First Tab', content: <div>Content 1</div> },
    { key: 'tab2', label: 'Second Tab', content: <div>Content 2</div> },
    { key: 'tab3', label: 'Third Tab', content: <div>Content 3</div> },
  ]

  const defaultProps = {
    tabs: mockTabs,
    activeKey: 'tab1',
    onTabChange: jest.fn(),
    direction: DirectionEnum.LTR,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all tab buttons', () => {
      render(<TabbedView {...defaultProps} />)

      expect(screen.getByTestId('tab-tab1')).toBeInTheDocument()
      expect(screen.getByTestId('tab-tab2')).toBeInTheDocument()
      expect(screen.getByTestId('tab-tab3')).toBeInTheDocument()
    })

    it('should render tab labels', () => {
      render(<TabbedView {...defaultProps} />)

      expect(screen.getByText('First Tab')).toBeInTheDocument()
      expect(screen.getByText('Second Tab')).toBeInTheDocument()
      expect(screen.getByText('Third Tab')).toBeInTheDocument()
    })

    it('should render active tab content', () => {
      render(<TabbedView {...defaultProps} />)

      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    })

    it('should render different content when activeKey changes', () => {
      render(<TabbedView {...defaultProps} activeKey="tab2" />)

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    it('should return null when tabs array is empty', () => {
      const { container } = render(<TabbedView {...defaultProps} tabs={[]} />)

      expect(container.firstChild).toBeNull()
    })

    it('should render with custom className', () => {
      const { container } = render(<TabbedView {...defaultProps} className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should render tablist with tab navigation label', () => {
      render(<TabbedView {...defaultProps} />)

      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveAttribute('aria-label', 'Tab navigation')
    })
  })

  describe('Tab Interaction', () => {
    it('should call onTabChange when tab is clicked', () => {
      const onTabChange = jest.fn()
      render(<TabbedView {...defaultProps} onTabChange={onTabChange} />)

      fireEvent.click(screen.getByTestId('tab-tab2'))

      expect(onTabChange).toHaveBeenCalledWith('tab2')
    })

    it('should call onTabChange with correct key for each tab', () => {
      const onTabChange = jest.fn()
      render(<TabbedView {...defaultProps} onTabChange={onTabChange} />)

      fireEvent.click(screen.getByTestId('tab-tab1'))
      expect(onTabChange).toHaveBeenCalledWith('tab1')

      fireEvent.click(screen.getByTestId('tab-tab3'))
      expect(onTabChange).toHaveBeenCalledWith('tab3')
    })
  })

  describe('Accessibility', () => {
    it('should have tablist role on tab container', () => {
      render(<TabbedView {...defaultProps} />)

      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('should have tab role on each tab button', () => {
      render(<TabbedView {...defaultProps} />)

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(3)
    })

    it('should have tabpanel role on content container', () => {
      render(<TabbedView {...defaultProps} />)

      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })

    it('should set aria-selected on active tab', () => {
      render(<TabbedView {...defaultProps} activeKey="tab2" />)

      expect(screen.getByTestId('tab-tab1')).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByTestId('tab-tab2')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('tab-tab3')).toHaveAttribute('aria-selected', 'false')
    })

    it('should set aria-controls linking tab to panel', () => {
      render(<TabbedView {...defaultProps} />)

      expect(screen.getByTestId('tab-tab1')).toHaveAttribute('aria-controls', 'tabpanel-tab1')
    })

    it('should set panel id matching aria-controls', () => {
      render(<TabbedView {...defaultProps} />)

      expect(screen.getByTestId('tabpanel-tab1')).toHaveAttribute('id', 'tabpanel-tab1')
    })
  })

  describe('RTL Support', () => {
    it('should set dir="ltr" for LTR direction', () => {
      const { container } = render(<TabbedView {...defaultProps} direction={DirectionEnum.LTR} />)

      expect(container.firstChild).toHaveAttribute('dir', 'ltr')
    })

    it('should set dir="rtl" for RTL direction', () => {
      const { container } = render(<TabbedView {...defaultProps} direction={DirectionEnum.RTL} />)

      expect(container.firstChild).toHaveAttribute('dir', 'rtl')
    })
  })

  describe('Single Tab', () => {
    it('should render correctly with single tab', () => {
      const singleTab: Tab[] = [{ key: 'only', label: 'Only Tab', content: <div>Only Content</div> }]

      render(<TabbedView {...defaultProps} tabs={singleTab} activeKey="only" />)

      expect(screen.getByText('Only Tab')).toBeInTheDocument()
      expect(screen.getByText('Only Content')).toBeInTheDocument()
    })
  })

  describe('Tab with Data', () => {
    it('should accept tabs with optional data property', () => {
      interface TabData {
        id: number
        metadata: string
      }

      const tabsWithData: Tab<TabData>[] = [
        { key: 'data1', label: 'Data Tab', content: <div>Data Content</div>, data: { id: 1, metadata: 'test' } },
      ]

      render(<TabbedView tabs={tabsWithData} activeKey="data1" onTabChange={jest.fn()} direction={DirectionEnum.LTR} />)

      expect(screen.getByText('Data Tab')).toBeInTheDocument()
    })
  })

  describe('No Active Tab Match', () => {
    it('should not render panel when activeKey does not match any tab', () => {
      render(<TabbedView {...defaultProps} activeKey="nonexistent" />)

      // Tabs should still render
      expect(screen.getByTestId('tab-tab1')).toBeInTheDocument()

      // But no tabpanel should be rendered
      expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
    })
  })

  describe('afterTabBar prop', () => {
    it('should render afterTabBar content when provided', () => {
      render(
        <TabbedView {...defaultProps} afterTabBar={<div data-testid="after-tab-bar-content">Filter controls</div>} />
      )

      expect(screen.getByTestId('after-tab-bar-content')).toBeInTheDocument()
      expect(screen.getByText('Filter controls')).toBeInTheDocument()
    })

    it('should not render afterTabBar when not provided', () => {
      render(<TabbedView {...defaultProps} />)

      expect(screen.queryByTestId('after-tab-bar-content')).not.toBeInTheDocument()
    })

    it('should render afterTabBar between tabs and panel', () => {
      const { container } = render(
        <TabbedView {...defaultProps} afterTabBar={<div data-testid="after-tab-bar-content">Filter controls</div>} />
      )

      // Verify order: tablist, afterTabBar, tabpanel
      const children = Array.from(container.firstChild?.childNodes ?? [])
      const tablistIndex = children.findIndex(
        child => child instanceof Element && child.getAttribute('role') === 'tablist'
      )
      const afterTabBarIndex = children.findIndex(
        child => child instanceof Element && child.getAttribute('data-testid') === 'after-tab-bar-content'
      )
      const tabpanelIndex = children.findIndex(
        child => child instanceof Element && child.getAttribute('role') === 'tabpanel'
      )

      expect(tablistIndex).toBeLessThan(afterTabBarIndex)
      expect(afterTabBarIndex).toBeLessThan(tabpanelIndex)
    })
  })

  describe('showPanel prop', () => {
    it('should render panel content by default (showPanel=true)', () => {
      render(<TabbedView {...defaultProps} />)

      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('should not render panel content when showPanel is false', () => {
      render(<TabbedView {...defaultProps} showPanel={false} />)

      // Tabs should still render
      expect(screen.getByTestId('tab-tab1')).toBeInTheDocument()

      // But no tabpanel should be rendered
      expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    })

    it('should render panel content when showPanel is explicitly true', () => {
      render(<TabbedView {...defaultProps} showPanel={true} />)

      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })

    it('should still allow tab interaction when showPanel is false', () => {
      const onTabChange = jest.fn()
      render(<TabbedView {...defaultProps} onTabChange={onTabChange} showPanel={false} />)

      fireEvent.click(screen.getByTestId('tab-tab2'))

      expect(onTabChange).toHaveBeenCalledWith('tab2')
    })

    it('should render afterTabBar even when showPanel is false', () => {
      render(
        <TabbedView {...defaultProps} showPanel={false} afterTabBar={<div data-testid="after-tab-bar">Filters</div>} />
      )

      expect(screen.getByTestId('after-tab-bar')).toBeInTheDocument()
      expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
    })
  })

  describe('Content Fade Animation', () => {
    it('should apply animate-fade-in class to tab panel', () => {
      render(<TabbedView {...defaultProps} />)

      const tabpanel = screen.getByRole('tabpanel')
      expect(tabpanel).toHaveClass('animate-fade-in')
    })

    it('should apply animate-fade-in for all background variants', () => {
      const { rerender } = render(<TabbedView {...defaultProps} backgroundVariant="none" />)
      expect(screen.getByRole('tabpanel')).toHaveClass('animate-fade-in')

      rerender(<TabbedView {...defaultProps} backgroundVariant="content" />)
      expect(screen.getByRole('tabpanel')).toHaveClass('animate-fade-in')

      rerender(<TabbedView {...defaultProps} backgroundVariant="all" />)
      expect(screen.getByRole('tabpanel')).toHaveClass('animate-fade-in')
    })
  })

  describe('Container Tab Bar (Apple-style)', () => {
    it('should render container tab bar for tabs backgroundVariant', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="tabs" />)

      expect(screen.getByTestId('container-tab-bar')).toBeInTheDocument()
    })

    it('should render container tab bar for separate backgroundVariant', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="separate" />)

      expect(screen.getByTestId('container-tab-bar')).toBeInTheDocument()
    })

    it('should not render container tab bar for none backgroundVariant', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="none" />)

      expect(screen.queryByTestId('container-tab-bar')).not.toBeInTheDocument()
    })

    it('should not render container tab bar for content backgroundVariant', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="content" />)

      expect(screen.queryByTestId('container-tab-bar')).not.toBeInTheDocument()
    })

    it('should render container tab bar for all backgroundVariant', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="all" />)

      expect(screen.getByTestId('container-tab-bar')).toBeInTheDocument()
    })

    it('should render sliding pill with frosted glass Navigation style', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="tabs" />)

      const pill = screen.getByTestId('tab-pill-indicator')
      expect(pill).toBeInTheDocument()
      expect(pill).toHaveClass('transition-all', 'duration-300', 'backdrop-blur-sm')
    })

    it('should render tab scroll container', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="tabs" />)

      expect(screen.getByTestId('tab-scroll-container')).toBeInTheDocument()
    })

    it('should render plain text buttons in container style', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="tabs" />)

      const activeTab = screen.getByTestId('tab-tab1')
      // Container style uses plain HTML buttons, not ButtonAction
      expect(activeTab.tagName).toBe('BUTTON')
      expect(activeTab).toHaveClass('text-foreground')
    })

    it('should apply inactive text color to non-selected tabs in container style', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="tabs" />)

      const inactiveTab = screen.getByTestId('tab-tab2')
      expect(inactiveTab).toHaveClass('text-muted-foreground')
      expect(inactiveTab).not.toHaveClass('text-foreground')
    })

    it('should have Card-style background on container tab bar', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="tabs" />)

      const container = screen.getByTestId('container-tab-bar')
      expect(container).toHaveClass('rounded-xl', 'bg-card', 'shadow-md')
    })

    it('should call onTabChange when container tab is clicked', () => {
      const onTabChange = jest.fn()
      render(<TabbedView {...defaultProps} onTabChange={onTabChange} backgroundVariant="tabs" />)

      fireEvent.click(screen.getByTestId('tab-tab2'))

      expect(onTabChange).toHaveBeenCalledWith('tab2')
    })

    it('should maintain tablist role and aria-label for container tab bar', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="tabs" />)

      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveAttribute('aria-label', 'Tab navigation')
    })

    it('should set aria-selected on container tabs', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="tabs" activeKey="tab2" />)

      expect(screen.getByTestId('tab-tab1')).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByTestId('tab-tab2')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('tab-tab3')).toHaveAttribute('aria-selected', 'false')
    })

    it('should set aria-controls on container tabs', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="tabs" />)

      expect(screen.getByTestId('tab-tab1')).toHaveAttribute('aria-controls', 'tabpanel-tab1')
    })
  })

  describe('Background Variant Rendering', () => {
    it('should not apply background classes for none variant', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="none" />)

      const tabpanel = screen.getByRole('tabpanel')
      expect(tabpanel).not.toHaveClass('shadow-md')
    })

    it('should apply background classes to content panel for content variant', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="content" />)

      const tabpanel = screen.getByRole('tabpanel')
      expect(tabpanel).toHaveClass('shadow-md')
    })

    it('should wrap everything in shared container for all variant', () => {
      const { container } = render(<TabbedView {...defaultProps} backgroundVariant="all" />)

      // The outer div should have a child with bgClasses
      const wrapper = container.firstChild?.firstChild
      expect(wrapper).toHaveClass('shadow-md')
    })

    it('should apply background to tab panel for separate variant', () => {
      render(<TabbedView {...defaultProps} backgroundVariant="separate" />)

      const tabpanel = screen.getByRole('tabpanel')
      expect(tabpanel).toHaveClass('shadow-md')
    })
  })

  describe('Tab Layout', () => {
    it('should render with carousel for scroll layout (default)', () => {
      render(<TabbedView {...defaultProps} tabLayout="scroll" />)

      expect(screen.getByTestId('mock-carousel')).toBeInTheDocument()
    })

    it('should render fill-width tabs for fill layout', () => {
      render(<TabbedView {...defaultProps} tabLayout="fill" />)

      expect(screen.queryByTestId('mock-carousel')).not.toBeInTheDocument()
      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveClass('flex')
    })
  })
})
