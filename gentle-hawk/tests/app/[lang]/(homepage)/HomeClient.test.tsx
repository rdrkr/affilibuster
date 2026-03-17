// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { render, screen } from '@testing-library/react'
import HomeClient from '@/app/[lang]/(homepage)/HomeClient'

jest.mock('@/components/layout', () => ({
  PageClient: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="page-client" className={className}>
      {children}
    </div>
  ),
}))

describe('HomeClient', () => {
  it('renders children inside PageClient', () => {
    render(
      <HomeClient>
        <div data-testid="child">Hello</div>
      </HomeClient>
    )
    expect(screen.getByTestId('page-client')).toContainElement(screen.getByTestId('child'))
  })

  it('content is visible without opacity gates', () => {
    render(
      <HomeClient>
        <span>Content</span>
      </HomeClient>
    )
    expect(screen.getByText('Content')).toBeVisible()
  })

  it('passes className prop to PageClient', () => {
    render(
      <HomeClient className="mt-16!">
        <div>Content</div>
      </HomeClient>
    )
    expect(screen.getByTestId('page-client')).toHaveClass('mt-16!')
  })
})
