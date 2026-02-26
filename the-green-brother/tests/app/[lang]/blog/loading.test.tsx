// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the blog listing loading skeleton component.
 */

import BlogLoading from '@/app/[lang]/blog/loading'
import { render } from '@testing-library/react'

describe('BlogLoading', () => {
  it('should render loading skeleton with pulse animations', () => {
    const { container } = render(<BlogLoading />)

    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('should render page header skeleton', () => {
    const { container } = render(<BlogLoading />)

    const headerSkeleton = container.querySelector('.h-10')
    expect(headerSkeleton).toBeInTheDocument()
  })

  it('should render featured posts carousel skeleton', () => {
    const { container } = render(<BlogLoading />)

    const heroCarousel = container.querySelector('.h-64')
    expect(heroCarousel).toBeInTheDocument()
  })

  it('should render tag section skeletons', () => {
    const { container } = render(<BlogLoading />)

    const grids = container.querySelectorAll('.grid')
    expect(grids.length).toBeGreaterThanOrEqual(2)
  })
})
