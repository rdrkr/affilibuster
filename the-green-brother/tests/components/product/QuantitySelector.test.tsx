// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for QuantitySelector component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { QuantitySelector } from '@/components/product/QuantitySelector'
import { DirectionEnum } from '@/lib/generated/types.gen'

// Mock ButtonAction since we're testing QuantitySelector logic, not the button itself
jest.mock('@/components/elements', () => ({
  ButtonAction: function MockButtonAction({
    data,
    onClick,
    disabled,
  }: {
    data: { label: { icon: string } }
    onClick: () => void
    disabled: boolean
  }) {
    return (
      <button onClick={onClick} disabled={disabled} aria-label={data.label.icon}>
        {data.label.icon}
      </button>
    )
  },
}))

describe('QuantitySelector', () => {
  const defaultProps = {
    quantity: 1,
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
    direction: DirectionEnum.LTR,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly with initial quantity', () => {
    render(<QuantitySelector {...defaultProps} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByLabelText('add')).toBeInTheDocument()
    expect(screen.getByLabelText('remove')).toBeInTheDocument()
  })

  it('should call onIncrement when add button is clicked', () => {
    render(<QuantitySelector {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('add'))
    expect(defaultProps.onIncrement).toHaveBeenCalledTimes(1)
  })

  it('should call onDecrement when remove button is clicked', () => {
    render(<QuantitySelector {...defaultProps} quantity={2} />)
    fireEvent.click(screen.getByLabelText('remove'))
    expect(defaultProps.onDecrement).toHaveBeenCalledTimes(1)
  })

  it('should disable decrement button when quantity is at min (default 1)', () => {
    render(<QuantitySelector {...defaultProps} quantity={1} />)
    expect(screen.getByLabelText('remove')).toBeDisabled()
  })

  it('should disable decrement button when quantity is at custom min', () => {
    render(<QuantitySelector {...defaultProps} quantity={5} min={5} />)
    expect(screen.getByLabelText('remove')).toBeDisabled()
  })

  it('should disable increment button when quantity is at max', () => {
    render(<QuantitySelector {...defaultProps} quantity={10} max={10} />)
    expect(screen.getByLabelText('add')).toBeDisabled()
  })

  it('should respect custom class names', () => {
    const { container } = render(<QuantitySelector {...defaultProps} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should render in RTL direction', () => {
    // Note: Visual direction is handled by CSS, but we can verify the prop is passed
    // Since we mocked ButtonAction, we're assuming it handles direction correctly.
    // In this unit test we mainly check that it renders without error.
    render(<QuantitySelector {...defaultProps} direction={DirectionEnum.RTL} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should not disable increment button when max is not provided', () => {
    render(<QuantitySelector {...defaultProps} quantity={100} />)
    // Without max prop, increment should never be disabled
    expect(screen.getByLabelText('add')).not.toBeDisabled()
  })

  it('should not disable increment button when quantity is below max', () => {
    render(<QuantitySelector {...defaultProps} quantity={5} max={10} />)
    expect(screen.getByLabelText('add')).not.toBeDisabled()
  })

  it('should enable decrement button when quantity is above min', () => {
    render(<QuantitySelector {...defaultProps} quantity={3} min={1} />)
    expect(screen.getByLabelText('remove')).not.toBeDisabled()
  })
})
