// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for AboutClient component
 */

import { act, screen } from '@testing-library/react'

// Mock AboutSections component
jest.mock('@/components/about', () => ({
  AboutSections: function MockAboutSections({
    sections,
    contributors,
    direction,
  }: {
    sections: unknown[]
    contributors?: unknown[]
    direction?: string
  }) {
    return (
      <div
        data-testid="about-sections"
        data-section-count={sections.length}
        data-contributor-count={contributors?.length ?? 0}
        data-direction={direction}
      >
        About Sections
      </div>
    )
  },
}))

import AboutClient from '@/app/[lang]/about/AboutClient'
import type { ApiAboutAboutDocument } from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'
import { renderWithLayout } from '../../../utils/renderWithLayout'

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
    const { container } = renderWithLayout(<AboutClient aboutData={null} contributors={[]} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    expect(container.firstChild).toBeNull()
  })

  it('should render AboutSections when aboutData is provided', () => {
    renderWithLayout(<AboutClient aboutData={mockAboutData} contributors={[]} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    expect(screen.getByTestId('about-sections')).toBeInTheDocument()
  })

  it('should pass sections to AboutSections', () => {
    renderWithLayout(<AboutClient aboutData={mockAboutData} contributors={[]} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    const aboutSections = screen.getByTestId('about-sections')
    expect(aboutSections).toHaveAttribute('data-section-count', '2')
  })

  it('should pass contributors to AboutSections', () => {
    const mockContributors = [{ id: 1 }, { id: 2 }] as any
    renderWithLayout(<AboutClient aboutData={mockAboutData} contributors={mockContributors} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    const aboutSections = screen.getByTestId('about-sections')
    expect(aboutSections).toHaveAttribute('data-contributor-count', '2')
  })

  it('should start with opacity-0 and transition to opacity-100', () => {
    const { container } = renderWithLayout(<AboutClient aboutData={mockAboutData} contributors={[]} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

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

    const { unmount } = renderWithLayout(<AboutClient aboutData={mockAboutData} contributors={[]} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    unmount()

    expect(cancelAnimationFrameSpy).toHaveBeenCalled()
    cancelAnimationFrameSpy.mockRestore()
  })

  it('should render with transition classes', () => {
    const { container } = renderWithLayout(<AboutClient aboutData={mockAboutData} contributors={[]} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('transition-opacity')
    expect(wrapper.className).toContain('duration-1000')
  })

  it('should have space-y classes for layout', () => {
    const { container } = renderWithLayout(<AboutClient aboutData={mockAboutData} contributors={[]} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    const wrapper = container.firstChild as HTMLElement
    const inner = wrapper.querySelector('.gap-16')
    expect(inner).toBeInTheDocument()
  })

  it('should pass LTR direction to AboutSections by default', () => {
    renderWithLayout(<AboutClient aboutData={mockAboutData} contributors={[]} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    expect(screen.getByTestId('about-sections').getAttribute('data-direction')).toBe(DirectionEnum.LTR)
  })

  it('should pass RTL direction to AboutSections when specified', () => {
    renderWithLayout(<AboutClient aboutData={mockAboutData} contributors={[]} />, {
      layoutContext: { direction: DirectionEnum.RTL },
    })

    expect(screen.getByTestId('about-sections').getAttribute('data-direction')).toBe(DirectionEnum.RTL)
  })
})
