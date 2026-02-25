// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for NavigationGroup component
 *
 * Tests the navigation group component with render props pattern:
 * - Display modes (full, partial, minimal, none)
 * - RTL support
 * - Position-based styling (start vs end)
 * - Context passed to children (showText)
 */

import { render, screen } from '@testing-library/react'

import { NavigationGroup } from '@/components/navigation/NavigationGroup'

describe('NavigationGroup', () => {
  describe('Render Props Context', () => {
    it('should pass showText=true when displayMode is full', () => {
      render(
        <NavigationGroup displayMode="full" position="start">
          {({ showText }) => <span data-testid="child">{showText ? 'text-visible' : 'text-hidden'}</span>}
        </NavigationGroup>
      )

      expect(screen.getByTestId('child')).toHaveTextContent('text-visible')
    })

    it('should pass showText=false when displayMode is partial', () => {
      render(
        <NavigationGroup displayMode="partial" position="start">
          {({ showText }) => <span data-testid="child">{showText ? 'text-visible' : 'text-hidden'}</span>}
        </NavigationGroup>
      )

      expect(screen.getByTestId('child')).toHaveTextContent('text-hidden')
    })

    it('should pass showText=false when displayMode is minimal', () => {
      render(
        <NavigationGroup displayMode="minimal" position="start">
          {({ showText }) => <span data-testid="child">{showText ? 'text-visible' : 'text-hidden'}</span>}
        </NavigationGroup>
      )

      expect(screen.getByTestId('child')).toHaveTextContent('text-hidden')
    })

    it('should pass displayMode in context', () => {
      render(
        <NavigationGroup displayMode="partial" position="start">
          {({ displayMode }) => <span data-testid="child">{displayMode}</span>}
        </NavigationGroup>
      )

      expect(screen.getByTestId('child')).toHaveTextContent('partial')
    })
  })

  describe('Display Mode Visibility', () => {
    it('should render children when displayMode is full', () => {
      render(
        <NavigationGroup displayMode="full" position="start">
          {() => <span data-testid="child">content</span>}
        </NavigationGroup>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should render children when displayMode is partial', () => {
      render(
        <NavigationGroup displayMode="partial" position="start">
          {() => <span data-testid="child">content</span>}
        </NavigationGroup>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should render children when displayMode is minimal', () => {
      render(
        <NavigationGroup displayMode="minimal" position="start">
          {() => <span data-testid="child">content</span>}
        </NavigationGroup>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should pass displayMode=none in context', () => {
      render(
        <NavigationGroup displayMode="none" position="start">
          {({ displayMode }) => <span data-testid="child">{displayMode}</span>}
        </NavigationGroup>
      )

      expect(screen.getByTestId('child')).toHaveTextContent('none')
    })
  })

  describe('Position-based styling', () => {
    it('should apply consistent styling for start position', () => {
      render(
        <NavigationGroup displayMode="full" position="start">
          {() => <span>content</span>}
        </NavigationGroup>
      )

      const group = screen.getByTestId('navigation-group-start')
      expect(group).toBeInTheDocument()
    })

    it('should apply consistent styling for end position', () => {
      render(
        <NavigationGroup displayMode="full" position="end">
          {() => <span>content</span>}
        </NavigationGroup>
      )

      const group = screen.getByTestId('navigation-group-end')
      expect(group).toBeInTheDocument()
    })
  })

  describe('Position-based styling', () => {
    describe('LTR', () => {
      it('should apply justify-self-start for start position', () => {
        render(
          <NavigationGroup displayMode="full" position="start">
            {() => <span>content</span>}
          </NavigationGroup>
        )

        const group = screen.getByTestId('navigation-group-start')
        expect(group.className).toContain('justify-self-start')
        expect(group.className).not.toContain('justify-self-end')
      })

      it('should apply justify-self-end for end position', () => {
        render(
          <NavigationGroup displayMode="full" position="end">
            {() => <span>content</span>}
          </NavigationGroup>
        )

        const group = screen.getByTestId('navigation-group-end')
        expect(group.className).toContain('justify-self-end')
        expect(group.className).not.toContain('justify-self-start')
      })
    })

    describe('direction-agnostic (html dir handles RTL)', () => {
      it('should use justify-self-start for start position regardless of direction', () => {
        render(
          <NavigationGroup displayMode="full" position="start">
            {() => <span>content</span>}
          </NavigationGroup>
        )

        const group = screen.getByTestId('navigation-group-start')
        expect(group.className).toContain('justify-self-start')
        expect(group.className).not.toContain('justify-self-end')
      })

      it('should use justify-self-end for end position regardless of direction', () => {
        render(
          <NavigationGroup displayMode="full" position="end">
            {() => <span>content</span>}
          </NavigationGroup>
        )

        const group = screen.getByTestId('navigation-group-end')
        expect(group.className).toContain('justify-self-end')
        expect(group.className).not.toContain('justify-self-start')
      })
    })
  })

  describe('Data attributes', () => {
    it('should set data-testid based on position', () => {
      render(
        <NavigationGroup displayMode="full" position="start">
          {() => <span>content</span>}
        </NavigationGroup>
      )

      expect(screen.getByTestId('navigation-group-start')).toBeInTheDocument()
    })

    it('should set data-display-mode attribute', () => {
      render(
        <NavigationGroup displayMode="partial" position="end">
          {() => <span>content</span>}
        </NavigationGroup>
      )

      expect(screen.getByTestId('navigation-group-end')).toHaveAttribute('data-display-mode', 'partial')
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(
        <NavigationGroup displayMode="full" position="start" className="hidden md:flex">
          {() => <span>content</span>}
        </NavigationGroup>
      )

      const group = screen.getByTestId('navigation-group-start')
      expect(group.className).toContain('hidden')
      expect(group.className).toContain('md:flex')
    })
  })

  describe('Transition classes', () => {
    it('should include transition classes for animations', () => {
      render(
        <NavigationGroup displayMode="full" position="start">
          {() => <span>content</span>}
        </NavigationGroup>
      )

      const group = screen.getByTestId('navigation-group-start')
      expect(group.className).toContain('transition-all')
      expect(group.className).toContain('duration-500')
    })
  })
})
