// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * QuantitySelector Component
 *
 * Reusable quantity selector with increment/decrement buttons.
 * Styled with ghost-3 variant colors for consistent UI.
 */

'use client'

import { ButtonAction } from '@/components/elements'
import { DirectionEnum, IconPositionEnum, type ElementsButtonEntry } from '@/lib/generated/types.gen'

/**
 * Props for the QuantitySelector component
 */
export interface QuantitySelectorProps {
  /** Current quantity value */
  quantity: number
  /** Handler for incrementing quantity */
  onIncrement: () => void
  /** Handler for decrementing quantity */
  onDecrement: () => void
  /** Text direction for RTL/LTR layout */
  direction: DirectionEnum
  /** Minimum allowed quantity (default: 1) */
  min?: number
  /** Maximum allowed quantity (optional) */
  max?: number
  /** Additional CSS classes for the container */
  className?: string
}

/**
 * Renders a quantity selector with increment/decrement buttons.
 * Uses ghost-3 variant styling for a subtle, integrated appearance.
 * @param props - Component properties
 * @param props.quantity - Current quantity value
 * @param props.onIncrement - Handler for incrementing quantity
 * @param props.onDecrement - Handler for decrementing quantity
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.min - Minimum allowed quantity (default: 1)
 * @param props.max - Maximum allowed quantity (optional)
 * @param props.className - Additional CSS classes for the container
 * @returns Quantity selector component
 */
export function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  direction,
  min = 1,
  max,
  className = '',
}: QuantitySelectorProps) {
  const isDecrementDisabled = quantity <= min
  const isIncrementDisabled = max !== undefined && quantity >= max

  // Create button data for decrement
  const decrementButtonData: ElementsButtonEntry = {
    label: {
      icon: 'remove',
      text: '',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Decrease quantity',
    },
    url: '',
    openInNewTab: false,
  }

  // Create button data for increment
  const incrementButtonData: ElementsButtonEntry = {
    label: {
      icon: 'add',
      text: '',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Increase quantity',
    },
    url: '',
    openInNewTab: false,
  }

  return (
    <div
      className={`
        flex items-center justify-between gap-2 rounded-xl
        bg-muted px-3 py-2
        dark:bg-white/5
        ${className}
      `}
    >
      <ButtonAction
        data={decrementButtonData}
        direction={direction}
        variant="ghost-3"
        size="sm"
        onClick={onDecrement}
        disabled={isDecrementDisabled}
        iconSize="sm"
      />
      <span className="font-bold text-foreground">{quantity}</span>
      <ButtonAction
        data={incrementButtonData}
        direction={direction}
        variant="ghost-3"
        size="sm"
        onClick={onIncrement}
        disabled={isIncrementDisabled}
        iconSize="sm"
      />
    </div>
  )
}

export default QuantitySelector
