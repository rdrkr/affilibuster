// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for HomeClient component
 */

import { screen } from '@testing-library/react'

import HomeClient from '@/app/[lang]/(homepage)/HomeClient'
import { renderWithLayout } from '../../../utils/renderWithLayout'

describe('HomeClient', () => {
  it('should render children', () => {
    renderWithLayout(
      <HomeClient>
        <div data-testid="child">Child Content</div>
      </HomeClient>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('should render content visible immediately without JS-gated opacity', () => {
    const { container } = renderWithLayout(
      <HomeClient>
        <div>Content</div>
      </HomeClient>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).not.toContain('opacity-0')
    expect(wrapper.className).not.toContain('transition-opacity')
  })

  it('should pass className to PageClient', () => {
    const { container } = renderWithLayout(
      <HomeClient className="mt-16!">
        <div>Content</div>
      </HomeClient>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('mt-16!')
  })
})
