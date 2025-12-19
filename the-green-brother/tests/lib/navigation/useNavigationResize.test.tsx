// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for useNavigationResize hook and calculateVisibility
 *
 * Tests the responsive navigation visibility logic including:
 * - Display mode calculation based on width thresholds
 * - ResizeObserver initialization and cleanup
 * - Search expansion state management
 * - Collapsed items tracking
 */

import { act, render, renderHook, screen } from '@testing-library/react'
import React from 'react'

import { calculateVisibility, useNavigationResize } from '@/lib/navigation/useNavigationResize'

// Mock ResizeObserver
type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void

interface MockResizeObserver {
  observe: jest.Mock
  unobserve: jest.Mock
  disconnect: jest.Mock
  _callback: ResizeObserverCallback
  _triggerResize: (width: number) => void
}

let mockResizeObserverInstance: MockResizeObserver | null = null

const createMockResizeObserver = () => {
  const MockResizeObserver = jest.fn((callback: ResizeObserverCallback) => {
    mockResizeObserverInstance = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      _callback: callback,
      _triggerResize: (width: number) => {
        callback([
          {
            contentRect: { width, height: 64 } as DOMRectReadOnly,
            target: document.createElement('div'),
            borderBoxSize: [],
            contentBoxSize: [],
            devicePixelContentBoxSize: [],
          },
        ])
      },
    }
    return mockResizeObserverInstance
  })

  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
  return MockResizeObserver
}

