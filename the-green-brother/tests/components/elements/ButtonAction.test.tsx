// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ButtonAction client component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { ButtonAction, type ButtonActionProps } from '@/components/elements/ButtonAction'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the Label component (ButtonAction uses relative import)
jest.mock('@/components/elements/Label', () => ({
  __esModule: true,
  default: function MockLabel({
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

describe('ButtonAction', () => {
  const mockOnClick = jest.fn()
  const mockButtonData: ButtonActionProps['data'] = {
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
    const { container } = render(<ButtonAction direction={DirectionEnum.LTR} data={undefined} onClick={mockOnClick} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render hidden element when visible is false', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={mockOnClick} visible={false} />)
    const button = screen.getByRole('button', { hidden: true })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-hidden', 'true')
    expect(button.className).toContain('opacity-0')
    expect(button.className).toContain('w-0')
  })

  it('should render as a button element', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should render label content', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={mockOnClick} />)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} disabled onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should not be disabled by default', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  it('should apply aria-label from nested label', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Test button description')
  })

  it('should pass direction to Label component', () => {
    render(<ButtonAction data={mockButtonData} direction={DirectionEnum.RTL} onClick={mockOnClick} />)
    const label = screen.getByTestId('mock-label')
    expect(label).toHaveAttribute('data-direction', DirectionEnum.RTL)
  })

  it('should pass iconSize to Label component', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} iconSize="lg" onClick={mockOnClick} />)
    const label = screen.getByTestId('mock-label')
    expect(label).toHaveAttribute('data-icon-size', 'lg')
  })

  it('should apply primary variant classes by default', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-primary')
  })

  it('should apply secondary variant classes', () => {
    render(
      <ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} variant="secondary" onClick={mockOnClick} />
    )
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-white/5')
  })

  it('should apply outline variant classes', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} variant="outline" onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('border-primary')
  })

  it('should apply ghost variant classes', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} variant="ghost-1" onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('text-primary')
    expect(button.className).toContain('hover:bg-transparent')
  })

  it('should apply link variant classes', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} variant="link-1" onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('hover:scale-105')
  })

  it('should apply sm size classes', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} size="sm" onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-3')
    expect(button.className).toContain('py-1.5')
  })

  it('should apply md size classes by default', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-4')
    expect(button.className).toContain('py-2')
  })

  it('should apply lg size classes', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} size="lg" onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-5')
    expect(button.className).toContain('py-3')
  })

  it('should apply custom className', () => {
    render(
      <ButtonAction
        direction={DirectionEnum.LTR}
        data={mockButtonData}
        className="custom-class"
        onClick={mockOnClick}
      />
    )
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
  })

  it('should render children when provided', () => {
    render(
      <ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={mockOnClick}>
        <span>Custom Content</span>
      </ButtonAction>
    )
    expect(screen.getByText('Custom Content')).toBeInTheDocument()
    // Label content should NOT be rendered when children are provided (based on current implementation logic: let content = children; if (!content && label) ...)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('should render null when label is undefined and no children', () => {
    const dataWithoutLabel = { ...mockButtonData, label: undefined } as unknown as ButtonActionProps['data']
    const { container } = render(
      <ButtonAction direction={DirectionEnum.LTR} data={dataWithoutLabel} onClick={mockOnClick} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render label before children in LTR', () => {
    const { container } = render(
      <ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={mockOnClick}>
        <span data-testid="custom">Custom</span>
      </ButtonAction>
    )
    const button = container.querySelector('button')
    const children = Array.from(button?.children ?? [])
    // First child should be the label (mock-label), second should be the custom span
    expect(children[0]).toHaveAttribute('data-testid', 'mock-label')
    expect(children[1]).toHaveAttribute('data-testid', 'custom')
  })

  it('should render children before label in RTL', () => {
    const { container } = render(
      <ButtonAction direction={DirectionEnum.RTL} data={mockButtonData} onClick={mockOnClick}>
        <span data-testid="custom">Custom</span>
      </ButtonAction>
    )
    const button = container.querySelector('button')
    const children = Array.from(button?.children ?? [])
    // First child should be the custom span, second should be the label (mock-label)
    expect(children[0]).toHaveAttribute('data-testid', 'custom')
    expect(children[1]).toHaveAttribute('data-testid', 'mock-label')
  })

  it('should render children before label in LTR when childrenPosition="start"', () => {
    const { container } = render(
      <ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={mockOnClick} childrenPosition="start">
        <span data-testid="custom">Custom</span>
      </ButtonAction>
    )
    const button = container.querySelector('button')
    const children = Array.from(button?.children ?? [])
    // First child should be the custom span, second should be the label (mock-label)
    expect(children[0]).toHaveAttribute('data-testid', 'custom')
    expect(children[1]).toHaveAttribute('data-testid', 'mock-label')
  })

  it('should render label before children in RTL when childrenPosition="start"', () => {
    const { container } = render(
      <ButtonAction direction={DirectionEnum.RTL} data={mockButtonData} onClick={mockOnClick} childrenPosition="start">
        <span data-testid="custom">Custom</span>
      </ButtonAction>
    )
    const button = container.querySelector('button')
    const children = Array.from(button?.children ?? [])
    // First child should be the label (mock-label), second should be the custom span
    expect(children[0]).toHaveAttribute('data-testid', 'mock-label')
    expect(children[1]).toHaveAttribute('data-testid', 'custom')
  })

  it('should have type="button"', () => {
    render(<ButtonAction direction={DirectionEnum.LTR} data={mockButtonData} onClick={mockOnClick} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })
})
