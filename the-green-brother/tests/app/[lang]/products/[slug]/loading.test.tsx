// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the product detail loading skeleton component.
 */

import ProductDetailLoading from '@/app/[lang]/products/[slug]/loading'
import { render } from '@testing-library/react'

describe('ProductDetailLoading', () => {
  it('should render loading skeleton with pulse animations', () => {
    const { container } = render(<ProductDetailLoading />)

    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('should render two-column layout grid', () => {
    const { container } = render(<ProductDetailLoading />)

    const twoColumnGrid = container.querySelector('.lg\\:grid-cols-2')
    expect(twoColumnGrid).toBeInTheDocument()
  })

  it('should render image gallery with thumbnail row', () => {
    const { container } = render(<ProductDetailLoading />)

    const mainImage = container.querySelector('.aspect-square')
    expect(mainImage).toBeInTheDocument()

    const thumbnails = container.querySelectorAll('.size-16')
    expect(thumbnails.length).toBe(4)
  })

  it('should render related products section', () => {
    const { container } = render(<ProductDetailLoading />)

    const relatedProducts = container.querySelectorAll('.w-56')
    expect(relatedProducts.length).toBe(4)
  })
})
