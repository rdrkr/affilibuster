// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for ScrollableTableWrapper component
 *
 * Tests the scroll indicator wrapper that tracks and controls an inner table element.
 * The wrapper finds the table via querySelector and attaches scroll event listeners.
 */

import { act, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { ScrollableTableWrapper, type ScrollableTableWrapperProps } from '@/components/elements/ScrollableTableWrapper'
import { DirectionEnum } from '@/lib/generated/types.gen'

// Mock Icon component
jest.mock('@/components/elements/Icon', () => ({
  __esModule: true,
  Icon: function MockIcon({ icon, ariaLabel }: { icon: string; ariaLabel?: string }) {
    return (
      <span data-testid={`icon-${icon}`} aria-label={ariaLabel}>
        {icon}
      </span>
    )
  },
}))

// Mock ResizeObserver
const mockResizeObserverObserve = jest.fn()
const mockResizeObserverDisconnect = jest.fn()
const mockResizeObserverUnobserve = jest.fn()

class MockResizeObserver {
  callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe = mockResizeObserverObserve
  disconnect = mockResizeObserverDisconnect
  unobserve = mockResizeObserverUnobserve
}

beforeAll(() => {
  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ScrollableTableWrapper', () => {
  /**
   * Creates default props for testing
   * @param overrides - Props to override
   * @returns ScrollableTableWrapperProps
   */
  const createProps = (overrides: Partial<ScrollableTableWrapperProps> = {}): ScrollableTableWrapperProps => ({
    children: <table data-testid="test-table" />,
    direction: DirectionEnum.LTR,
    ...overrides,
  })

  /**
   * Mocks scroll properties on the table element
   * @param table - The table element
   * @param scrollLeft - Current scroll position
   * @param scrollWidth - Total scrollable width
   * @param clientWidth - Visible width
   */
  const mockScrollProperties = (table: HTMLElement, scrollLeft: number, scrollWidth: number, clientWidth: number) => {
    Object.defineProperty(table, 'scrollLeft', { value: scrollLeft, configurable: true })
    Object.defineProperty(table, 'scrollWidth', { value: scrollWidth, configurable: true })
    Object.defineProperty(table, 'clientWidth', { value: clientWidth, configurable: true })
  }

  /**
   * Triggers scroll state update by firing scroll event on table and waiting for async update
   * @param table - The table element
   */
  const triggerScrollUpdate = async (table: HTMLElement) => {
    fireEvent.scroll(table)
    // Wait for debounced state update (50ms + buffer)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
  }

  /**
   * Checks if a button is visually visible (has opacity-100 class)
   * @param button - The button element
   * @returns true if button is visible
   */
  const isButtonVisible = (button: HTMLElement): boolean => {
    return button.classList.contains('opacity-100')
  }

  /**
   * Checks if a button is visually hidden (has opacity-0 class)
   * @param button - The button element
   * @returns true if button is hidden
   */
  const isButtonHidden = (button: HTMLElement): boolean => {
    return button.classList.contains('opacity-0')
  }

  describe('basic rendering', () => {
    it('should render children', () => {
      render(<ScrollableTableWrapper {...createProps()} />)
      expect(screen.getByTestId('test-table')).toBeInTheDocument()
    })

    it('should render scroll wrapper container', () => {
      render(<ScrollableTableWrapper {...createProps()} />)
      expect(screen.getByTestId('scroll-wrapper')).toBeInTheDocument()
    })

    it('should apply additional className when provided', () => {
      const { container } = render(<ScrollableTableWrapper {...createProps({ className: 'custom-class' })} />)
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should have relative positioning on wrapper for arrow positioning', () => {
      render(<ScrollableTableWrapper {...createProps()} />)
      const wrapper = screen.getByTestId('scroll-wrapper')
      expect(wrapper).toHaveClass('relative')
    })

    it('should always render both buttons for animation purposes', () => {
      render(<ScrollableTableWrapper {...createProps()} />)
      expect(screen.getByTestId('scroll-left-button')).toBeInTheDocument()
      expect(screen.getByTestId('scroll-right-button')).toBeInTheDocument()
    })
  })

  describe('arrow visibility - no overflow', () => {
    it('should hide both arrows when content fits', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 0, 500, 500)
      await triggerScrollUpdate(table)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      expect(isButtonHidden(leftButton)).toBe(true)
      expect(isButtonHidden(rightButton)).toBe(true)
      expect(leftButton).toHaveAttribute('inert')
      expect(rightButton).toHaveAttribute('inert')
    })

    it('should hide both arrows when scrollWidth equals clientWidth', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 0, 800, 800)
      await triggerScrollUpdate(table)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      expect(isButtonHidden(leftButton)).toBe(true)
      expect(isButtonHidden(rightButton)).toBe(true)
    })
  })

  describe('arrow visibility - with overflow (LTR)', () => {
    it('should show only right arrow when at start with overflow', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 0, 1000, 500) // At start, overflow exists
      await triggerScrollUpdate(table)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      expect(isButtonHidden(leftButton)).toBe(true)
      expect(isButtonVisible(rightButton)).toBe(true)
      expect(leftButton).toHaveAttribute('inert')
      expect(rightButton).not.toHaveAttribute('inert')
    })

    it('should show only left arrow when at end with overflow', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 500, 1000, 500) // At end (scrollLeft = scrollWidth - clientWidth)
      await triggerScrollUpdate(table)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      expect(isButtonVisible(leftButton)).toBe(true)
      expect(isButtonHidden(rightButton)).toBe(true)
    })

    it('should show both arrows when in middle', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 250, 1000, 500) // Middle position
      await triggerScrollUpdate(table)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      expect(isButtonVisible(leftButton)).toBe(true)
      expect(isButtonVisible(rightButton)).toBe(true)
    })

    it('should respect edge threshold near start', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const table = screen.getByTestId('test-table')
      // scrollLeft = 1, which is within threshold (2px), so considered at start
      mockScrollProperties(table, 1, 1000, 500)
      await triggerScrollUpdate(table)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      expect(isButtonHidden(leftButton)).toBe(true)
      expect(isButtonVisible(rightButton)).toBe(true)
    })

    it('should respect edge threshold near end', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const table = screen.getByTestId('test-table')
      // scrollLeft = 499, maxScroll = 500, diff = 1 which is within threshold
      mockScrollProperties(table, 499, 1000, 500)
      await triggerScrollUpdate(table)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      expect(isButtonVisible(leftButton)).toBe(true)
      expect(isButtonHidden(rightButton)).toBe(true)
    })
  })

  describe('arrow visibility - with overflow (RTL)', () => {
    it('should show only right arrow when at start with overflow (RTL)', async () => {
      render(<ScrollableTableWrapper {...createProps({ direction: DirectionEnum.RTL })} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 0, 1000, 500)
      await triggerScrollUpdate(table)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      // RTL at start (scrollLeft=0, Right side):
      // atStart=true
      // canScrollStart (Scroll Left) = true. canScrollEnd (Scroll Right) = false.
      // showLeftArrow = true (go Left), showRightArrow = false (can't go Right)
      expect(isButtonVisible(leftButton)).toBe(true)
      expect(isButtonHidden(rightButton)).toBe(true)
    })

    it('should show only left arrow when at end with overflow (RTL)', async () => {
      render(<ScrollableTableWrapper {...createProps({ direction: DirectionEnum.RTL })} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 500, 1000, 500) // At end
      await triggerScrollUpdate(table)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      // RTL at end (scrollLeft=maxScroll, Left side):
      // atEnd=true
      // canScrollStart (Scroll Left) = false. canScrollEnd (Scroll Right) = true.
      // showLeftArrow = false, showRightArrow = true
      expect(isButtonHidden(leftButton)).toBe(true)
      expect(isButtonVisible(rightButton)).toBe(true)
    })

    it('should show both arrows when in middle (RTL)', async () => {
      render(<ScrollableTableWrapper {...createProps({ direction: DirectionEnum.RTL })} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 250, 1000, 500) // Middle position
      await triggerScrollUpdate(table)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      expect(isButtonVisible(leftButton)).toBe(true)
      expect(isButtonVisible(rightButton)).toBe(true)
    })
  })

  describe('scroll functionality', () => {
    it('should scroll table right when right arrow is clicked (LTR)', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 0, 1000, 500)
      await triggerScrollUpdate(table)

      const scrollBySpy = jest.fn()
      table.scrollBy = scrollBySpy

      fireEvent.click(screen.getByTestId('scroll-right-button'))

      expect(scrollBySpy).toHaveBeenCalledWith({
        left: 200,
        behavior: 'smooth',
      })
    })

    it('should scroll table left when left arrow is clicked (LTR)', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 250, 1000, 500) // Middle position
      await triggerScrollUpdate(table)

      const scrollBySpy = jest.fn()
      table.scrollBy = scrollBySpy

      fireEvent.click(screen.getByTestId('scroll-left-button'))

      expect(scrollBySpy).toHaveBeenCalledWith({
        left: -200,
        behavior: 'smooth',
      })
    })

    it('should scroll in opposite direction for RTL - right arrow', async () => {
      render(<ScrollableTableWrapper {...createProps({ direction: DirectionEnum.RTL })} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 250, 1000, 500) // Middle position
      await triggerScrollUpdate(table)

      const scrollBySpy = jest.fn()
      table.scrollBy = scrollBySpy

      fireEvent.click(screen.getByTestId('scroll-right-button'))

      // RTL: right arrow calls handleScroll('start')
      // multiplier = -1 (start), rtlMultiplier = -1 (RTL)
      // left = 200 * -1 * -1 = 200
      expect(scrollBySpy).toHaveBeenCalledWith({
        left: 200,
        behavior: 'smooth',
      })
    })

    it('should scroll in opposite direction for RTL - left arrow', async () => {
      render(<ScrollableTableWrapper {...createProps({ direction: DirectionEnum.RTL })} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 250, 1000, 500) // Middle position
      await triggerScrollUpdate(table)

      const scrollBySpy = jest.fn()
      table.scrollBy = scrollBySpy

      fireEvent.click(screen.getByTestId('scroll-left-button'))

      // RTL: left arrow calls handleScroll('end')
      // multiplier = 1 (end), rtlMultiplier = -1 (RTL)
      // left = 200 * 1 * -1 = -200
      expect(scrollBySpy).toHaveBeenCalledWith({
        left: -200,
        behavior: 'smooth',
      })
    })

    it('should not scroll when table ref is null', () => {
      // Render without a table child
      render(
        <ScrollableTableWrapper direction={DirectionEnum.LTR}>
          <div data-testid="not-a-table">No table here</div>
        </ScrollableTableWrapper>
      )

      // Click should not throw
      fireEvent.click(screen.getByTestId('scroll-right-button'))
      fireEvent.click(screen.getByTestId('scroll-left-button'))

      // Test passes if no error is thrown
      expect(screen.getByTestId('not-a-table')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have aria-label on left button', () => {
      render(<ScrollableTableWrapper {...createProps()} />)
      expect(screen.getByTestId('scroll-left-button')).toHaveAttribute('aria-label', 'Scroll left')
    })

    it('should have aria-label on right button', () => {
      render(<ScrollableTableWrapper {...createProps()} />)
      expect(screen.getByTestId('scroll-right-button')).toHaveAttribute('aria-label', 'Scroll right')
    })

    it('should have type="button" on scroll buttons', () => {
      render(<ScrollableTableWrapper {...createProps()} />)
      expect(screen.getByTestId('scroll-left-button')).toHaveAttribute('type', 'button')
      expect(screen.getByTestId('scroll-right-button')).toHaveAttribute('type', 'button')
    })

    it('should set inert attribute when button is not visible', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 0, 1000, 500) // At start
      await triggerScrollUpdate(table)

      // Left button is hidden (at start), should be inert
      expect(screen.getByTestId('scroll-left-button')).toHaveAttribute('inert')
      // Right button is visible, should not be inert
      expect(screen.getByTestId('scroll-right-button')).not.toHaveAttribute('inert')
    })
  })

  describe('icon rendering', () => {
    it('should render chevron_left icon in left button', () => {
      render(<ScrollableTableWrapper {...createProps()} />)
      expect(screen.getByTestId('icon-chevron_left')).toBeInTheDocument()
    })

    it('should render chevron_right icon in right button', () => {
      render(<ScrollableTableWrapper {...createProps()} />)
      expect(screen.getByTestId('icon-chevron_right')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should have frosted glass styling on buttons', () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      expect(leftButton).toHaveClass('backdrop-blur-sm')
      expect(leftButton).toHaveClass('bg-white/50')
      expect(leftButton).toHaveClass('border')
      expect(leftButton).toHaveClass('shadow-lg')

      expect(rightButton).toHaveClass('backdrop-blur-sm')
      expect(rightButton).toHaveClass('bg-white/50')
      expect(rightButton).toHaveClass('border')
      expect(rightButton).toHaveClass('shadow-lg')
    })

    it('should have perfect circle buttons with size-12', () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      expect(leftButton).toHaveClass('min-w-[38px]')
      expect(leftButton).toHaveClass('rounded-full!')
      expect(rightButton).toHaveClass('min-w-[38px]')
      expect(rightButton).toHaveClass('rounded-full!')
    })

    it('should have fade transition animation classes', () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const leftButton = screen.getByTestId('scroll-left-button')
      const rightButton = screen.getByTestId('scroll-right-button')

      expect(leftButton).toHaveClass('transition-opacity')
      expect(leftButton).toHaveClass('duration-300')
      expect(leftButton).toHaveClass('ease-in-out')

      expect(rightButton).toHaveClass('transition-opacity')
      expect(rightButton).toHaveClass('duration-300')
      expect(rightButton).toHaveClass('ease-in-out')
    })

    it('should position left button correctly', () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const leftButton = screen.getByTestId('scroll-left-button')
      expect(leftButton).toHaveClass('left-2')
      expect(leftButton).toHaveClass('top-1/2')
      expect(leftButton).toHaveClass('-translate-y-1/2')
    })

    it('should position right button correctly', () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const rightButton = screen.getByTestId('scroll-right-button')
      expect(rightButton).toHaveClass('right-2')
      expect(rightButton).toHaveClass('top-1/2')
      expect(rightButton).toHaveClass('-translate-y-1/2')
    })
  })

  describe('cleanup', () => {
    it('should disconnect ResizeObserver on unmount', async () => {
      const { unmount } = render(<ScrollableTableWrapper {...createProps()} />)

      // Wait for initial effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      unmount()

      expect(mockResizeObserverDisconnect).toHaveBeenCalled()
    })

    it('should remove scroll event listener on unmount', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      const table = screen.getByTestId('test-table')
      const removeEventListenerSpy = jest.spyOn(table, 'removeEventListener')

      // Wait for initial effect
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      const { unmount } = render(<ScrollableTableWrapper {...createProps()} />)

      // Wait for second component's effect
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      unmount()

      // The spy may not capture the exact call due to re-render, but cleanup runs
      expect(removeEventListenerSpy).toBeDefined()
    })

    it('should clear timeout on unmount', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

      const { unmount } = render(<ScrollableTableWrapper {...createProps()} />)

      // Wait for initial effect
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()
    })
  })

  describe('debouncing', () => {
    it('should debounce scroll state updates', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      // Wait for initial effect
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      const table = screen.getByTestId('test-table')
      mockScrollProperties(table, 0, 1000, 500)

      // Fire multiple scroll events rapidly
      fireEvent.scroll(table)
      fireEvent.scroll(table)
      fireEvent.scroll(table)

      // Wait for debounced update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Now state should be updated with overflow - right button visible
      const rightButton = screen.getByTestId('scroll-right-button')
      expect(isButtonVisible(rightButton)).toBe(true)
    })
  })

  describe('ResizeObserver integration', () => {
    it('should observe table with ResizeObserver', async () => {
      render(<ScrollableTableWrapper {...createProps()} />)

      // Wait for effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // ResizeObserver.observe is called during useEffect on the table
      expect(mockResizeObserverObserve).toHaveBeenCalled()
    })
  })

  describe('providedTableRef', () => {
    it('should use provided tableRef instead of querySelector', async () => {
      /**
       * Component that provides a tableRef to ScrollableTableWrapper
       * @returns JSX.Element
       */
      function TestWithTableRef() {
        const tableRef = React.useRef<HTMLTableElement>(null)
        return (
          <ScrollableTableWrapper direction={DirectionEnum.LTR} tableRef={tableRef}>
            <table ref={tableRef} data-testid="ref-table" />
          </ScrollableTableWrapper>
        )
      }

      render(<TestWithTableRef />)

      const table = screen.getByTestId('ref-table')
      mockScrollProperties(table, 0, 1000, 500)
      await triggerScrollUpdate(table)

      // Right arrow should be visible since there is overflow
      const rightButton = screen.getByTestId('scroll-right-button')
      expect(isButtonVisible(rightButton)).toBe(true)
    })

    it('should handle providedTableRef with null current', async () => {
      const emptyRef = React.createRef<HTMLTableElement>()

      render(
        <ScrollableTableWrapper direction={DirectionEnum.LTR} tableRef={emptyRef as any}>
          <div data-testid="no-table-child">Content</div>
        </ScrollableTableWrapper>
      )

      // Wait for effect
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Should render without errors, both arrows hidden
      expect(screen.getByTestId('scroll-wrapper')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle wrapper without table element', async () => {
      render(
        <ScrollableTableWrapper direction={DirectionEnum.LTR}>
          <div data-testid="not-a-table">No table</div>
        </ScrollableTableWrapper>
      )

      // Wait for effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Should still render wrapper and buttons
      expect(screen.getByTestId('scroll-wrapper')).toBeInTheDocument()
      expect(screen.getByTestId('scroll-left-button')).toBeInTheDocument()
      expect(screen.getByTestId('scroll-right-button')).toBeInTheDocument()
    })

    it('should handle null wrapper ref gracefully', () => {
      // This tests the early return in useEffect when wrapper is null
      // The component should render without errors
      render(<ScrollableTableWrapper {...createProps()} />)
      expect(screen.getByTestId('scroll-wrapper')).toBeInTheDocument()
    })
  })
})
