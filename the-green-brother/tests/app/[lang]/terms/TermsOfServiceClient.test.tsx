// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for TermsOfServiceClient component
 */

import { act, screen } from '@testing-library/react'

import TermsOfServiceClient from '@/app/[lang]/terms/TermsOfServiceClient'
import type { ApiTermTermDocument } from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'
import { renderWithLayout } from '../../../utils/renderWithLayout'

describe('TermsOfServiceClient', () => {
  const mockTermData: ApiTermTermDocument = {
    documentId: 'term-1',
    id: 1,
    publishedAt: '2025-01-01',
    content: {
      id: 1,
      content: '# Terms of Service\n\nThese are the terms.',
    },
    seoMetadata: {
      id: 1,
      metaTitle: 'Terms of Service - TheGreenBrother',
      metaDescription: 'Our terms of service',
    },
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return null when data is null', () => {
    const { container } = renderWithLayout(<TermsOfServiceClient data={null} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    expect(container.firstChild).toBeNull()
  })

  it('should return null when content is missing', () => {
    const dataWithoutContent = { ...mockTermData, content: undefined } as any
    const { container } = renderWithLayout(<TermsOfServiceClient data={dataWithoutContent} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    expect(container.firstChild).toBeNull()
  })

  it('should render content when data is provided', () => {
    renderWithLayout(<TermsOfServiceClient data={mockTermData} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    // Advance timers for PageClient animation
    act(() => {
      jest.runAllTimers()
    })

    expect(screen.getByText('Terms of Service', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.getByText('These are the terms.')).toBeInTheDocument()
  })

  it('should use narrow layout', () => {
    const { container } = renderWithLayout(<TermsOfServiceClient data={mockTermData} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('max-w-4xl') // Narrow layout class
  })

  it('should display correct breadcrumb label', () => {
    renderWithLayout(<TermsOfServiceClient data={mockTermData} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    // Advance timers
    act(() => {
      jest.runAllTimers()
    })

    expect(screen.getByText('Terms of Service', { selector: 'span' })).toBeInTheDocument()
  })

  it('should use dynamic breadcrumb label if available', () => {
    const dataWithHeader = {
      ...mockTermData,
      content: {
        ...mockTermData.content,
        header: {
          header: {
            text: 'Custom Terms Label',
          },
        },
      },
    } as any

    renderWithLayout(<TermsOfServiceClient data={dataWithHeader} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    // Advance timers
    act(() => {
      jest.runAllTimers()
    })

    const breadcrumbLabel = screen.getAllByText('Custom Terms Label', { selector: 'span' })[0]
    expect(breadcrumbLabel).toBeInTheDocument()
  })
})
