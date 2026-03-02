// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for CookiePolicyClient component
 */

import { act, screen } from '@testing-library/react'

import CookiePolicyClient from '@/app/[lang]/cookie-policy/CookiePolicyClient'
import type { ApiCookiePolicyCookiePolicyDocument } from '@/lib/generated/types.gen'
import { AlignmentEnum, DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'
import { renderWithLayout } from '../../../utils/renderWithLayout'

describe('CookiePolicyClient', () => {
  const mockCookiePolicyData: ApiCookiePolicyCookiePolicyDocument = {
    documentId: 'cookie-policy-1',
    id: 1,
    publishedAt: '2025-01-01',
    content: {
      id: 1,
      content: '# Cookie Policy\n\nThis is the cookie policy.',
      header: {
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
        promoteHeaderIcon: false,
        header: { text: 'Cookie Policy', iconPosition: IconPositionEnum.BEFORE_TEXT, ariaDescription: 'Cookie Policy' },
      },
    },
    seoMetadata: {
      id: 1,
      metaTitle: 'Cookie Policy - TheGreenBrother',
      metaDescription: 'Our cookie policy',
    },
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return null when data is null', () => {
    const { container } = renderWithLayout(<CookiePolicyClient data={null} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    expect(container.firstChild).toBeNull()
  })

  it('should return null when content is missing', () => {
    const dataWithoutContent = { ...mockCookiePolicyData, content: undefined } as any
    const { container } = renderWithLayout(<CookiePolicyClient data={dataWithoutContent} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    expect(container.firstChild).toBeNull()
  })

  it('should render content when data is provided', () => {
    renderWithLayout(<CookiePolicyClient data={mockCookiePolicyData} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    // Advance timers for PageClient animation
    act(() => {
      jest.runAllTimers()
    })

    expect(screen.getByText('Cookie Policy', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.getByText('This is the cookie policy.')).toBeInTheDocument()
  })

  it('should use narrow layout', () => {
    const { container } = renderWithLayout(<CookiePolicyClient data={mockCookiePolicyData} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('max-w-4xl') // Narrow layout class
  })

  it('should display correct breadcrumb label', () => {
    renderWithLayout(<CookiePolicyClient data={mockCookiePolicyData} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    // Advance timers
    act(() => {
      jest.runAllTimers()
    })

    const breadcrumbNav = screen.getByRole('navigation')
    expect(breadcrumbNav).toHaveTextContent('Cookie Policy')
  })

  it('should use empty string for breadcrumb when header text is missing', () => {
    const dataWithoutHeader = {
      ...mockCookiePolicyData,
      content: {
        ...mockCookiePolicyData.content!,
        header: undefined,
      },
    } as any

    renderWithLayout(<CookiePolicyClient data={dataWithoutHeader} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    act(() => {
      jest.runAllTimers()
    })

    const breadcrumbNav = screen.getByRole('navigation')
    expect(breadcrumbNav).toBeInTheDocument()
  })
})
