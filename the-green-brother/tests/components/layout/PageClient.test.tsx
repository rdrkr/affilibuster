// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { PageClient } from '@/components/layout/PageClient'
import { useLayoutContext } from '@/components/providers'
import { render, screen } from '@testing-library/react'

// Mock useLayoutContext
jest.mock('@/components/providers', () => ({
  useLayoutContext: jest.fn(),
}))

// Mock Breadcrumbs
jest.mock('@/components/elements', () => ({
  Breadcrumbs: jest.fn(() => <div data-testid="breadcrumbs" />),
}))

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/test-path'),
}))

const mockUseLayoutContext = useLayoutContext as jest.Mock

describe('PageClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseLayoutContext.mockReturnValue({
      lang: 'en',
      direction: 'ltr',
      navigation: { menu: [] },
    })
  })

  it('should render children', () => {
    render(
      <PageClient>
        <div data-testid="child">Child Content</div>
      </PageClient>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should apply layout classes', () => {
    const { container } = render(
      <PageClient layout="wide">
        <div>Child</div>
      </PageClient>
    )

    // Check for wide layout class (max-w-7xl)
    expect(container.firstChild).toHaveClass('max-w-7xl')
  })

  it('should apply narrow layout classes', () => {
    const { container } = render(
      <PageClient layout="narrow">
        <div>Child</div>
      </PageClient>
    )

    // Check for narrow layout class (max-w-4xl)
    expect(container.firstChild).toHaveClass('max-w-4xl')
  })

  it('should render breadcrumbs when enabled', () => {
    render(
      <PageClient breadcrumbs>
        <div>Child</div>
      </PageClient>
    )

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
  })

  it('should not render breadcrumbs when disabled (default)', () => {
    render(
      <PageClient>
        <div>Child</div>
      </PageClient>
    )

    expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <PageClient className="custom-class">
        <div>Child</div>
      </PageClient>
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should apply childrenClassName to children wrapper', () => {
    render(
      <PageClient childrenClassName="child-wrapper-class">
        <div data-testid="child">Child</div>
      </PageClient>
    )

    const childWrapper = screen.getByTestId('child').parentElement
    expect(childWrapper).toHaveClass('child-wrapper-class')
    expect(childWrapper).toHaveClass('flex')
    expect(childWrapper).toHaveClass('flex-col')
    expect(childWrapper).toHaveClass('gap-16')
  })
})
