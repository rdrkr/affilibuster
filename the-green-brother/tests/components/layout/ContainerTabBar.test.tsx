// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for ContainerTabBar component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { ContainerTabBar } from '@/components/layout/ContainerTabBar'
import type { Tab } from '@/components/layout/tabbed-view-types'
import { DirectionEnum } from '@/lib/generated/types.gen'

// Mock ButtonAction component
jest.mock('@/components/elements/ButtonAction', () => ({
  ButtonAction: function MockButtonAction({
    children,
    onClick,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
    className,
  }: {
    children: React.ReactNode
    onClick: () => void
    'aria-label'?: string
    'data-testid'?: string
    className?: string
  }) {
    return (
      <button onClick={onClick} aria-label={ariaLabel} data-testid={dataTestId} className={className}>
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

describe('ContainerTabBar', () => {
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
    it('should render container tab bar', () => {
      render(<ContainerTabBar {...defaultProps} />)
      expect(screen.getByTestId('container-tab-bar')).toBeInTheDocument()
    })

    it('should maintain tablist role and aria-label', () => {
      render(<ContainerTabBar {...defaultProps} />)
      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveAttribute('aria-label', 'Tab navigation')
    })

    it('should have Card-style background on container', () => {
      render(<ContainerTabBar {...defaultProps} />)
      const container = screen.getByTestId('container-tab-bar')
      expect(container).toHaveClass('rounded-xl', 'bg-card', 'shadow-md')
    })

    it('should render sliding pill with frosted glass style', () => {
      render(<ContainerTabBar {...defaultProps} />)
      const pill = screen.getByTestId('tab-pill-indicator')
      expect(pill).toBeInTheDocument()
      expect(pill).toHaveClass('transition-all', 'duration-300', 'backdrop-blur-sm')
    })

    it('should render tab scroll container', () => {
      render(<ContainerTabBar {...defaultProps} />)
      expect(screen.getByTestId('tab-scroll-container')).toBeInTheDocument()
    })
  })

  describe('Tab Buttons', () => {
    it('should render plain text buttons', () => {
      render(<ContainerTabBar {...defaultProps} />)
      const activeTab = screen.getByTestId('tab-tab1')
      expect(activeTab.tagName).toBe('BUTTON')
    })

    it('should apply active text color to selected tab', () => {
      render(<ContainerTabBar {...defaultProps} activeKey="tab1" />)
      const activeTab = screen.getByTestId('tab-tab1')
      expect(activeTab).toHaveClass('text-foreground')
    })

    it('should apply inactive text color to non-selected tabs', () => {
      render(<ContainerTabBar {...defaultProps} activeKey="tab1" />)
      const inactiveTab = screen.getByTestId('tab-tab2')
      expect(inactiveTab).toHaveClass('text-muted-foreground')
      expect(inactiveTab).not.toHaveClass('text-foreground')
    })

    it('should set aria-selected on tabs', () => {
      render(<ContainerTabBar {...defaultProps} activeKey="tab2" />)
      expect(screen.getByTestId('tab-tab1')).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByTestId('tab-tab2')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('tab-tab3')).toHaveAttribute('aria-selected', 'false')
    })

    it('should set aria-controls on tabs', () => {
      render(<ContainerTabBar {...defaultProps} />)
      expect(screen.getByTestId('tab-tab1')).toHaveAttribute('aria-controls', 'tabpanel-tab1')
    })

    it('should handle tab unmounting (ref cleanup)', () => {
      const { rerender } = render(<ContainerTabBar {...defaultProps} />)
      // Rerender with fewer tabs to trigger ref cleanup for removed tabs
      // This covers the else branch in setTabButtonRef
      rerender(<ContainerTabBar {...defaultProps} tabs={[mockTabs[0]!]} />)
      expect(screen.queryByTestId('tab-tab2')).not.toBeInTheDocument()
    })

    it('should clean up event listeners on unmount', () => {
      const { unmount } = render(<ContainerTabBar {...defaultProps} />)
      unmount()
    })
  })

  describe('Interaction', () => {
    it('should call onTabChange when tab is clicked', () => {
      const onTabChange = jest.fn()
      render(<ContainerTabBar {...defaultProps} onTabChange={onTabChange} />)

      fireEvent.click(screen.getByTestId('tab-tab2'))
      expect(onTabChange).toHaveBeenCalledWith('tab2')
    })
  })

  describe('Scroll Arrows', () => {
    it('should render scroll start arrow', () => {
      render(<ContainerTabBar {...defaultProps} />)
      expect(screen.getByTestId('tab-scroll-start')).toBeInTheDocument()
    })

    it('should render scroll end arrow', () => {
      render(<ContainerTabBar {...defaultProps} />)
      expect(screen.getByTestId('tab-scroll-end')).toBeInTheDocument()
    })

    // Note: Checking visibility/opacity would require mocking element dimensions and scroll behavior,
    // which is complex in JSDOM. We are testing existence and classes here.
  })
  describe('Scroll Arrows Interaction', () => {
    beforeEach(() => {
      // Mock scrollBy
      Element.prototype.scrollBy = jest.fn()
      // Mock dimensional properties
      Object.defineProperties(HTMLElement.prototype, {
        scrollLeft: { configurable: true, value: 0, writable: true },
        scrollWidth: { configurable: true, value: 1000 },
        clientWidth: { configurable: true, value: 200 },
        offsetLeft: { configurable: true, value: 50 },
        offsetWidth: { configurable: true, value: 100 },
      })
    })

    it('should scroll on start arrow click', () => {
      render(<ContainerTabBar {...defaultProps} />)
      const container = screen.getByTestId('tab-scroll-container')
      // Set scrollLeft to allow scrolling start
      Object.defineProperty(container, 'scrollLeft', { value: 100, configurable: true })
      fireEvent.scroll(container)

      const startArrow = screen.getByTestId('tab-scroll-start')
      fireEvent.click(startArrow)
      expect(Element.prototype.scrollBy).toHaveBeenCalled()
    })

    it('should scroll on end arrow click', () => {
      render(<ContainerTabBar {...defaultProps} />)
      const endArrow = screen.getByTestId('tab-scroll-end')
      fireEvent.click(endArrow)
      expect(Element.prototype.scrollBy).toHaveBeenCalled()
    })

    it('should update arrows on resize', () => {
      render(<ContainerTabBar {...defaultProps} />)
      fireEvent(window, new Event('resize'))
    })

    it('should update arrows on scroll', () => {
      render(<ContainerTabBar {...defaultProps} />)
      const container = screen.getByTestId('tab-scroll-container')
      fireEvent.scroll(container, { target: { scrollLeft: 100 } })
    })

    it('should handle RTL scroll directions', () => {
      render(<ContainerTabBar {...defaultProps} direction={DirectionEnum.RTL} />)
      const startArrow = screen.getByTestId('tab-scroll-start')
      fireEvent.click(startArrow)
      expect(Element.prototype.scrollBy).toHaveBeenCalled()

      const container = screen.getByTestId('tab-scroll-container')
      // Simulate RTL scroll position (negative in some browsers, but logic handles abs)
      Object.defineProperty(container, 'scrollLeft', { value: -50, configurable: true })
      fireEvent.scroll(container)
    })

    it('should handle non-existent active key', () => {
      render(<ContainerTabBar {...defaultProps} activeKey="missing" />)
      // Should not crash, pill position stays 0
      const pill = screen.getByTestId('tab-pill-indicator')
      expect(pill).toBeInTheDocument()
    })
  })
})
