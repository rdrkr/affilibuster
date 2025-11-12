// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Radio } from '@/components/Radio'

describe('Radio Component', () => {
  it('should render radio button', () => {
    render(<Radio label="Option 1" name="option" />)
    const radio = screen.getByRole('radio')
    expect(radio).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<Radio label="Basic Plan" name="plan" />)
    expect(screen.getByText('Basic Plan')).toBeInTheDocument()
    expect(screen.getByLabelText('Basic Plan')).toBeInTheDocument()
  })

  it('should render without label', () => {
    render(<Radio name="option" data-testid="radio-no-label" />)
    const radio = screen.getByTestId('radio-no-label')
    expect(radio).toBeInTheDocument()
  })

  it('should display error message', () => {
    render(<Radio label="Option" name="option" error="Please select an option" />)
    expect(screen.getByText('Please select an option')).toBeInTheDocument()
  })

  it('should generate ID from label', () => {
    render(<Radio label="Premium Plan" name="plan" />)
    const radio = screen.getByLabelText('Premium Plan')
    expect(radio).toHaveAttribute('id', 'radio-premium-plan')
  })

  it('should use custom ID when provided', () => {
    render(<Radio label="Plan" name="plan" id="custom-radio-id" />)
    const radio = screen.getByLabelText('Plan')
    expect(radio).toHaveAttribute('id', 'custom-radio-id')
  })

  it('should generate default ID when no label provided', () => {
    render(<Radio name="option" data-testid="radio-field" />)
    const radio = screen.getByTestId('radio-field')
    expect(radio).toHaveAttribute('id', 'radio-field')
  })

  it('should handle onChange event', () => {
    const handleChange = jest.fn()
    render(<Radio label="Option 1" name="option" onChange={handleChange} />)
    const radio = screen.getByLabelText('Option 1') as HTMLInputElement
    fireEvent.click(radio)
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(radio.checked).toBe(true)
  })

  it('should support checked state', () => {
    const { rerender } = render(<Radio label="Option" name="option" checked={false} onChange={jest.fn()} />)
    const radio = screen.getByLabelText('Option') as HTMLInputElement
    expect(radio.checked).toBe(false)

    rerender(<Radio label="Option" name="option" checked={true} onChange={jest.fn()} />)
    expect(radio.checked).toBe(true)
  })

  it('should support uncontrolled radio', () => {
    render(<Radio label="Uncontrolled" name="option" />)
    const radio = screen.getByLabelText('Uncontrolled') as HTMLInputElement
    expect(radio.checked).toBe(false)
    fireEvent.click(radio)
    expect(radio.checked).toBe(true)
  })

  it('should support defaultChecked', () => {
    render(<Radio label="Default Checked" name="option" defaultChecked />)
    const radio = screen.getByLabelText('Default Checked') as HTMLInputElement
    expect(radio.checked).toBe(true)
  })

  it('should apply custom className', () => {
    render(<Radio label="Custom" name="option" className="custom-radio-class" />)
    const radio = screen.getByLabelText('Custom')
    expect(radio.className).toContain('custom-radio-class')
    expect(radio.className).toContain('w-5')
    expect(radio.className).toContain('h-5')
  })

  it('should support disabled state', () => {
    render(<Radio label="Disabled" name="option" disabled />)
    const radio = screen.getByLabelText('Disabled')
    expect(radio).toBeDisabled()
  })

  it('should apply base radio classes', () => {
    render(<Radio label="Base" name="option" />)
    const radio = screen.getByLabelText('Base')
    expect(radio.className).toContain('w-5')
    expect(radio.className).toContain('h-5')
    expect(radio.className).toContain('focus:ring-2')
    expect(radio.className).toContain('cursor-pointer')
  })

  it('should have correct type attribute', () => {
    render(<Radio label="Type Check" name="option" />)
    const radio = screen.getByLabelText('Type Check')
    expect(radio).toHaveAttribute('type', 'radio')
  })

  it('should support name attribute for grouping', () => {
    render(
      <div>
        <Radio label="Option 1" name="group" value="1" />
        <Radio label="Option 2" name="group" value="2" />
      </div>
    )
    const radio1 = screen.getByLabelText('Option 1')
    const radio2 = screen.getByLabelText('Option 2')
    expect(radio1).toHaveAttribute('name', 'group')
    expect(radio2).toHaveAttribute('name', 'group')
  })

  it('should support value attribute', () => {
    render(<Radio label="Basic" name="plan" value="basic" />)
    const radio = screen.getByLabelText('Basic')
    expect(radio).toHaveAttribute('value', 'basic')
  })

  it('should apply label cursor pointer style', () => {
    const { container } = render(<Radio label="Clickable" name="option" />)
    const label = container.querySelector('label')
    expect(label?.className).toContain('cursor-pointer')
  })

  it('should allow clicking label to select radio', () => {
    render(<Radio label="Click Label" name="option" />)
    const radio = screen.getByLabelText('Click Label') as HTMLInputElement
    const label = screen.getByText('Click Label')

    expect(radio.checked).toBe(false)
    fireEvent.click(label)
    expect(radio.checked).toBe(true)
  })

  it('should pass through additional HTML attributes', () => {
    render(<Radio label="Test" name="option" data-testid="test-radio" aria-describedby="help-text" />)
    const radio = screen.getByLabelText('Test')
    expect(radio).toHaveAttribute('data-testid', 'test-radio')
    expect(radio).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('should support required attribute', () => {
    render(<Radio label="Required" name="option" required />)
    const radio = screen.getByLabelText('Required')
    expect(radio).toBeRequired()
  })

  it('should render error message in correct styling', () => {
    render(<Radio label="Error" name="option" error="This is an error" />)
    const errorElement = screen.getByText('This is an error')
    expect(errorElement.className).toContain('text-error-500')
    expect(errorElement.className).toContain('text-sm')
  })

  it('should handle radio group selection', () => {
    const handleChange1 = jest.fn()
    const handleChange2 = jest.fn()

    render(
      <div>
        <Radio label="Option 1" name="group" value="1" onChange={handleChange1} />
        <Radio label="Option 2" name="group" value="2" onChange={handleChange2} />
      </div>
    )

    const radio1 = screen.getByLabelText('Option 1') as HTMLInputElement
    const radio2 = screen.getByLabelText('Option 2') as HTMLInputElement

    fireEvent.click(radio1)
    expect(handleChange1).toHaveBeenCalledTimes(1)
    expect(radio1.checked).toBe(true)

    fireEvent.click(radio2)
    expect(handleChange2).toHaveBeenCalledTimes(1)
    expect(radio2.checked).toBe(true)
  })
})
