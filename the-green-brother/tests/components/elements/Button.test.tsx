// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Button component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { Button, type ButtonProps } from '@/components/elements/Button'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the Label component
jest.mock('@/components/elements', () => ({
  Label: function MockLabel({
    data,
    direction,
    iconSize,
  }: {
    data?: { text?: string; ariaDescription?: string }
    direction?: string
    iconSize?: string
  }) {
    return (
      <span data-testid="mock-label" data-direction={direction} data-icon-size={iconSize}>
        {data?.text}
      </span>
    )
  },
}))

describe('Button', () => {
  const mockButtonData: ButtonProps['data'] = {
    url: '/test-url',
    openInNewTab: false,
    label: {
      text: 'Click Me',
      icon: 'arrow_forward',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'Test button description',
    },
  }

  it('should render null when data is undefined', () => {
    const { container } = render(<Button direction={DirectionEnum.LTR} data={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render as a link by default', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} />)
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test-url')
  })

  it('should render label content', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} />)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('should open in new tab when openInNewTab is true', () => {
    const dataWithNewTab = { ...mockButtonData, openInNewTab: true }
    render(<Button direction={DirectionEnum.LTR} data={dataWithNewTab} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should not have target/rel when openInNewTab is false', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} />)
    const link = screen.getByRole('link')
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
  })

  it('should render as button element when asButton is true', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} asButton />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should call onClick when asButton and clicked', () => {
    const handleClick = jest.fn()
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} asButton onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} asButton disabled />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should apply aria-label from nested label', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'Test button description')
  })

  it('should pass direction to Label component', () => {
    render(<Button data={mockButtonData} direction={DirectionEnum.RTL} />)
    const label = screen.getByTestId('mock-label')
    expect(label).toHaveAttribute('data-direction', DirectionEnum.RTL)
  })

  it('should pass iconSize to Label component', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} iconSize="lg" />)
    const label = screen.getByTestId('mock-label')
    expect(label).toHaveAttribute('data-icon-size', 'lg')
  })

  it('should apply primary variant classes by default', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('bg-primary')
  })

  it('should apply secondary variant classes', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} variant="secondary" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('bg-secondary')
  })

  it('should apply outline variant classes', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} variant="outline" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('border-primary')
  })

  it('should apply ghost variant classes', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} variant="ghost" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('text-primary')
    expect(link.className).toContain('hover:bg-primary/10')
  })

  it('should apply link variant classes', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} variant="link" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('hover:scale-105')
  })

  it('should apply sm size classes', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} size="sm" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('px-3')
    expect(link.className).toContain('py-1.5')
  })

  it('should apply md size classes by default', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('px-4')
    expect(link.className).toContain('py-2')
  })

  it('should apply lg size classes', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} size="lg" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('px-6')
    expect(link.className).toContain('py-3')
  })

  it('should apply custom className', () => {
    // eslint-disable-next-line better-tailwindcss/no-unregistered-classes
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} className="custom-class" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('custom-class')
  })

  it('should not render content when label is undefined', () => {
    const dataWithoutLabel = { ...mockButtonData, label: undefined } as unknown as ButtonProps['data']
    render(<Button direction={DirectionEnum.LTR} data={dataWithoutLabel} />)
    const link = screen.getByRole('link')
    expect(link.children.length).toBe(0)
  })

  it('should render button with type="button"', () => {
    render(<Button direction={DirectionEnum.LTR} data={mockButtonData} asButton />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })
})
