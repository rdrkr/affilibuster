// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the products listing loading skeleton component.
 */

import ProductsLoading from '@/app/[lang]/products/loading'
import { render } from '@testing-library/react'

describe('ProductsLoading', () => {
  it('should render loading skeleton with pulse animations', () => {
    const { container } = render(<ProductsLoading />)

    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('should render page header skeleton', () => {
    const { container } = render(<ProductsLoading />)

    const headerSkeleton = container.querySelector('.h-10')
    expect(headerSkeleton).toBeInTheDocument()
  })

  it('should render filter tab skeletons', () => {
    const { container } = render(<ProductsLoading />)

    const filterTabs = container.querySelectorAll('.rounded-full')
    expect(filterTabs.length).toBeGreaterThanOrEqual(4)
  })

  it('should render product card grid', () => {
    const { container } = render(<ProductsLoading />)

    const productCards = container.querySelectorAll('.aspect-square')
    expect(productCards.length).toBe(6)
  })
})
