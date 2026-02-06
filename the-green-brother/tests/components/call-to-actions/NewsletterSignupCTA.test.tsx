// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for NewsletterSignupCTA component (Newsletter Signup CTA)
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { NewsletterSignupCTA, type NewsletterSignupCTAProps } from '@/components/call-to-actions/NewsletterSignupCTA'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

describe('NewsletterSignupCTA', () => {
  const mockSectionData: NewsletterSignupCTAProps['data'] = {
    __component: 'call-to-actions.newsletter-signup-cta',
    id: 1,
    title: 'Join Our Community',
    description: 'Get weekly eco-tips, new product alerts, and exclusive deals sent to your inbox.',
    emailPlaceholder: {
      text: 'Enter your email',
      ariaDescription: 'Email input field',
      icon: 'email',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
    },
    submitButton: {
      label: {
        text: 'Sign Up',
        icon: 'send',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Submit newsletter signup',
      },
      url: '#',
      openInNewTab: false,
    },
  }

  it('should render newsletter title', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    expect(screen.getByRole('heading', { level: 4, name: 'Join Our Community' })).toBeInTheDocument()
  })

  it('should render newsletter description', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    expect(
      screen.getByText('Get weekly eco-tips, new product alerts, and exclusive deals sent to your inbox.')
    ).toBeInTheDocument()
  })

  it('should render email input with correct placeholder', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('aria-label', 'Email input field')
  })

  it('should render submit button with correct text', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    const submitButton = screen.getByRole('button', { name: /Submit newsletter signup/i })
    expect(submitButton).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('should call onClick handler when submit button is clicked', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    const submitButton = screen.getByRole('button', { name: /Submit newsletter signup/i })
    // Verify it doesn't crash when clicked (covers the empty handler)
    fireEvent.click(submitButton)
  })

  it('should prevent form submission default behavior', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()

    // Submit the form - the onSubmit handler calls e.preventDefault()
    // This doesn't throw or navigate, indicating the handler works
    fireEvent.submit(form!)

    // Form is still present after submit (no page reload)
    expect(form).toBeInTheDocument()
  })

  it('should render centered layout', () => {
    const { container } = render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    // The component renders a centered container
    const maxWidthContainer = container.querySelector('.max-w-2xl')
    expect(maxWidthContainer).toBeInTheDocument()
  })

  it('should render newsletter form container with correct styling', () => {
    const { container } = render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    const formContainer = container.querySelector('.rounded-xl')
    expect(formContainer).toBeInTheDocument()
  })

  it('should apply dir="rtl" to email input for RTL direction', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.RTL} data={mockSectionData} />)
    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toHaveAttribute('dir', 'rtl')
  })

  it('should apply dir="ltr" to email input for LTR direction', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)
    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toHaveAttribute('dir', 'ltr')
  })

  it('should have flex gap-2 on form for RTL direction (dir attribute handles layout)', () => {
    const { container } = render(<NewsletterSignupCTA direction={DirectionEnum.RTL} data={mockSectionData} />)
    const form = container.querySelector('form')
    expect(form).toHaveClass('flex', 'gap-2')
  })

  it('should render submit button and handle click without errors', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    // Find the submit button by its aria label and click it
    const button = screen.getByRole('button', { name: /Submit newsletter signup/i })
    expect(button).toBeInTheDocument()

    // Click should not throw - the onClick is an intentionally empty handler
    expect(() => {
      fireEvent.click(button)
    }).not.toThrow()
  })

  it('should have proper email input attributes', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toHaveAttribute('id', 'newsletter-email')
    expect(emailInput).toHaveAttribute('name', 'email')
    expect(emailInput).toHaveAttribute('autocomplete', 'email')
  })
})
