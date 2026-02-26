// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the homepage loading skeleton component.
 */

import HomepageLoading from '@/app/[lang]/(homepage)/loading'
import { render } from '@testing-library/react'

describe('HomepageLoading', () => {
  it('should render loading skeleton with pulse animations', () => {
    const { container } = render(<HomepageLoading />)

    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('should render hero section skeleton', () => {
    const { container } = render(<HomepageLoading />)

    const heroSkeleton = container.querySelector('.h-72')
    expect(heroSkeleton).toBeInTheDocument()
  })

  it('should render feature section grid', () => {
    const { container } = render(<HomepageLoading />)

    const grids = container.querySelectorAll('.grid')
    expect(grids.length).toBeGreaterThanOrEqual(2)
  })
})
