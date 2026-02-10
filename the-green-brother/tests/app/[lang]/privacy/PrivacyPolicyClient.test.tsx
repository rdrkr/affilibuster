// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for PrivacyPolicyClient component
 */

import { act, screen } from '@testing-library/react'

import PrivacyPolicyClient from '@/app/[lang]/privacy/PrivacyPolicyClient'
import type { ApiPrivacyPrivacyDocument } from '@/lib/generated/types.gen'
import { AlignmentEnum, DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'
import { renderWithLayout } from '../../../utils/renderWithLayout'

describe('PrivacyPolicyClient', () => {
  const mockPrivacyData: ApiPrivacyPrivacyDocument = {
    documentId: 'privacy-1',
    id: 1,
    publishedAt: '2025-01-01',
    content: {
      id: 1,
      content: '# Privacy Policy\n\nThis is the privacy policy.',
      header: {
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
        promoteHeaderIcon: false,
        header: {
          text: 'Privacy Policy',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Privacy Policy',
        },
      },
    },
    seoMetadata: {
      id: 1,
      metaTitle: 'Privacy Policy - TheGreenBrother',
      metaDescription: 'Our privacy policy',
    },
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return null when data is null', () => {
    const { container } = renderWithLayout(<PrivacyPolicyClient data={null} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    expect(container.firstChild).toBeNull()
  })

  it('should return null when content is missing', () => {
    const dataWithoutContent = { ...mockPrivacyData, content: undefined } as any
    const { container } = renderWithLayout(<PrivacyPolicyClient data={dataWithoutContent} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    expect(container.firstChild).toBeNull()
  })

  it('should render content when data is provided', () => {
    renderWithLayout(<PrivacyPolicyClient data={mockPrivacyData} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    // Advance timers for PageClient animation
    act(() => {
      jest.runAllTimers()
    })

    expect(screen.getByText('Privacy Policy', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.getByText('This is the privacy policy.')).toBeInTheDocument()
  })

  it('should use narrow layout', () => {
    const { container } = renderWithLayout(<PrivacyPolicyClient data={mockPrivacyData} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('max-w-4xl') // Narrow layout class
  })

  it('should display correct breadcrumb label', () => {
    renderWithLayout(<PrivacyPolicyClient data={mockPrivacyData} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    // Advance timers
    act(() => {
      jest.runAllTimers()
    })

    const breadcrumbNav = screen.getByRole('navigation')
    expect(breadcrumbNav).toHaveTextContent('Privacy Policy')
  })
})
