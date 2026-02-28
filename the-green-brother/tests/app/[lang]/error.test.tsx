// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the error boundary client component.
 */

// Mock Icon component
jest.mock('@/components/elements', () => ({
  Icon: function MockIcon({ icon, size, className }: { icon: string; size?: string; className?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
        {icon}
      </span>
    )
  },
}))

import ErrorPage from '@/app/[lang]/error'
import { render, screen, fireEvent } from '@testing-library/react'

describe('ErrorPage', () => {
  const mockReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render error UI with retry button', () => {
    const error = new Error('Something went wrong')

    render(<ErrorPage error={error} reset={mockReset} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should render warning icon using Icon component', () => {
    const error = new Error('Something went wrong')

    render(<ErrorPage error={error} reset={mockReset} />)

    const icon = screen.getByTestId('mock-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('data-icon', 'warning')
    expect(icon).toHaveAttribute('data-size', '6xl')
  })

  it('should call reset when retry button is clicked', () => {
    const error = new Error('Something went wrong')

    render(<ErrorPage error={error} reset={mockReset} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('should display error digest when available', () => {
    const error = Object.assign(new Error('Test error'), { digest: 'ERR_DIGEST_123' })

    render(<ErrorPage error={error} reset={mockReset} />)

    expect(screen.getByText('ERR_DIGEST_123')).toBeInTheDocument()
  })

  it('should render without digest when not available', () => {
    const error = new Error('No digest error')

    const { container } = render(<ErrorPage error={error} reset={mockReset} />)

    // The p element should exist but have no text content
    const digestParagraph = container.querySelector('.text-neutral-500')
    expect(digestParagraph).toBeInTheDocument()
    expect(digestParagraph?.textContent).toBe('')
  })
})
