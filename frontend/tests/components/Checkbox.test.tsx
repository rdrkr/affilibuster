// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from '@/components/Checkbox'

describe('Checkbox Component', () => {
  it('should render checkbox', () => {
    render(<Checkbox label="Accept terms" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<Checkbox label="Accept terms and conditions" />)
    expect(screen.getByText('Accept terms and conditions')).toBeInTheDocument()
    expect(screen.getByLabelText('Accept terms and conditions')).toBeInTheDocument()
  })

  it('should render without label', () => {
    render(<Checkbox data-testid="checkbox-no-label" />)
    const checkbox = screen.getByTestId('checkbox-no-label')
    expect(checkbox).toBeInTheDocument()
    // Label element exists but has no visible text when no label prop provided
    const label = checkbox.closest('label')
    expect(label).toBeInTheDocument()
  })

  it('should display error message', () => {
    render(<Checkbox label="Terms" error="You must accept the terms" />)
    expect(screen.getByText('You must accept the terms')).toBeInTheDocument()
  })

  it('should generate ID from label', () => {
    render(<Checkbox label="Accept Terms" />)
    const checkbox = screen.getByLabelText('Accept Terms')
    expect(checkbox).toHaveAttribute('id', 'checkbox-accept-terms')
  })

  it('should use custom ID when provided', () => {
    render(<Checkbox label="Terms" id="custom-checkbox-id" />)
    const checkbox = screen.getByLabelText('Terms')
    expect(checkbox).toHaveAttribute('id', 'custom-checkbox-id')
  })

  it('should generate default ID when no label provided', () => {
    render(<Checkbox data-testid="checkbox-field" />)
    const checkbox = screen.getByTestId('checkbox-field')
    expect(checkbox).toHaveAttribute('id', 'checkbox-field')
  })

  it('should handle onChange event', () => {
    const handleChange = jest.fn()
    render(<Checkbox label="Agree" onChange={handleChange} />)
    const checkbox = screen.getByLabelText('Agree') as HTMLInputElement
    fireEvent.click(checkbox)
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(checkbox.checked).toBe(true)
  })

  it('should toggle checked state', () => {
    const { rerender } = render(<Checkbox label="Toggle" checked={false} onChange={jest.fn()} />)
    const checkbox = screen.getByLabelText('Toggle') as HTMLInputElement
    expect(checkbox.checked).toBe(false)

    rerender(<Checkbox label="Toggle" checked={true} onChange={jest.fn()} />)
    expect(checkbox.checked).toBe(true)
  })

  it('should support uncontrolled checkbox', () => {
    render(<Checkbox label="Uncontrolled" />)
    const checkbox = screen.getByLabelText('Uncontrolled') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
  })

  it('should support defaultChecked', () => {
    render(<Checkbox label="Default Checked" defaultChecked />)
    const checkbox = screen.getByLabelText('Default Checked') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('should apply custom className', () => {
    render(<Checkbox label="Custom" className="custom-checkbox-class" />)
    const checkbox = screen.getByLabelText('Custom')
    expect(checkbox.className).toContain('custom-checkbox-class')
    expect(checkbox.className).toContain('w-5')
    expect(checkbox.className).toContain('h-5')
  })

  it('should support disabled state', () => {
    render(<Checkbox label="Disabled" disabled />)
    const checkbox = screen.getByLabelText('Disabled')
    expect(checkbox).toBeDisabled()
  })

  it('should apply base checkbox classes', () => {
    render(<Checkbox label="Base" />)
    const checkbox = screen.getByLabelText('Base')
    expect(checkbox.className).toContain('w-5')
    expect(checkbox.className).toContain('h-5')
    expect(checkbox.className).toContain('rounded')
    expect(checkbox.className).toContain('focus:ring-2')
    expect(checkbox.className).toContain('cursor-pointer')
  })

  it('should have correct type attribute', () => {
    render(<Checkbox label="Type Check" />)
    const checkbox = screen.getByLabelText('Type Check')
    expect(checkbox).toHaveAttribute('type', 'checkbox')
  })

  it('should apply label cursor pointer style', () => {
    const { container } = render(<Checkbox label="Clickable" />)
    const label = container.querySelector('label')
    expect(label?.className).toContain('cursor-pointer')
  })

  it('should allow clicking label to toggle checkbox', () => {
    render(<Checkbox label="Click Label" />)
    const checkbox = screen.getByLabelText('Click Label') as HTMLInputElement
    const label = screen.getByText('Click Label')

    expect(checkbox.checked).toBe(false)
    fireEvent.click(label)
    expect(checkbox.checked).toBe(true)
  })

  it('should pass through additional HTML attributes', () => {
    render(<Checkbox label="Test" data-testid="test-checkbox" aria-describedby="help-text" />)
    const checkbox = screen.getByLabelText('Test')
    expect(checkbox).toHaveAttribute('data-testid', 'test-checkbox')
    expect(checkbox).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('should support required attribute', () => {
    render(<Checkbox label="Required" required />)
    const checkbox = screen.getByLabelText('Required')
    expect(checkbox).toBeRequired()
  })

  it('should render error message in correct styling', () => {
    render(<Checkbox label="Error" error="This is an error" />)
    const errorElement = screen.getByText('This is an error')
    expect(errorElement.className).toContain('text-error-500')
    expect(errorElement.className).toContain('text-sm')
  })
})
