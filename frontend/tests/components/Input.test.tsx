// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/Input'

describe('Input Component', () => {
  it('should render input field', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<Input label="Email Address" />)
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })

  it('should render without label', () => {
    render(<Input placeholder="No label" />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('should show required indicator when required', () => {
    render(<Input label="Required Field" required />)
    const asterisk = screen.getByText('*')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk.className).toContain('text-error-500')
  })

  it('should not show required indicator by default', () => {
    render(<Input label="Optional Field" />)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('should display error message', () => {
    render(<Input label="Email" error="Invalid email address" />)
    expect(screen.getByText('Invalid email address')).toBeInTheDocument()
  })

  it('should apply error styles when error is present', () => {
    render(<Input label="Email" error="Invalid email" />)
    const input = screen.getByLabelText('Email')
    expect(input.className).toContain('border-error-500')
    expect(input.className).toContain('focus:ring-error-400')
  })

  it('should apply normal styles when no error', () => {
    render(<Input label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input.className).toContain('border-neutral-300')
    expect(input.className).toContain('focus:ring-tertiary-400')
  })

  it('should generate ID from label', () => {
    render(<Input label="Email Address" />)
    const input = screen.getByLabelText('Email Address')
    expect(input).toHaveAttribute('id', 'input-email-address')
  })

  it('should use custom ID when provided', () => {
    render(<Input label="Email" id="custom-email-id" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('id', 'custom-email-id')
  })

  it('should generate default ID when no label provided', () => {
    render(<Input data-testid="input-field" />)
    const input = screen.getByTestId('input-field')
    expect(input).toHaveAttribute('id', 'input-field')
  })

  it('should handle onChange event', () => {
    const handleChange = jest.fn()
    render(<Input label="Username" onChange={handleChange} />)
    const input = screen.getByLabelText('Username') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'testuser' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(input.value).toBe('testuser')
  })

  it('should apply custom className', () => {
    render(<Input label="Custom" className="custom-input-class" />)
    const input = screen.getByLabelText('Custom')
    expect(input.className).toContain('custom-input-class')
    expect(input.className).toContain('w-full')
  })

  it('should render as text input by default', () => {
    render(<Input type="text" label="Default Type" />)
    const input = screen.getByLabelText('Default Type')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('should support email input type', () => {
    render(<Input type="email" label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('should support password input type', () => {
    render(<Input type="password" label="Password" />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should support disabled state', () => {
    render(<Input label="Disabled" disabled />)
    const input = screen.getByLabelText('Disabled')
    expect(input).toBeDisabled()
  })

  it('should support readonly state', () => {
    render(<Input label="Readonly" readOnly />)
    const input = screen.getByLabelText('Readonly')
    expect(input).toHaveAttribute('readonly')
  })

  it('should support placeholder', () => {
    render(<Input label="Email" placeholder="Enter your email" />)
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
  })

  it('should support default value', () => {
    render(<Input label="Username" defaultValue="defaultuser" />)
    const input = screen.getByLabelText('Username') as HTMLInputElement
    expect(input.value).toBe('defaultuser')
  })

  it('should support controlled value', () => {
    const { rerender } = render(<Input label="Controlled" value="initial" onChange={jest.fn()} />)
    const input = screen.getByLabelText('Controlled') as HTMLInputElement
    expect(input.value).toBe('initial')

    rerender(<Input label="Controlled" value="updated" onChange={jest.fn()} />)
    expect(input.value).toBe('updated')
  })

  it('should apply base input classes', () => {
    render(<Input label="Base" />)
    const input = screen.getByLabelText('Base')
    expect(input.className).toContain('w-full')
    expect(input.className).toContain('px-4')
    expect(input.className).toContain('py-2')
    expect(input.className).toContain('rounded-lg')
    expect(input.className).toContain('focus:outline-none')
    expect(input.className).toContain('focus:ring-2')
  })

  it('should pass through additional HTML attributes', () => {
    render(<Input label="Test" data-testid="test-input" aria-describedby="help-text" />)
    const input = screen.getByLabelText('Test')
    expect(input).toHaveAttribute('data-testid', 'test-input')
    expect(input).toHaveAttribute('aria-describedby', 'help-text')
  })
})
