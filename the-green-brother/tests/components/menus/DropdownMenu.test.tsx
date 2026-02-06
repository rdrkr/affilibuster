// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { act, fireEvent, render, screen } from '@testing-library/react'

import { Dropdown, DropdownMenu } from '@/components/menus/DropdownMenu'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

/**
 * Tests for Dropdown (presentational panel component)
 */
describe('Dropdown', () => {
  it('should render children', () => {
    render(
      <Dropdown isVisible={true}>
        <div>Test Content</div>
      </Dropdown>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should be visible when isVisible is true', () => {
    render(
      <Dropdown isVisible={true}>
        <div>Test Content</div>
      </Dropdown>
    )
    const container = screen.getByText('Test Content').closest('.fixed')
    expect(container).toHaveClass('visible')
    expect(container).not.toHaveClass('invisible')
  })

  it('should not render children when isVisible is false', () => {
    render(
      <Dropdown isVisible={false}>
        <div>Test Content</div>
      </Dropdown>
    )
    // Children should not be rendered when dropdown is closed (LCP optimization)
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
  })

  it('should apply RTL positioning classes', () => {
    render(
      <Dropdown isVisible={true} direction={DirectionEnum.RTL} align="start">
        <div>Test Content</div>
      </Dropdown>
    )
    const container = screen.getByText('Test Content').closest('.fixed')
    expect(container).toHaveClass('sm:left-auto')
  })

  it('should apply LTR start positioning (right-auto)', () => {
    render(
      <Dropdown isVisible={true} direction={DirectionEnum.LTR} align="start">
        <div>Test Content</div>
      </Dropdown>
    )
    const container = screen.getByText('Test Content').closest('.fixed')
    expect(container).toHaveClass('sm:right-auto')
  })

  it('should apply LTR end positioning (left-auto)', () => {
    render(
      <Dropdown isVisible={true} direction={DirectionEnum.LTR} align="end">
        <div>Test Content</div>
      </Dropdown>
    )
    const container = screen.getByText('Test Content').closest('.fixed')
    expect(container).toHaveClass('sm:left-auto')
  })

  it('should apply RTL end positioning (right-auto)', () => {
    render(
      <Dropdown isVisible={true} direction={DirectionEnum.RTL} align="end">
        <div>Test Content</div>
      </Dropdown>
    )
    const container = screen.getByText('Test Content').closest('.fixed')
    expect(container).toHaveClass('sm:right-auto')
  })

  it('should use inline positioning when inlineOnMobile is true', () => {
    render(
      <Dropdown isVisible={true} inlineOnMobile={true}>
        <div>Test Content</div>
      </Dropdown>
    )
    const container = screen.getByText('Test Content').closest('.absolute')
    expect(container).toHaveClass('absolute')
    expect(container).toHaveClass('top-full')
  })

  it('should apply custom width style', () => {
    render(
      <Dropdown isVisible={true} width="300px">
        <div>Test Content</div>
      </Dropdown>
    )
    // Style is on the inner panel div with the rounded-xl class
    const panel = screen.getByText('Test Content').parentElement
    expect(panel).toHaveStyle({ '--dropdown-width': '300px' })
  })
})

/**
 * Tests for DropdownMenu (wrapper with interaction logic)
 */
describe('DropdownMenu', () => {
  // Mock ButtonAction to simplify testing
  const mockTriggerData = {
    url: '#',
    openInNewTab: false,
    label: {
      text: 'Menu',
      icon: 'menu',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Open menu',
    },
  }

  it('should render trigger button', () => {
    render(
      <DropdownMenu triggerData={mockTriggerData} direction={DirectionEnum.LTR} testId="test-menu">
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })

  it('should open dropdown on hover', () => {
    render(
      <DropdownMenu triggerData={mockTriggerData} direction={DirectionEnum.LTR} testId="test-menu">
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    const container = screen.getByTestId('test-menu')
    const button = screen.getByRole('button', { name: 'Open menu' })

    fireEvent.mouseEnter(container)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should close dropdown on mouse leave', () => {
    jest.useFakeTimers()
    render(
      <DropdownMenu triggerData={mockTriggerData} direction={DirectionEnum.LTR} testId="test-menu">
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    const container = screen.getByTestId('test-menu')
    const button = screen.getByRole('button', { name: 'Open menu' })

    // Open via hover
    fireEvent.mouseEnter(container)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Close via mouse leave
    fireEvent.mouseLeave(container)
    expect(button).toHaveAttribute('aria-expanded', 'false')

    jest.useRealTimers()
  })

  it('should toggle dropdown on click', () => {
    jest.useFakeTimers()
    render(
      <DropdownMenu triggerData={mockTriggerData} direction={DirectionEnum.LTR} testId="test-menu">
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    const button = screen.getByRole('button', { name: 'Open menu' })

    // Click to open
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Advance timer to allow click after hover protection
    act(() => {
      jest.advanceTimersByTime(100)
    })

    // Click again to close
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')

    jest.useRealTimers()
  })

  it('should ignore click immediately after hover (mobile double-tap fix)', () => {
    jest.useFakeTimers()
    render(
      <DropdownMenu triggerData={mockTriggerData} direction={DirectionEnum.LTR} testId="test-menu">
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    const container = screen.getByTestId('test-menu')
    const button = screen.getByRole('button', { name: 'Open menu' })

    // Hover to open
    fireEvent.mouseEnter(container)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Immediate click should be ignored
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Wait for timeout
    act(() => {
      jest.advanceTimersByTime(100)
    })

    // Click again should toggle
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')

    jest.useRealTimers()
  })

  it('should close dropdown on click outside', () => {
    render(
      <DropdownMenu triggerData={mockTriggerData} direction={DirectionEnum.LTR} testId="test-menu">
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    const container = screen.getByTestId('test-menu')
    const button = screen.getByRole('button', { name: 'Open menu' })

    // Open via hover
    fireEvent.mouseEnter(container)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Click outside
    fireEvent.mouseDown(document.body)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should close dropdown on scroll', () => {
    render(
      <DropdownMenu triggerData={mockTriggerData} direction={DirectionEnum.LTR} testId="test-menu">
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    const container = screen.getByTestId('test-menu')
    const button = screen.getByRole('button', { name: 'Open menu' })

    // Open via hover
    fireEvent.mouseEnter(container)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Scroll to close
    fireEvent.scroll(window)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should pass visible prop to trigger button', () => {
    render(
      <DropdownMenu triggerData={mockTriggerData} direction={DirectionEnum.LTR} testId="test-menu" visible={false}>
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    // Container is still rendered, visibility is handled by trigger button
    const container = screen.getByTestId('test-menu')
    expect(container).toBeInTheDocument()
  })

  it('should support controlled mode with isOpen/onOpenChange', () => {
    const mockOnOpenChange = jest.fn()
    render(
      <DropdownMenu
        triggerData={mockTriggerData}
        direction={DirectionEnum.LTR}
        testId="test-menu"
        isOpen={false}
        onOpenChange={mockOnOpenChange}
      >
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    const container = screen.getByTestId('test-menu')

    // Hover should call onOpenChange
    fireEvent.mouseEnter(container)
    expect(mockOnOpenChange).toHaveBeenCalledWith(true)
  })

  it('should render with align="end"', () => {
    render(
      <DropdownMenu triggerData={mockTriggerData} direction={DirectionEnum.LTR} testId="test-menu" align="end">
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    const container = screen.getByTestId('test-menu')
    fireEvent.mouseEnter(container)

    // The dropdown should have alignment classes
    const dropdown = screen.getByText('Dropdown Content').closest('.fixed')
    expect(dropdown).toHaveClass('sm:left-auto')
  })

  it('should call onSelect and close dropdown when children are clicked', () => {
    const mockOnSelect = jest.fn()
    render(
      <DropdownMenu
        triggerData={mockTriggerData}
        direction={DirectionEnum.LTR}
        testId="test-menu"
        onSelect={mockOnSelect}
      >
        <button>Select Item</button>
      </DropdownMenu>
    )
    const container = screen.getByTestId('test-menu')
    const triggerButton = screen.getByRole('button', { name: 'Open menu' })

    // Open dropdown
    fireEvent.mouseEnter(container)
    expect(triggerButton).toHaveAttribute('aria-expanded', 'true')

    // Click dropdown content
    const selectButton = screen.getByRole('button', { name: 'Select Item' })
    fireEvent.click(selectButton)

    // Should call onSelect and close
    expect(mockOnSelect).toHaveBeenCalledTimes(1)
    expect(triggerButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should not open dropdown when children is empty (no content)', () => {
    render(
      <DropdownMenu triggerData={mockTriggerData} direction={DirectionEnum.LTR} testId="test-menu">
        {null}
      </DropdownMenu>
    )
    const container = screen.getByTestId('test-menu')
    const button = screen.getByRole('button', { name: 'Open menu' })

    // Hover should not open dropdown because there's no content
    fireEvent.mouseEnter(container)
    expect(button).toHaveAttribute('aria-expanded', 'false')

    // Click should not toggle either
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should render trigger as ButtonLink when triggerType is "link"', () => {
    render(
      <DropdownMenu triggerData={mockTriggerData} direction={DirectionEnum.LTR} testId="test-menu" triggerType="link">
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    // ButtonLink renders as an anchor, ButtonAction renders as button
    const link = screen.getByRole('link', { name: 'Open menu' })
    expect(link).toBeInTheDocument()
  })
})

/**
 * Tests for backwards compatibility re-exports
 */
describe('DropdownPanel (backwards compatibility)', () => {
  it('should export DropdownPanel as alias for Dropdown', () => {
    // Verify re-export exists and is the same component
    const { DropdownPanel } = require('@/components/menus/DropdownMenu')
    expect(DropdownPanel).toBeDefined()
    expect(DropdownPanel).toBe(Dropdown)
  })
})
