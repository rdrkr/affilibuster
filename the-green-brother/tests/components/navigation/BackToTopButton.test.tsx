// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for BackToTopButton component
 */

import { act, fireEvent, render, screen } from '@testing-library/react'

import BackToTopButton from '@/components/navigation/BackToTopButton'
import { DirectionEnum } from '@/lib/generated/types.gen'

// Mock CMSIcon
jest.mock('@/components/elements', () => ({
  CMSIcon: function MockCMSIcon({ icon, size }: { icon?: string; size?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size}>
        {icon}
      </span>
    )
  },
}))

describe('BackToTopButton', () => {
  // Mock window.scrollTo
  const mockScrollTo = jest.fn()
  const originalScrollTo = window.scrollTo

  beforeEach(() => {
    window.scrollTo = mockScrollTo
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    mockScrollTo.mockClear()
  })

  afterEach(() => {
    window.scrollTo = originalScrollTo
  })

  it('should render the button', () => {
    render(<BackToTopButton />)
    const button = screen.getByRole('button', { name: 'Scroll to top' })
    expect(button).toBeInTheDocument()
  })

  it('should render arrow_upward icon', () => {
    render(<BackToTopButton />)
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toHaveAttribute('data-icon', 'arrow_upward')
  })

  it('should render icon with lg size', () => {
    render(<BackToTopButton />)
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toHaveAttribute('data-size', 'lg')
  })

  it('should not be visible initially (scrollY = 0)', () => {
    render(<BackToTopButton />)
    const button = screen.getByRole('button', { name: 'Scroll to top' })
    expect(button.className).toContain('opacity-0')
  })

  it('should become visible when scrollY > 300', () => {
    render(<BackToTopButton />)

    // Simulate scroll past threshold
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 350, writable: true })
      window.dispatchEvent(new Event('scroll'))
    })

    const button = screen.getByRole('button', { name: 'Scroll to top' })
    expect(button.className).toContain('opacity-100')
  })

  it('should hide when scrollY <= 300', () => {
    render(<BackToTopButton />)

    // First scroll down
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 350, writable: true })
      window.dispatchEvent(new Event('scroll'))
    })

    // Then scroll back up
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 200, writable: true })
      window.dispatchEvent(new Event('scroll'))
    })

    const button = screen.getByRole('button', { name: 'Scroll to top' })
    expect(button.className).toContain('opacity-0')
  })

  it('should scroll to top when clicked', () => {
    render(<BackToTopButton />)
    const button = screen.getByRole('button', { name: 'Scroll to top' })

    fireEvent.click(button)

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    })
  })

  it('should apply correct styling classes', () => {
    render(<BackToTopButton />)
    const button = screen.getByRole('button', { name: 'Scroll to top' })
    expect(button.className).toContain('fixed')
    expect(button.className).toContain('bg-primary')
    expect(button.className).toContain('rounded-full')
  })

  it('should have pointer-events-none when not visible', () => {
    render(<BackToTopButton />)
    const button = screen.getByRole('button', { name: 'Scroll to top' })
    // But it's hidden: opacity-0 translate-y-10 scale-90 pointer-events-none
    expect(button).toHaveClass('opacity-0')
    expect(button).toHaveClass('pointer-events-none')

    // Default (LTR) position
    expect(button).toHaveClass('right-6')
  })

  it('should position on left for RTL direction', () => {
    render(<BackToTopButton direction={DirectionEnum.RTL} />)
    const button = screen.getByRole('button', { name: /scroll to top/i })
    expect(button).toHaveClass('left-6')
    expect(button).not.toHaveClass('right-6')
  })

  it('should position on right for LTR direction', () => {
    render(<BackToTopButton direction={DirectionEnum.LTR} />)
    const button = screen.getByRole('button', { name: /scroll to top/i })
    expect(button).toHaveClass('right-6')
    expect(button).not.toHaveClass('left-6')
  })

  it('should not have pointer-events-none when visible', () => {
    render(<BackToTopButton />)

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 350, writable: true })
      window.dispatchEvent(new Event('scroll'))
    })

    const button = screen.getByRole('button', { name: 'Scroll to top' })
    expect(button.className).not.toContain('pointer-events-none')
  })

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    const { unmount } = render(<BackToTopButton />)

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })
})
