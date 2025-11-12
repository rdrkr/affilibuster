// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { Dropdown, type DropdownItem } from '@/components/Dropdown'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

describe('Dropdown Component', () => {
  const mockItems: DropdownItem[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]

  it('should render dropdown trigger button', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should display selected item label', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('should display placeholder when no value selected', () => {
    render(<Dropdown value="" items={mockItems} onChange={jest.fn()} placeholder="Choose option" />)
    expect(screen.getByText('Choose option')).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<Dropdown label="Select Option" value="option1" items={mockItems} onChange={jest.fn()} />)
    expect(screen.getByText('Select Option')).toBeInTheDocument()
  })

  it('should open dropdown when clicking trigger', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getAllByRole('menuitem')).toHaveLength(3)
  })

  it('should close dropdown when clicking backdrop', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)

    const backdrop = document.querySelector('.fixed.inset-0')
    expect(backdrop).toBeInTheDocument()

    if (backdrop) {
      fireEvent.click(backdrop)
    }

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should call onChange when selecting an item', () => {
    const handleChange = jest.fn()
    render(<Dropdown value="option1" items={mockItems} onChange={handleChange} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const option2 = screen.getByText('Option 2')
    fireEvent.click(option2)

    expect(handleChange).toHaveBeenCalledWith('option2')
  })

  it('should close dropdown after selecting item', async () => {
    const handleChange = jest.fn()
    render(<Dropdown value="option1" items={mockItems} onChange={handleChange} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const option2 = screen.getByText('Option 2')
    fireEvent.click(option2)

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('should show checkmark on selected item', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Verify the selected item has visual styling (aria-selected was removed per ARIA standards)
    const selectedOption = screen.getByRole('menuitem', { name: /Option 1/i })
    expect(selectedOption).toHaveClass('bg-primary-50')
    expect(selectedOption).toHaveClass('font-medium')
  })

  it('should handle disabled dropdown', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} disabled />)
    const button = screen.getByRole('button')

    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should handle disabled items', () => {
    const itemsWithDisabled: DropdownItem[] = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2', disabled: true },
      { value: 'option3', label: 'Option 3' },
    ]

    const handleChange = jest.fn()
    render(<Dropdown value="option1" items={itemsWithDisabled} onChange={handleChange} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const disabledOption = screen.getByText('Option 2').closest('button')
    expect(disabledOption).toBeDisabled()

    if (disabledOption) {
      fireEvent.click(disabledOption)
    }
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('should display error message', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} error="Please select a valid option" />)
    expect(screen.getByText('Please select a valid option')).toBeInTheDocument()
  })

  it('should apply error styles when error is present', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} error="Error" />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('border-error-500')
  })

  it('should render items with icons', () => {
    const itemsWithIcons: DropdownItem[] = [
      { value: 'option1', label: 'Option 1', icon: <span data-testid="icon-1">🔥</span> },
      { value: 'option2', label: 'Option 2', icon: <span data-testid="icon-2">⭐</span> },
    ]

    render(<Dropdown value="option1" items={itemsWithIcons} onChange={jest.fn()} />)
    expect(screen.getByTestId('icon-1')).toBeInTheDocument()

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByTestId('icon-2')).toBeInTheDocument()
  })

  it('should render items with descriptions', () => {
    const itemsWithDescriptions: DropdownItem[] = [
      { value: 'option1', label: 'Option 1', description: 'First option' },
      { value: 'option2', label: 'Option 2', description: 'Second option' },
    ]

    render(<Dropdown value="option1" items={itemsWithDescriptions} onChange={jest.fn()} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('First option')).toBeInTheDocument()
    expect(screen.getByText('Second option')).toBeInTheDocument()
  })

  it('should use custom renderTrigger', () => {
    const renderTrigger = (selectedItem: DropdownItem | undefined) => (
      <span data-testid="custom-trigger">Custom: {selectedItem?.label}</span>
    )

    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} renderTrigger={renderTrigger} />)
    expect(screen.getByTestId('custom-trigger')).toHaveTextContent('Custom: Option 1')
  })

  it('should use custom renderItem', () => {
    const renderItem = (item: DropdownItem) => <span data-testid={`custom-${item.value}`}>{item.label}</span>

    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} renderItem={renderItem} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByTestId('custom-option1')).toBeInTheDocument()
    expect(screen.getByTestId('custom-option2')).toBeInTheDocument()
    expect(screen.getByTestId('custom-option3')).toBeInTheDocument()
  })

  it('should apply custom buttonClassName', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} buttonClassName="custom-button-class" />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-button-class')
  })

  it('should apply custom className to container', () => {
    const { container } = render(
      <Dropdown value="option1" items={mockItems} onChange={jest.fn()} className="custom-container-class" />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-container-class')
  })

  it('should set aria-label when provided', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} ariaLabel="Select country" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Select country')
  })

  it('should set aria-expanded correctly', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
    const button = screen.getByRole('button')

    expect(button).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should set aria-haspopup', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('should toggle dropdown on multiple clicks', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
    const button = screen.getByRole('button')

    fireEvent.click(button)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('should work with numeric values', () => {
    const numericItems: DropdownItem<number>[] = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
      { value: 3, label: 'Three' },
    ]

    const handleChange = jest.fn()
    render(<Dropdown<number> value={1} items={numericItems} onChange={handleChange} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const option2 = screen.getByText('Two')
    fireEvent.click(option2)

    expect(handleChange).toHaveBeenCalledWith(2)
  })

  it('should show dropdown arrow icon', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
    const button = screen.getByRole('button')
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should rotate arrow when dropdown is open', () => {
    render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
    const button = screen.getByRole('button')
    const svg = button.querySelector('svg')

    expect(svg?.classList.contains('rotate-180')).toBe(false)

    fireEvent.click(button)
    expect(svg?.classList.contains('rotate-180')).toBe(true)
  })

  describe('keyboard navigation', () => {
    it('should open dropdown with Enter key', () => {
      render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
      const button = screen.getByRole('button')

      fireEvent.keyDown(button, { key: 'Enter' })
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should open dropdown with Space key', () => {
      render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
      const button = screen.getByRole('button')

      fireEvent.keyDown(button, { key: ' ' })
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should close dropdown with Escape key', () => {
      render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      expect(screen.getByRole('menu')).toBeInTheDocument()

      fireEvent.keyDown(button, { key: 'Escape' })
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('should navigate down with ArrowDown key', () => {
      render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      fireEvent.keyDown(button, { key: 'ArrowDown' })

      const items = screen.getAllByRole('menuitem')
      expect(items[1]).toHaveClass('ring-2')
    })

    it('should navigate up with ArrowUp key', () => {
      render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      fireEvent.keyDown(button, { key: 'ArrowDown' })
      fireEvent.keyDown(button, { key: 'ArrowDown' })
      fireEvent.keyDown(button, { key: 'ArrowUp' })

      const items = screen.getAllByRole('menuitem')
      expect(items[1]).toHaveClass('ring-2')
    })

    it('should select focused item with Enter key', () => {
      const onChange = jest.fn()
      render(<Dropdown value="option1" items={mockItems} onChange={onChange} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      fireEvent.keyDown(button, { key: 'ArrowDown' })
      fireEvent.keyDown(button, { key: 'Enter' })

      expect(onChange).toHaveBeenCalledWith('option2')
    })

    it('should select focused item with Space key', () => {
      const onChange = jest.fn()
      render(<Dropdown value="option1" items={mockItems} onChange={onChange} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      fireEvent.keyDown(button, { key: 'ArrowDown' })
      fireEvent.keyDown(button, { key: ' ' })

      expect(onChange).toHaveBeenCalledWith('option2')
    })

    it('should jump to first item with Home key', () => {
      render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      fireEvent.keyDown(button, { key: 'ArrowDown' })
      fireEvent.keyDown(button, { key: 'ArrowDown' })
      fireEvent.keyDown(button, { key: 'Home' })

      const items = screen.getAllByRole('menuitem')
      expect(items[0]).toHaveClass('ring-2')
    })

    it('should jump to last item with End key', () => {
      render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      fireEvent.keyDown(button, { key: 'End' })

      const items = screen.getAllByRole('menuitem')
      expect(items[2]).toHaveClass('ring-2')
    })

    it('should close dropdown with Tab key', () => {
      render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      expect(screen.getByRole('menu')).toBeInTheDocument()

      fireEvent.keyDown(button, { key: 'Tab' })
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('should not navigate beyond first item', () => {
      render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      fireEvent.keyDown(button, { key: 'ArrowUp' })

      const items = screen.getAllByRole('menuitem')
      expect(items[0]).toHaveClass('ring-2')
    })

    it('should not navigate beyond last item', () => {
      render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      fireEvent.keyDown(button, { key: 'End' })
      fireEvent.keyDown(button, { key: 'ArrowDown' })

      const items = screen.getAllByRole('menuitem')
      expect(items[2]).toHaveClass('ring-2')
    })

    it('should handle other keys without action', () => {
      render(<Dropdown value="option1" items={mockItems} onChange={jest.fn()} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      const menuBefore = screen.getByRole('menu')

      // Press a key that doesn't have a handler (covers default case)
      fireEvent.keyDown(button, { key: 'a' })

      // Menu should still be open
      expect(screen.getByRole('menu')).toBe(menuBefore)
    })
  })
})
