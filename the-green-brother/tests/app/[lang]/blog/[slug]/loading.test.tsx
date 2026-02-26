// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the blog post detail loading skeleton component.
 */

import BlogPostLoading from '@/app/[lang]/blog/[slug]/loading'
import { render } from '@testing-library/react'

describe('BlogPostLoading', () => {
  it('should render loading skeleton with pulse animations', () => {
    const { container } = render(<BlogPostLoading />)

    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('should render hero image skeleton', () => {
    const { container } = render(<BlogPostLoading />)

    const heroSkeleton = container.querySelector('.h-64')
    expect(heroSkeleton).toBeInTheDocument()
  })

  it('should render breadcrumb skeleton', () => {
    const { container } = render(<BlogPostLoading />)

    // Breadcrumb has multiple small width elements in a flex row
    const breadcrumbRow = container.querySelector('.flex.gap-2')
    expect(breadcrumbRow).toBeInTheDocument()
  })

  it('should render author avatar skeleton', () => {
    const { container } = render(<BlogPostLoading />)

    const avatar = container.querySelector('.size-10.rounded-full')
    expect(avatar).toBeInTheDocument()
  })

  it('should render article content skeleton within max-w-3xl container', () => {
    const { container } = render(<BlogPostLoading />)

    const articleContainer = container.querySelector('.max-w-3xl')
    expect(articleContainer).toBeInTheDocument()
  })
})
