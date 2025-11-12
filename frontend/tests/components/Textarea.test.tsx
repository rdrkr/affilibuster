// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from '@/components/Textarea'

describe('Textarea Component', () => {
  it('should render textarea field', () => {
    render(<Textarea placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<Textarea label="Message" />)
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
    expect(screen.getByText('Message')).toBeInTheDocument()
  })

  it('should render without label', () => {
    render(<Textarea placeholder="No label" />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('should show required indicator when required', () => {
    render(<Textarea label="Required Field" required />)
    const asterisk = screen.getByText('*')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk.className).toContain('text-error-500')
  })

  it('should not show required indicator by default', () => {
    render(<Textarea label="Optional Field" />)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('should display error message', () => {
    render(<Textarea label="Message" error="Message is too short" />)
    expect(screen.getByText('Message is too short')).toBeInTheDocument()
  })

  it('should apply error styles when error is present', () => {
    render(<Textarea label="Message" error="Invalid message" />)
    const textarea = screen.getByLabelText('Message')
    expect(textarea.className).toContain('border-error-500')
    expect(textarea.className).toContain('focus:ring-error-400')
  })

  it('should apply normal styles when no error', () => {
    render(<Textarea label="Message" />)
    const textarea = screen.getByLabelText('Message')
    expect(textarea.className).toContain('border-neutral-300')
    expect(textarea.className).toContain('focus:ring-tertiary-400')
  })

  it('should generate ID from label', () => {
    render(<Textarea label="User Message" />)
    const textarea = screen.getByLabelText('User Message')
    expect(textarea).toHaveAttribute('id', 'textarea-user-message')
  })

  it('should use custom ID when provided', () => {
    render(<Textarea label="Message" id="custom-message-id" />)
    const textarea = screen.getByLabelText('Message')
    expect(textarea).toHaveAttribute('id', 'custom-message-id')
  })

  it('should generate default ID when no label provided', () => {
    render(<Textarea data-testid="textarea-field" />)
    const textarea = screen.getByTestId('textarea-field')
    expect(textarea).toHaveAttribute('id', 'textarea-field')
  })

  it('should handle onChange event', () => {
    const handleChange = jest.fn()
    render(<Textarea label="Description" onChange={handleChange} />)
    const textarea = screen.getByLabelText('Description') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Test description' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(textarea.value).toBe('Test description')
  })

  it('should apply custom className', () => {
    render(<Textarea label="Custom" className="custom-textarea-class" />)
    const textarea = screen.getByLabelText('Custom')
    expect(textarea.className).toContain('custom-textarea-class')
    expect(textarea.className).toContain('w-full')
  })

  it('should support disabled state', () => {
    render(<Textarea label="Disabled" disabled />)
    const textarea = screen.getByLabelText('Disabled')
    expect(textarea).toBeDisabled()
  })

  it('should support readonly state', () => {
    render(<Textarea label="Readonly" readOnly />)
    const textarea = screen.getByLabelText('Readonly')
    expect(textarea).toHaveAttribute('readonly')
  })

  it('should support placeholder', () => {
    render(<Textarea label="Message" placeholder="Enter your message" />)
    expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument()
  })

  it('should support default value', () => {
    render(<Textarea label="Description" defaultValue="Default description" />)
    const textarea = screen.getByLabelText('Description') as HTMLTextAreaElement
    expect(textarea.value).toBe('Default description')
  })

  it('should support controlled value', () => {
    const { rerender } = render(<Textarea label="Controlled" value="initial" onChange={jest.fn()} />)
    const textarea = screen.getByLabelText('Controlled') as HTMLTextAreaElement
    expect(textarea.value).toBe('initial')

    rerender(<Textarea label="Controlled" value="updated" onChange={jest.fn()} />)
    expect(textarea.value).toBe('updated')
  })

  it('should support rows attribute', () => {
    render(<Textarea label="Message" rows={5} />)
    const textarea = screen.getByLabelText('Message')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('should support cols attribute', () => {
    render(<Textarea label="Message" cols={50} />)
    const textarea = screen.getByLabelText('Message')
    expect(textarea).toHaveAttribute('cols', '50')
  })

  it('should apply base textarea classes', () => {
    render(<Textarea label="Base" />)
    const textarea = screen.getByLabelText('Base')
    expect(textarea.className).toContain('w-full')
    expect(textarea.className).toContain('px-4')
    expect(textarea.className).toContain('py-2')
    expect(textarea.className).toContain('rounded-lg')
    expect(textarea.className).toContain('focus:outline-none')
    expect(textarea.className).toContain('focus:ring-2')
    expect(textarea.className).toContain('resize-vertical')
  })

  it('should pass through additional HTML attributes', () => {
    render(<Textarea label="Test" data-testid="test-textarea" aria-describedby="help-text" />)
    const textarea = screen.getByLabelText('Test')
    expect(textarea).toHaveAttribute('data-testid', 'test-textarea')
    expect(textarea).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('should support maxLength attribute', () => {
    render(<Textarea label="Message" maxLength={100} />)
    const textarea = screen.getByLabelText('Message')
    expect(textarea).toHaveAttribute('maxLength', '100')
  })
})
