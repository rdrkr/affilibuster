// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for root layout
 */

import { render } from '@testing-library/react'
import RootLayout from '@/app/layout'

describe('RootLayout', () => {
  it('should render children', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    )

    const child = container.querySelector('[data-testid="test-child"]')
    expect(child).toBeInTheDocument()
    expect(child).toHaveTextContent('Test Content')
  })

  it('should pass through multiple children', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </RootLayout>
    )

    expect(container.querySelector('[data-testid="child1"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="child2"]')).toBeInTheDocument()
  })

  it('should render without errors', () => {
    const { container } = render(
      <RootLayout>
        <p>Simple content</p>
      </RootLayout>
    )

    expect(container.querySelector('p')).toHaveTextContent('Simple content')
  })
})
