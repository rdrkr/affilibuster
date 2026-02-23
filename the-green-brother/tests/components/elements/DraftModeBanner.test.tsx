// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * @module DraftModeBanner.test
 * @description Unit tests for the DraftModeBanner component.
 * Verifies that the banner renders draft mode messaging with correct
 * text, link, and styling classes.
 */

import { render, screen } from '@testing-library/react'
import DraftModeBanner from '@/components/elements/DraftModeBanner'

jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({
    children,
    href,
    className,
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }): React.ReactElement {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  },
}))

describe('DraftModeBanner', () => {
  it('renders "Draft mode is enabled." text', () => {
    render(<DraftModeBanner />)

    expect(screen.getByText(/Draft mode is enabled\./)).toBeInTheDocument()
  })

  it('renders "Exit preview" link with href to /api/preview/disable', () => {
    render(<DraftModeBanner />)

    const link = screen.getByRole('link', { name: 'Exit preview' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/api/preview/disable')
  })

  it('has correct CSS classes for styling on the container', () => {
    const { container } = render(<DraftModeBanner />)

    const banner = container.firstChild as HTMLElement
    expect(banner).toHaveClass('bg-warning-600')
    expect(banner).toHaveClass('text-neutral-900')
    expect(banner).toHaveClass('px-4')
    expect(banner).toHaveClass('py-2')
    expect(banner).toHaveClass('text-center')
    expect(banner).toHaveClass('text-sm')
    expect(banner).toHaveClass('font-medium')
  })

  it('has underline and font-bold classes on the link', () => {
    render(<DraftModeBanner />)

    const link = screen.getByRole('link', { name: 'Exit preview' })
    expect(link).toHaveClass('underline')
    expect(link).toHaveClass('font-bold')
  })
})
