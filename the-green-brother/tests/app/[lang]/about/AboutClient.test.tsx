// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for AboutClient component
 */

import { act, render, screen } from '@testing-library/react'

// Mock AboutSections component
jest.mock('@/components/about', () => ({
  AboutSections: function MockAboutSections({ sections, direction }: { sections: unknown[]; direction?: string }) {
    return (
      <div data-testid="about-sections" data-section-count={sections.length} data-direction={direction}>
        About Sections
      </div>
    )
  },
}))

import AboutClient from '@/app/[lang]/about/AboutClient'
import type { ApiAboutAboutDocument } from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'

describe('AboutClient', () => {
  const mockAboutData: ApiAboutAboutDocument = {
    documentId: 'about-1',
    id: 1,
    publishedAt: '2025-01-01',
    sections: [
      {
        __component: 'sections.hero',
        id: 1,
      },
      {
        __component: 'sections.team-grid',
        id: 2,
      },
    ] as ApiAboutAboutDocument['sections'],
    seoMetadata: {
      id: 1,
      metaTitle: 'About Us - TheGreenBrother',
      metaDescription: 'Learn about our mission',
      metaKeywords: ['about', 'the-green-brother'],
    },
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return null when aboutData is null', () => {
    const { container } = render(<AboutClient direction={DirectionEnum.LTR} aboutData={null} />)

    expect(container.firstChild).toBeNull()
  })

  it('should render AboutSections when aboutData is provided', () => {
    render(<AboutClient direction={DirectionEnum.LTR} aboutData={mockAboutData} />)

    expect(screen.getByTestId('about-sections')).toBeInTheDocument()
  })

  it('should pass sections to AboutSections', () => {
    render(<AboutClient direction={DirectionEnum.LTR} aboutData={mockAboutData} />)

    const aboutSections = screen.getByTestId('about-sections')
    expect(aboutSections).toHaveAttribute('data-section-count', '2')
  })

  it('should start with opacity-0 and transition to opacity-100', () => {
    const { container } = render(<AboutClient direction={DirectionEnum.LTR} aboutData={mockAboutData} />)

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

    const { unmount } = render(<AboutClient direction={DirectionEnum.LTR} aboutData={mockAboutData} />)
    unmount()

    expect(cancelAnimationFrameSpy).toHaveBeenCalled()
    cancelAnimationFrameSpy.mockRestore()
  })

  it('should render with transition classes', () => {
    const { container } = render(<AboutClient direction={DirectionEnum.LTR} aboutData={mockAboutData} />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('transition-opacity')
    expect(wrapper.className).toContain('duration-1000')
  })

  it('should have space-y classes for layout', () => {
    const { container } = render(<AboutClient direction={DirectionEnum.LTR} aboutData={mockAboutData} />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('space-y-16')
    expect(wrapper.className).toContain('md:space-y-24')
  })

  it('should pass LTR direction to AboutSections by default', () => {
    render(<AboutClient direction={DirectionEnum.LTR} aboutData={mockAboutData} />)

    expect(screen.getByTestId('about-sections').getAttribute('data-direction')).toBe(DirectionEnum.LTR)
  })

  it('should pass RTL direction to AboutSections when specified', () => {
    render(<AboutClient aboutData={mockAboutData} direction={DirectionEnum.RTL} />)

    expect(screen.getByTestId('about-sections').getAttribute('data-direction')).toBe(DirectionEnum.RTL)
  })
})