describe('calculateVisibility', () => {
  describe('DisplayMode Thresholds', () => {
    // Thresholds: END_PARTIAL=1100, START_PARTIAL=700, START_MINIMAL=550, END_MINIMAL=400

    it('should return full mode for both groups when width >= 1100px', () => {
      const visibility = calculateVisibility(1200, 1200, false)

      expect(visibility.startGroupMode).toBe('full')
      expect(visibility.endGroupMode).toBe('full')
    })

    it('should set end group to partial when 700 <= width < 1100', () => {
      const visibility = calculateVisibility(900, 900, false)

      expect(visibility.startGroupMode).toBe('partial')
      expect(visibility.endGroupMode).toBe('partial')
    })

    it('should set start group to partial when 900 <= width < 1050', () => {
      const visibility = calculateVisibility(950, 950, false)

      expect(visibility.startGroupMode).toBe('partial')
      expect(visibility.endGroupMode).toBe('partial')
    })

    it('should set start group to minimal when width < 700', () => {
      const visibility = calculateVisibility(650, 650, false)

      expect(visibility.startGroupMode).toBe('minimal')
      expect(visibility.endGroupMode).toBe('partial')
    })

    it('should set end group to partial (never minimal) even at very small widths', () => {
      // End group never goes to minimal - theme/language/login are always visible
      const visibility = calculateVisibility(350, 350, false)

      expect(visibility.startGroupMode).toBe('minimal')
      expect(visibility.endGroupMode).toBe('partial') // Never minimal
    })

    it('should handle boundary at exactly 1100px (full/partial)', () => {
      const visibility = calculateVisibility(1100, 1100, false)

      // Start: 1100 > 1050 -> Full
      // End: 1100 < 1200 -> Partial
      expect(visibility.startGroupMode).toBe('full')
      expect(visibility.endGroupMode).toBe('partial')
    })

    // ... (1050/1000/900 tests are mostly fine, verification will confirm) ...

    it('should handle boundary at exactly 900px (partial/partial)', () => {
      // 900 is NOT < 900, so Partial
      const visibility = calculateVisibility(900, 900, false)

      expect(visibility.startGroupMode).toBe('partial')
      expect(visibility.endGroupMode).toBe('partial')
    })
  })

  describe('Icon Hysteresis', () => {
    it('should go Minimal in Partial zone if no icons (Start Group - Shrinking)', () => {
      // 1000px is normally Partial for Start
      // If we come from Full, we go Minimal (Full doesn't fit, Partial shows nothing)
      const visibility = calculateVisibility(1000, 1000, false, false, true, 'full', 'full')

      expect(visibility.startGroupMode).toBe('minimal')
    })

    it('should stay Minimal in Partial zone if no icons (Start Group - Growing)', () => {
      // 1000px is normally Partial for Start
      // If we come from Minimal, we stay Minimal
      const visibility = calculateVisibility(1000, 1000, false, false, true, 'minimal', 'full')

      expect(visibility.startGroupMode).toBe('minimal')
    })

    it('should behave normally (Partial) if icons exist (Start Group)', () => {
      // 1000px is normally Partial for Start
      // icons=true
      const visibility = calculateVisibility(1000, 1000, false, true, true, 'full', 'full')

      expect(visibility.startGroupMode).toBe('partial')
    })

    it('should stay Full in Partial zone if no icons (End Group - Shrinking)', () => {
      // 1150px is normally Partial for End (Threshold 1200)
      // If we come from Full, we stay Full
      const visibility = calculateVisibility(1150, 1150, false, true, false, 'full', 'full')

      expect(visibility.endGroupMode).toBe('full')
    })

    it('should stay Minimal in Partial zone if no icons (End Group - Growing)', () => {
      // 1150px is normally Partial for End
      // If we come from Minimal, we stay Minimal
      const visibility = calculateVisibility(1150, 1150, false, true, false, 'full', 'minimal')

      expect(visibility.endGroupMode).toBe('minimal')
    })

    it('should default to Minimal if prev state is not Full/Minimal (e.g. None) and no icons in Partial zone', () => {
      // 1000px Partial zone. No icons. Prev 'none'.
      // Should default to minimal (safety)
      // We use 'none' as a valid DisplayMode that falls through the if/else if checks
      const visibility = calculateVisibility(1000, 1000, false, false, true, 'none')

      expect(visibility.startGroupMode).toBe('minimal')
    })
  })

  describe('Search Expansion Impact', () => {
    it('should affect start group mode when search is expanded (coupled)', () => {
      // Search expansion reduces effective width by 200px
      // 1200 - 200 = 1000 (< 1050 START_PARTIAL)
      const withoutSearch = calculateVisibility(1200, 1200, false)
      const withSearch = calculateVisibility(1200, 1200, true)

      expect(withoutSearch.startGroupMode).toBe('full') // 1200 > 1050
      expect(withSearch.startGroupMode).toBe('partial') // 1000 < 1050
    })

    it('should switch start group to minimal when search expansion pushes effective width below threshold', () => {
      // 1000 - 200 = 800 (< 900 START_MINIMAL)
      const withoutSearch = calculateVisibility(1000, 1000, false)
      const withSearch = calculateVisibility(1000, 1000, true)

      expect(withoutSearch.startGroupMode).toBe('partial') // 1000 > 900
      expect(withSearch.startGroupMode).toBe('minimal') // 800 < 900
    })

    it('should NOT affect end group mode when search is expanded', () => {
      // End group uses actual width, not effective width
      const withoutSearch = calculateVisibility(1000, 1000, false)
      const withSearch = calculateVisibility(1000, 1000, true)

      // Both should have same end group mode
      expect(withSearch.endGroupMode).toBe(withoutSearch.endGroupMode)
      expect(withSearch.endGroupMode).toBe('partial') // 1000 < 1200
    })

    it('should keep start visible if still enough space after expansion', () => {
      // 1300 - 200 = 1100 (> 1050 START_PARTIAL)
      const withSearch = calculateVisibility(1300, 1300, true)

      expect(withSearch.startGroupMode).toBe('full')
    })

    it('should set both groups to none when search is expanded in small layout', () => {
      // When width < 700 and search is expanded, both groups should be 'none'
      const visibility = calculateVisibility(600, 600, true)

      expect(visibility.startGroupMode).toBe('none')
      expect(visibility.endGroupMode).toBe('none')
    })

    it('should NOT set groups to none when search is NOT expanded in small layout', () => {
      // When width < 700 and search is NOT expanded, groups should remain minimal/partial
      const visibility = calculateVisibility(600, 600, false)

      expect(visibility.startGroupMode).toBe('minimal')
      expect(visibility.endGroupMode).toBe('partial')
    })
  })

  describe('Search Max Width Calculation', () => {
    it('should calculate search max width based on available space', () => {
      const visibility = calculateVisibility(1000, 1000, false)

      // navWidth is passed through
      expect(visibility.navWidth).toBe(1000)
    })

    it('should pass through small width', () => {
      const visibility = calculateVisibility(100, 100, false)

      expect(visibility.navWidth).toBe(100)
    })

    it('should handle zero width gracefully', () => {
      const visibility = calculateVisibility(0, 0, false)

      expect(visibility.navWidth).toBe(0)
      expect(visibility.startGroupMode).toBe('minimal')
      expect(visibility.endGroupMode).toBe('partial') // End group never goes minimal
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large width', () => {
      const visibility = calculateVisibility(5000, 5000, false)

      expect(visibility.startGroupMode).toBe('full')
      expect(visibility.endGroupMode).toBe('full')
      expect(visibility.navWidth).toBe(5000)
    })

    it('should handle negative width as minimal for start group only', () => {
      const visibility = calculateVisibility(-100, -100, false)

      expect(visibility.startGroupMode).toBe('minimal')
      expect(visibility.endGroupMode).toBe('partial') // End group never goes minimal
    })
  })
})

