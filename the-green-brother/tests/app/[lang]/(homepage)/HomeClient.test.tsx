// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for HomeClient component
 */

import { act, render, screen } from '@testing-library/react'

// Mock HomeSections component
jest.mock('@/components/homepage', () => ({
  HomeSections: function MockHomeSections({ direction }: { direction?: string }) {
    return (
      <div data-testid="home-sections" data-direction={direction}>
        Home Sections
      </div>
    )
  },
}))

import HomeClient, { type HomeClientProps } from '@/app/[lang]/(homepage)/HomeClient'
import { DirectionEnum } from '@/lib/generated/types.gen'

describe('HomeClient', () => {
  const defaultProps: HomeClientProps = {
    homepageData: {
      sections: [],
    } as unknown as HomeClientProps['homepageData'],
    products: [],
    categories: [],
    blogPosts: [],
    direction: DirectionEnum.LTR,
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return null when homepageData is null', () => {
    const { container } = render(<HomeClient {...defaultProps} homepageData={null} />)

    expect(container.firstChild).toBeNull()
  })

  it('should render HomeSections when homepageData is provided', () => {
    render(<HomeClient {...defaultProps} />)

    expect(screen.getByTestId('home-sections')).toBeInTheDocument()
  })

  it('should start with opacity-0 and transition to opacity-100', () => {
    const { container } = render(<HomeClient {...defaultProps} />)

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

    const { unmount } = render(<HomeClient {...defaultProps} />)
    unmount()

    expect(cancelAnimationFrameSpy).toHaveBeenCalled()
    cancelAnimationFrameSpy.mockRestore()
  })

  it('should render with transition classes', () => {
    const { container } = render(<HomeClient {...defaultProps} />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('transition-opacity')
    expect(wrapper.className).toContain('duration-1000')
  })

  it('should pass LTR direction to HomeSections by default', () => {
    render(<HomeClient {...defaultProps} />)

    expect(screen.getByTestId('home-sections').getAttribute('data-direction')).toBe(DirectionEnum.LTR)
  })

  it('should pass RTL direction to HomeSections when specified', () => {
    render(<HomeClient {...defaultProps} direction={DirectionEnum.RTL} />)

    expect(screen.getByTestId('home-sections').getAttribute('data-direction')).toBe(DirectionEnum.RTL)
  })
})
