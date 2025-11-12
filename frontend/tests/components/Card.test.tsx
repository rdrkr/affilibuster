// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card } from '@/components/Card'

describe('Card Component', () => {
  it('should render card with children', () => {
    render(<Card>Card Content</Card>)
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })

  it('should render as div by default', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild
    expect(card?.nodeName).toBe('DIV')
  })

  it('should render as button when onClick is provided', () => {
    const handleClick = jest.fn()
    render(<Card onClick={handleClick}>Click Me</Card>)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should apply default variant classes', () => {
    const { container } = render(<Card>Default</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border')
    expect(card.className).toContain('border-neutral-200')
    expect(card.className).toContain('shadow-md')
  })

  it('should apply product variant classes', () => {
    const { container } = render(<Card variant="product">Product</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('rounded-2xl')
    expect(card.className).toContain('overflow-hidden')
    expect(card.className).toContain('shadow-lg')
    expect(card.className).toContain('border-2')
  })

  it('should apply info variant classes', () => {
    const { container } = render(<Card variant="info">Info</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('p-8')
    expect(card.className).toContain('shadow-lg')
  })

  it('should apply feature variant classes', () => {
    const { container } = render(<Card variant="feature">Feature</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('bg-primary-700')
    expect(card.className).toContain('hover:bg-primary-600')
    expect(card.className).toContain('p-6')
    expect(card.className).toContain('text-white')
  })

  it('should apply base classes to all variants', () => {
    const { container } = render(<Card>Base</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('bg-white')
    expect(card.className).toContain('rounded-xl')
    expect(card.className).toContain('transition-all')
    expect(card.className).toContain('duration-300')
  })

  it('should apply hover classes by default', () => {
    const { container } = render(<Card>Hoverable</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('hover:shadow-lg')
    expect(card.className).toContain('cursor-pointer')
  })

  it('should apply product-specific hover classes', () => {
    const { container } = render(<Card variant="product">Product</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('hover:shadow-2xl')
    expect(card.className).toContain('hover:-translate-y-1')
    expect(card.className).toContain('cursor-pointer')
  })

  it('should apply feature-specific hover classes', () => {
    const { container } = render(<Card variant="feature">Feature</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('hover:scale-105')
    expect(card.className).toContain('cursor-pointer')
  })

  it('should apply info-specific hover classes', () => {
    const { container } = render(<Card variant="info">Info</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('hover:shadow-xl')
    expect(card.className).toContain('cursor-pointer')
  })

  it('should not apply hover classes when hoverable is false', () => {
    const { container } = render(<Card hoverable={false}>Not Hoverable</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).not.toContain('hover:shadow-lg')
    expect(card.className).not.toContain('cursor-pointer')
  })

  it('should handle onClick event', () => {
    const handleClick = jest.fn()
    render(<Card onClick={handleClick}>Click Me</Card>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should merge custom className with default classes', () => {
    const { container } = render(<Card className="custom-class">Custom</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('custom-class')
    expect(card.className).toContain('bg-white')
    expect(card.className).toContain('rounded-xl')
  })

  it('should render complex children', () => {
    render(
      <Card>
        <h3>Title</h3>
        <p>Description</p>
      </Card>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('should set button type when onClick is provided', () => {
    const handleClick = jest.fn()
    render(<Card onClick={handleClick}>Button Card</Card>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('should not have type attribute when rendered as div', () => {
    const { container } = render(<Card>Div Card</Card>)
    const card = container.firstChild as HTMLElement
    expect(card).not.toHaveAttribute('type')
  })
})