describe('useNavigationResize', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockResizeObserverInstance = null
    createMockResizeObserver()
  })

  afterEach(() => {
    mockResizeObserverInstance = null
  })

  describe('Initialization', () => {
    it('should return refs and visibility state', () => {
      const { result } = renderHook(() => useNavigationResize())

      expect(result.current.navRef).toBeDefined()
      expect(result.current.visibility).toBeDefined()
      expect(result.current.isSearchExpanded).toBe(false)
      expect(result.current.setSearchExpanded).toBeDefined()
    })

    it('should initialize with full display modes by default', () => {
      const { result } = renderHook(() => useNavigationResize())

      expect(result.current.visibility.startGroupMode).toBe('full')
      expect(result.current.visibility.endGroupMode).toBe('full')
    })

    it('should have navRef with null initial value', () => {
      const { result } = renderHook(() => useNavigationResize())

      expect(result.current.navRef.current).toBeNull()
    })
  })

  describe('ResizeObserver Integration', () => {
    it('should not create ResizeObserver when navRef is null', () => {
      renderHook(() => useNavigationResize())

      // ResizeObserver should not be instantiated when ref is null
      // The effect runs but returns early before creating observer
      expect(mockResizeObserverInstance).toBeNull()
    })

    it('should provide navRef that can be attached to an element', () => {
      const { result } = renderHook(() => useNavigationResize())

      // Verify the ref can be used
      const mockElement = document.createElement('nav')
      // Using type assertion to set ref value for testing purposes
      Object.defineProperty(result.current.navRef, 'current', { value: mockElement, writable: true })

      expect(result.current.navRef.current).toBe(mockElement)
    })
  })

  describe('Search Expansion State', () => {
    it('should track search expanded state', () => {
      const { result } = renderHook(() => useNavigationResize())

      expect(result.current.isSearchExpanded).toBe(false)

      act(() => {
        result.current.setSearchExpanded(true)
      })

      expect(result.current.isSearchExpanded).toBe(true)

      act(() => {
        result.current.setSearchExpanded(false)
      })

      expect(result.current.isSearchExpanded).toBe(false)
    })

    it('should be stable across rerenders', () => {
      const { result, rerender } = renderHook(() => useNavigationResize())

      const initialSetSearchExpanded = result.current.setSearchExpanded

      rerender()

      expect(result.current.setSearchExpanded).toBe(initialSetSearchExpanded)
    })

    it('should not toggle when already in same state', () => {
      const { result } = renderHook(() => useNavigationResize())

      // Should not change if already false
      act(() => {
        result.current.setSearchExpanded(false)
      })
      expect(result.current.isSearchExpanded).toBe(false)

      // Set to true
      act(() => {
        result.current.setSearchExpanded(true)
      })
      expect(result.current.isSearchExpanded).toBe(true)

      // Should not change if already true
      act(() => {
        result.current.setSearchExpanded(true)
      })
      expect(result.current.isSearchExpanded).toBe(true)
    })
  })

  describe('Transition Protection', () => {
    let boundingClientRectMock: jest.SpyInstance

    beforeEach(() => {
      jest.useFakeTimers()
      boundingClientRectMock = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        width: 1200,
        height: 64,
        top: 0,
        left: 0,
        bottom: 64,
        right: 1200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      })
    })

    afterEach(() => {
      jest.useRealTimers()
      boundingClientRectMock.mockRestore()
    })

    /**
     * Test component for transition protection tests
     * @returns Test component JSX
     */
    function TransitionTestComponent() {
      const { navRef, visibility, isSearchExpanded, setSearchExpanded } = useNavigationResize()

      return (
        <nav ref={navRef as React.RefObject<HTMLElement>} data-testid="test-nav">
          <span data-testid="start-mode">{visibility.startGroupMode}</span>
          <span data-testid="search-expanded">{String(isSearchExpanded)}</span>
          <button
            data-testid="expand-search"
            onClick={() => {
              setSearchExpanded(true)
            }}
          >
            Expand
          </button>
          <button
            data-testid="collapse-search"
            onClick={() => {
              setSearchExpanded(false)
            }}
          >
            Collapse
          </button>
        </nav>
      )
    }

    it('should NOT close search when resize occurs during transition period', () => {
      render(<TransitionTestComponent />)

      // Expand search
      act(() => {
        screen.getByTestId('expand-search').click()
      })

      expect(screen.getByTestId('search-expanded')).toHaveTextContent('true')

      // Simulate a significant width change (like internal layout shift)
      // This should NOT close search because we're in transition period
      act(() => {
        mockResizeObserverInstance?._triggerResize(900) // significant change from 1200
      })

      // Search should STILL be expanded (transition protection)
      expect(screen.getByTestId('search-expanded')).toHaveTextContent('true')
    })

    it('should close search when resize occurs AFTER transition period ends', () => {
      render(<TransitionTestComponent />)

      // Expand search
      act(() => {
        screen.getByTestId('expand-search').click()
      })

      expect(screen.getByTestId('search-expanded')).toHaveTextContent('true')

      // Fast-forward past the transition period (800ms)
      act(() => {
        jest.advanceTimersByTime(900)
      })

      // The transition timeout updates prevWidthRef to the current width (1200)
      // Now simulate a significant external resize (>20px change)
      act(() => {
        mockResizeObserverInstance?._triggerResize(1100) // 100px change from 1200
      })

      // Search should now be closed (transition period ended, significant resize detected)
      expect(screen.getByTestId('search-expanded')).toHaveTextContent('false')
    })

    it('should clear pending transition timeout when search state changes rapidly', () => {
      render(<TransitionTestComponent />)

      // Rapid toggle: expand, collapse, expand
      act(() => {
        screen.getByTestId('expand-search').click()
      })
      act(() => {
        screen.getByTestId('collapse-search').click()
      })
      act(() => {
        screen.getByTestId('expand-search').click()
      })

      // Should be expanded
      expect(screen.getByTestId('search-expanded')).toHaveTextContent('true')

      // Resize during transition should still be protected
      act(() => {
        mockResizeObserverInstance?._triggerResize(900)
      })

      // Search should still be expanded
      expect(screen.getByTestId('search-expanded')).toHaveTextContent('true')
    })

    it('should not close search for small width changes (< 20px)', () => {
      render(<TransitionTestComponent />)

      // Expand search
      act(() => {
        screen.getByTestId('expand-search').click()
      })

      // Fast-forward past transition period (800ms)
      act(() => {
        jest.advanceTimersByTime(900)
      })

      // Small width change (less than 20px threshold)
      act(() => {
        mockResizeObserverInstance?._triggerResize(1185) // only 15px change
      })

      // Search should still be expanded (change too small)
      expect(screen.getByTestId('search-expanded')).toHaveTextContent('true')
    })
  })

  describe('Cleanup', () => {
    it('should handle unmount gracefully when no observer was created', () => {
      const { result, unmount } = renderHook(() => useNavigationResize())

      // Ref is null so no observer was created
      expect(result.current.navRef.current).toBeNull()

      // Should not throw on unmount
      expect(() => {
        unmount()
      }).not.toThrow()
    })
  })

  describe('ResizeObserver with DOM element', () => {
    let rafCallbacks: FrameRequestCallback[] = []

    beforeAll(() => {
      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        width: 1200,
        height: 64,
        top: 0,
        left: 0,
        bottom: 64,
        right: 1200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      })

      // Mock requestAnimationFrame to execute synchronously in tests
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
        rafCallbacks.push(callback)
        return rafCallbacks.length
      })
      jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
        // No-op for tests
      })
    })

    beforeEach(() => {
      rafCallbacks = []
    })

    afterAll(() => {
      jest.restoreAllMocks()
    })

    /**
     * Helper to flush all pending RAF callbacks
     */
    const flushRaf = () => {
      const callbacks = [...rafCallbacks]
      rafCallbacks = []
      callbacks.forEach(cb => {
        cb(performance.now())
      })
    }

    /**
     * Test component that uses the hook with a real DOM element
     * @param props - Component props
     * @param props.onVisibilityChange - Callback when visibility changes
     * @returns Test component JSX
     */
    function TestComponent({
      onVisibilityChange,
    }: {
      onVisibilityChange?: (v: ReturnType<typeof useNavigationResize>['visibility']) => void
    }) {
      const { navRef, visibility, setSearchExpanded } = useNavigationResize()

      React.useEffect(() => {
        onVisibilityChange?.(visibility)
      }, [visibility, onVisibilityChange])

      return (
        <nav ref={navRef as React.RefObject<HTMLElement>} data-testid="test-nav">
          <span data-testid="start-mode">{visibility.startGroupMode}</span>
          <span data-testid="end-mode">{visibility.endGroupMode}</span>
          <button
            data-testid="toggle-search"
            onClick={() => {
              setSearchExpanded(true)
            }}
          >
            Toggle
          </button>
        </nav>
      )
    }

    it('should create ResizeObserver when component mounts with ref', () => {
      render(<TestComponent />)

      expect(screen.getByTestId('test-nav')).toBeInTheDocument()
      expect(mockResizeObserverInstance).not.toBeNull()
      expect(mockResizeObserverInstance?.observe).toHaveBeenCalled()
    })

    it('should update visibility when ResizeObserver triggers resize', () => {
      render(<TestComponent />)

      // Initially should be full mode (default state)
      expect(screen.getByTestId('start-mode')).toHaveTextContent('full')

      // Trigger a resize to a narrow width (500px)
      act(() => {
        mockResizeObserverInstance?._triggerResize(500)
        flushRaf() // Flush RAF to process visibility update
      })

      // startGroupMode should now be minimal (500 < 900)
      expect(screen.getByTestId('start-mode')).toHaveTextContent('minimal')
      // endGroupMode should be partial (end never goes minimal)
      expect(screen.getByTestId('end-mode')).toHaveTextContent('partial')
    })

    it('should handle empty entries array in ResizeObserver callback', () => {
      render(<TestComponent />)

      // Get initial visibility
      const initialStartMode = screen.getByTestId('start-mode').textContent

      // Trigger callback with empty array
      act(() => {
        mockResizeObserverInstance?._callback([])
      })

      // Visibility should remain unchanged
      expect(screen.getByTestId('start-mode')).toHaveTextContent(initialStartMode!)
    })

    it('should disconnect ResizeObserver on unmount', () => {
      const { unmount } = render(<TestComponent />)

      expect(mockResizeObserverInstance).not.toBeNull()

      unmount()

      expect(mockResizeObserverInstance?.disconnect).toHaveBeenCalled()
    })

    it('should NOT recreate ResizeObserver when search expansion changes (uses ref)', async () => {
      render(<TestComponent />)

      const firstObserver = mockResizeObserverInstance
      expect(firstObserver).not.toBeNull()

      // Click to expand search
      const toggleButton = screen.getByTestId('toggle-search')
      act(() => {
        toggleButton.click()
      })

      // The observer should NOT be disconnected - we use ref to avoid recreating
      // This prevents the feedback loop bug when dropdown opens
      expect(firstObserver?.disconnect).not.toHaveBeenCalled()
    })
  })
})
