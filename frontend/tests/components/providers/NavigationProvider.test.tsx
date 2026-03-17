// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for NavigationProvider component
 *
 * Tests the navigation context provider including:
 * - Rendering children
 * - Providing navigation context
 * - Error handling when used outside provider
 */

import { render, screen } from '@testing-library/react'

import { NavigationProvider, useNavigationContext } from '@/components/providers/NavigationProvider'

// Mock the useNavigationResize hook
jest.mock('@/lib/navigation', () => ({
  useNavigationResize: jest.fn(() => ({
    navRef: { current: null },
    visibility: {
      startGroupMode: 'full' as const,
      endGroupMode: 'full' as const,
      searchMaxWidth: 256,
    },
    isSearchExpanded: false,
    setSearchExpanded: jest.fn(),
    isReady: true,
  })),
}))

describe('NavigationProvider', () => {
  it('should render children', () => {
    render(
      <NavigationProvider>
        <div data-testid="child">Child content</div>
      </NavigationProvider>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('should provide navigation context to children', () => {
    /**
     * Test component that uses navigation context
     * @returns Navigation info display component
     */
    function TestConsumer() {
      const { visibility, isSearchExpanded } = useNavigationContext()
      return (
        <div>
          <span data-testid="startGroupMode">{visibility.startGroupMode}</span>
          <span data-testid="endGroupMode">{visibility.endGroupMode}</span>

          <span data-testid="isSearchExpanded">{String(isSearchExpanded)}</span>
        </div>
      )
    }

    render(
      <NavigationProvider>
        <TestConsumer />
      </NavigationProvider>
    )

    expect(screen.getByTestId('startGroupMode')).toHaveTextContent('full')
    expect(screen.getByTestId('endGroupMode')).toHaveTextContent('full')

    expect(screen.getByTestId('isSearchExpanded')).toHaveTextContent('false')
  })

  it('should provide navRef through context', () => {
    /**
     * Test component that accesses navRef
     * @returns Ref status display component
     */
    function TestConsumer() {
      const { navRef } = useNavigationContext()

      return <span data-testid="hasRef">{String(typeof navRef === 'object')}</span>
    }

    render(
      <NavigationProvider>
        <TestConsumer />
      </NavigationProvider>
    )

    expect(screen.getByTestId('hasRef')).toHaveTextContent('true')
  })

  it('should provide setSearchExpanded function through context', () => {
    /**
     * Test component that accesses setSearchExpanded
     * @returns Function availability display component
     */
    function TestConsumer() {
      const { setSearchExpanded } = useNavigationContext()
      return <span data-testid="hasFunction">{String(typeof setSearchExpanded === 'function')}</span>
    }

    render(
      <NavigationProvider>
        <TestConsumer />
      </NavigationProvider>
    )

    expect(screen.getByTestId('hasFunction')).toHaveTextContent('true')
  })
})

describe('useNavigationContext', () => {
  it('should throw error when used outside NavigationProvider', () => {
    /**
     * Test component that uses context outside provider
     * @returns null - component only tests hook usage
     */
    function TestConsumer() {
      useNavigationContext()
      return null
    }

    // Suppress console.error for this test since we expect an error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Intentionally empty - suppressing expected error output
    })

    expect(() => {
      render(<TestConsumer />)
    }).toThrow('useNavigationContext must be used within a NavigationProvider')

    consoleSpy.mockRestore()
  })
})
