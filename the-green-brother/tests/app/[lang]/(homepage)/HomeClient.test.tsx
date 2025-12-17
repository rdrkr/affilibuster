// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for HomeClient component
 */

import { act, render, screen } from '@testing-library/react'

import HomeClient from '@/app/[lang]/(homepage)/HomeClient'

describe('HomeClient', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render children', () => {
    render(
      <HomeClient>
        <div data-testid="child">Child Content</div>
      </HomeClient>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('should start with opacity-0 and transition to opacity-100', () => {
    const { container } = render(
      <HomeClient>
        <div>Content</div>
      </HomeClient>
    )

    // Initially should be opacity-0
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-0')

    // After requestAnimationFrame, should be opacity-100
    act(() => {
      jest.runAllTimers()
    })

    expect(wrapper.className).toContain('opacity-100')
  })

  it('should cancel animation frame on unmount', () => {
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame')

    const { unmount } = render(
      <HomeClient>
        <div>Content</div>
      </HomeClient>
    )
    unmount()

    expect(cancelAnimationFrameSpy).toHaveBeenCalled()
    cancelAnimationFrameSpy.mockRestore()
  })

  it('should render with transition classes', () => {
    const { container } = render(
      <HomeClient>
        <div>Content</div>
      </HomeClient>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('transition-opacity')
    expect(wrapper.className).toContain('duration-1000')
  })
})
