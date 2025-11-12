// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/Button'

describe('Button Component', () => {
  it('should render button with children', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument()
  })

  it('should apply primary variant by default', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-primary-600')
    expect(button.className).toContain('hover:bg-primary-700')
  })

  it('should apply secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-secondary-500')
    expect(button.className).toContain('hover:bg-secondary-600')
  })

  it('should apply ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-white')
    expect(button.className).toContain('border')
  })

  it('should apply danger variant', () => {
    render(<Button variant="danger">Danger</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-error-500')
    expect(button.className).toContain('hover:bg-error-600')
  })

  it('should apply medium size by default', () => {
    render(<Button>Medium</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-6')
    expect(button.className).toContain('py-2')
  })

  it('should apply small size', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-3')
    expect(button.className).toContain('py-1.5')
    expect(button.className).toContain('text-sm')
  })

  it('should apply large size', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-6')
    expect(button.className).toContain('py-3')
    expect(button.className).toContain('text-lg')
  })

  it('should apply full width when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('w-full')
  })

  it('should not apply full width by default', () => {
    render(<Button>Not Full Width</Button>)
    const button = screen.getByRole('button')
    expect(button.className).not.toContain('w-full')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button.className).toContain('disabled:opacity-50')
    expect(button.className).toContain('disabled:cursor-not-allowed')
  })

  it('should handle onClick event', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not trigger onClick when disabled', () => {
    const handleClick = jest.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should merge custom className with default classes', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
    expect(button.className).toContain('font-semibold')
    expect(button.className).toContain('rounded-lg')
  })

  it('should apply base classes to all variants', () => {
    render(<Button>Base Classes</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('font-semibold')
    expect(button.className).toContain('rounded-lg')
    expect(button.className).toContain('transition-colors')
    expect(button.className).toContain('focus:outline-none')
    expect(button.className).toContain('focus:ring-2')
  })

  it('should pass through additional HTML button attributes', () => {
    render(
      <Button type="submit" data-testid="submit-button">
        Submit
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('data-testid', 'submit-button')
  })

  it('should render complex children', () => {
    render(
      <Button>
        <span>Icon</span> Click Me
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Icon Click Me')
    expect(button.querySelector('span')).toBeInTheDocument()
  })
})
