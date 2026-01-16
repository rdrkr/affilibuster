// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Carousel component
 */

import { render, screen } from '@testing-library/react'

import { Carousel, type CarouselProps } from '@/components/elements/Carousel'
import { DirectionEnum } from '@/lib/generated/types.gen'

describe('Carousel', () => {
  const defaultProps: CarouselProps = {
    direction: DirectionEnum.LTR,
    children: <div data-testid="carousel-item">Item 1</div>,
  }

  it('should render children correctly', () => {
    render(<Carousel {...defaultProps} />)
    expect(screen.getByTestId('carousel-item')).toBeInTheDocument()
  })

  it('should apply sm gap class to inner wrapper', () => {
    render(<Carousel {...defaultProps} gap="sm" />)
    const inner = screen.getByTestId('carousel-track')
    expect(inner).toHaveClass('gap-4')
  })

  it('should apply md gap class by default to inner wrapper', () => {
    render(<Carousel {...defaultProps} />)
    const inner = screen.getByTestId('carousel-track')
    expect(inner).toHaveClass('gap-6')
  })

  it('should apply lg gap class to inner wrapper', () => {
    render(<Carousel {...defaultProps} gap="lg" />)
    const inner = screen.getByTestId('carousel-track')
    expect(inner).toHaveClass('gap-8')
  })

  it('should set dir="rtl" for RTL direction on outer container', () => {
    const { container } = render(<Carousel {...defaultProps} direction={DirectionEnum.RTL} />)
    const outer = container.firstChild as HTMLElement
    expect(outer).toHaveAttribute('dir', 'rtl')
  })

  it('should set dir="ltr" for LTR direction on outer container', () => {
    const { container } = render(<Carousel {...defaultProps} direction={DirectionEnum.LTR} />)
    const outer = container.firstChild as HTMLElement
    expect(outer).toHaveAttribute('dir', 'ltr')
  })

  it('should add role="region" to outer container when ariaLabel is provided', () => {
    const { container } = render(<Carousel {...defaultProps} ariaLabel="Product carousel" />)
    const outer = container.firstChild as HTMLElement
    expect(outer).toHaveAttribute('role', 'region')
    expect(outer).toHaveAttribute('aria-label', 'Product carousel')
  })

  it('should omit role when ariaLabel is not provided', () => {
    const { container } = render(<Carousel {...defaultProps} />)
    const outer = container.firstChild as HTMLElement
    expect(outer).not.toHaveAttribute('role')
    expect(outer).not.toHaveAttribute('aria-label')
  })

  it('should apply custom className to outer container', () => {
    const { container } = render(<Carousel {...defaultProps} className="mt-8 mb-4" />)
    const outer = container.firstChild as HTMLElement
    expect(outer).toHaveClass('mt-8')
    expect(outer).toHaveClass('mb-4')
  })

  it('should have scrollbar-hide and snap classes on outer container', () => {
    const { container } = render(<Carousel {...defaultProps} />)
    const outer = container.firstChild as HTMLElement
    expect(outer).toHaveClass('scrollbar-hide')
    expect(outer).toHaveClass('snap-x')
    expect(outer).toHaveClass('snap-mandatory')
    expect(outer).toHaveClass('overflow-x-auto')
  })

  it('should apply layout classes to inner wrapper', () => {
    render(<Carousel {...defaultProps} />)
    const inner = screen.getByTestId('carousel-track')
    expect(inner).toHaveClass('flex')
    expect(inner).toHaveClass('w-max')
    expect(inner).toHaveClass('min-w-full')
    expect(inner).toHaveClass('justify-center')
  })

  it('should render multiple children', () => {
    render(
      <Carousel {...defaultProps}>
        <div data-testid="item-1">Item 1</div>
        <div data-testid="item-2">Item 2</div>
        <div data-testid="item-3">Item 3</div>
      </Carousel>
    )

    expect(screen.getByTestId('item-1')).toBeInTheDocument()
    expect(screen.getByTestId('item-2')).toBeInTheDocument()
    expect(screen.getByTestId('item-3')).toBeInTheDocument()
  })
})
