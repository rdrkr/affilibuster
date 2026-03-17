// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for LayoutProvider component
 */

import { render, renderHook, screen } from '@testing-library/react'

import { LayoutProvider, useLayoutContext } from '@/components/providers/LayoutProvider'
import type { ApiNavigationNavigationDocument } from '@/lib/generated/types.gen'
import { LanguageCode, DirectionEnum } from '@/lib/generated/types.gen'

describe('LayoutProvider', () => {
  const mockNavigation = {
    brandButton: { url: '/', label: { text: 'Brand' } },
  } as unknown as ApiNavigationNavigationDocument

  it('should provide layout context to children', () => {
    /**
     * Test component that consumes layout context
     * @returns JSX.Element
     */
    function TestConsumer() {
      const { lang, direction, navigation } = useLayoutContext()
      return (
        <div>
          <span data-testid="lang">{lang}</span>
          <span data-testid="direction">{direction}</span>
          <span data-testid="navigation">{navigation ? 'has-nav' : 'no-nav'}</span>
        </div>
      )
    }

    render(
      <LayoutProvider lang={LanguageCode.EN} direction={DirectionEnum.LTR} navigation={mockNavigation}>
        <TestConsumer />
      </LayoutProvider>
    )

    expect(screen.getByTestId('lang')).toHaveTextContent('en')
    expect(screen.getByTestId('direction')).toHaveTextContent('ltr')
    expect(screen.getByTestId('navigation')).toHaveTextContent('has-nav')
  })

  it('should provide null navigation when not available', () => {
    /**
     * Test component that consumes layout context
     * @returns JSX.Element
     */
    function TestConsumer() {
      const { navigation } = useLayoutContext()
      return <span data-testid="navigation">{navigation ? 'has-nav' : 'no-nav'}</span>
    }

    render(
      <LayoutProvider lang={LanguageCode.EN} direction={DirectionEnum.LTR} navigation={null}>
        <TestConsumer />
      </LayoutProvider>
    )

    expect(screen.getByTestId('navigation')).toHaveTextContent('no-nav')
  })

  it('should sync document.documentElement.lang and dir on mount', () => {
    render(
      <LayoutProvider lang={LanguageCode.HE} direction={DirectionEnum.RTL} navigation={null}>
        <div />
      </LayoutProvider>
    )

    expect(document.documentElement.lang).toBe('he')
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('should update document.documentElement when direction changes', () => {
    const { rerender } = render(
      <LayoutProvider lang={LanguageCode.EN} direction={DirectionEnum.LTR} navigation={null}>
        <div />
      </LayoutProvider>
    )

    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')

    rerender(
      <LayoutProvider lang={LanguageCode.HE} direction={DirectionEnum.RTL} navigation={null}>
        <div />
      </LayoutProvider>
    )

    expect(document.documentElement.lang).toBe('he')
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('should throw error when useLayoutContext is used outside provider', () => {
    // Suppress console.error for expected error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useLayoutContext())
    }).toThrow('useLayoutContext must be used within a LayoutProvider')

    consoleSpy.mockRestore()
  })
})
