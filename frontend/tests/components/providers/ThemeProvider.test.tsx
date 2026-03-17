// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ThemeProvider component
 */

import { render, screen } from '@testing-library/react'

import { ThemeProvider, useThemeContext } from '@/components/providers/ThemeProvider'

// Mock the useTheme hook
jest.mock('@/lib/themes', () => ({
  useTheme: jest.fn(() => ({
    theme: 'system',
    resolvedTheme: 'dark',
    setTheme: jest.fn(),
    isLoading: false,
  })),
}))

describe('ThemeProvider', () => {
  it('should render children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Child content</div>
      </ThemeProvider>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('should provide theme context to children', () => {
    /**
     * Test component that uses theme context
     * @returns Theme info display component
     */
    function TestConsumer() {
      const { theme, resolvedTheme } = useThemeContext()
      return (
        <div>
          <span data-testid="theme">{theme}</span>
          <span data-testid="resolved">{resolvedTheme}</span>
        </div>
      )
    }

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
  })
})

describe('useThemeContext', () => {
  it('should throw error when used outside ThemeProvider', () => {
    /**
     * Test component that uses context outside provider
     * @returns null - component only tests hook usage
     */
    function TestConsumer() {
      useThemeContext()
      return null
    }

    // Suppress console.error for this test since we expect an error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Intentionally empty - suppressing expected error output
    })

    expect(() => {
      render(<TestConsumer />)
    }).toThrow('useThemeContext must be used within a ThemeProvider')

    consoleSpy.mockRestore()
  })
})
