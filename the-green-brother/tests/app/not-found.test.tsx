// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the root not-found page component.
 */

import RootNotFound from '@/app/not-found'
import { render, screen } from '@testing-library/react'

describe('RootNotFound', () => {
  it('should render a link to the English homepage', () => {
    render(<RootNotFound />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/en')
  })

  it('should render the search icon', () => {
    const { container } = render(<RootNotFound />)

    // Unicode 128269 (🔍) search icon
    const iconDiv = container.querySelector('.text-6xl')
    expect(iconDiv).toBeInTheDocument()
  })

  it('should export noindex metadata', async () => {
    const { metadata } = await import('@/app/not-found')

    expect(metadata.robots).toEqual({ index: false, follow: false })
    expect(metadata.title).toBe('404')
  })
})
