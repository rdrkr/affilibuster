// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for 410 Gone page
 */

import { render, screen } from '@testing-library/react'
import GonePage from '@/app/410/page'
import * as client from '@/lib/client'
import type { CodeEnum } from '@/lib/generated/types.gen'
import type { ApiError410Error410Document } from '@/lib/generated/types.gen'

// Mock the client module
jest.mock('@/lib/client', () => ({
  getError410: jest.fn(),
}))

describe('410 Gone Page', () => {
  const mockError410Data: ApiError410Error410Document = {
    documentId: 'test-410-id',
    id: 1,
    entryTitle: '410 Error',
    title: '410',
    subtitle: 'Page Gone',
    message: 'This page has been permanently removed and is no longer available.',
    ctaText: 'Go to Homepage',
    supportContactMessage: 'If you believe this is an error, please contact support.',
    metaTitle: '410 - Page Gone',
    metaDescription: 'This page has been permanently removed.',
    locale: 'en' as CodeEnum,
    publishedAt: '2024-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(client.getError410 as jest.Mock).mockResolvedValue(mockError410Data)
  })

  it('should render 410 heading', async () => {
    const component = await GonePage()
    render(component)

    expect(screen.getByText('410')).toBeInTheDocument()
  })

  it('should render "Page Gone" title', async () => {
    const component = await GonePage()
    render(component)

    expect(screen.getByText('Page Gone')).toBeInTheDocument()
  })

  it('should render explanation message', async () => {
    const component = await GonePage()
    render(component)

    expect(screen.getByText(/This page has been permanently removed and is no longer available/i)).toBeInTheDocument()
  })

  it('should render link to homepage', async () => {
    const component = await GonePage()
    render(component)

    // Button text should be present
    expect(screen.getByText('Go to Homepage')).toBeInTheDocument()
    // Link should have correct href
    const link = screen.getByRole('link', { name: /Go to Homepage/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('should render contact support message', async () => {
    const component = await GonePage()
    render(component)

    expect(screen.getByText(/If you believe this is an error, please contact support/i)).toBeInTheDocument()
  })

  it('should have proper styling classes', async () => {
    const component = await GonePage()
    const { container } = render(component)

    const mainDiv = container.firstChild
    expect(mainDiv).toHaveClass('min-h-screen')
    expect(mainDiv).toHaveClass('flex')
  })
})
