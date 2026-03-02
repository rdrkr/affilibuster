// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for NewsletterSignupCTA component (Newsletter Signup CTA)
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { NewsletterSignupCTA, type NewsletterSignupCTAProps } from '@/components/call-to-actions/NewsletterSignupCTA'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the newsletter API module
const mockSubscribeNewsletter = jest.fn()
jest.mock('@/lib/newsletter', () => ({
  subscribeNewsletter: (...args: unknown[]) => mockSubscribeNewsletter(...args),
}))

// react-markdown, remark-gfm, rehype-raw, and rehype-sanitize are mocked via moduleNameMapper in jest.config.ts

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
    consentLabel: {
      text: 'I agree to receive newsletters and accept the [Privacy Policy](/en/privacy).',
      ariaDescription: 'Newsletter consent checkbox',
      icon: '',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
    },
    consentRequiredError: {
      text: 'You must accept the privacy policy to subscribe.',
      ariaDescription: 'Consent required error',
      icon: '',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
    },
    pendingConfirmationMessage: {
      text: 'Check your email to confirm your subscription.',
      ariaDescription: 'DOI pending confirmation',
      icon: 'mark_email_read',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
    },
    successMessage: {
      text: 'Thank you for subscribing!',
      ariaDescription: 'Subscription success message',
      icon: 'check_circle',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
    },
    errorMessage: {
      text: 'Something went wrong. Please try again.',
      ariaDescription: 'Subscription error message',
      icon: 'error',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
    },
    emailRequiredError: {
      text: 'Please enter your email address.',
      ariaDescription: 'Email required error',
      icon: '',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
    },
    emailInvalidError: {
      text: 'Please enter a valid email address.',
      ariaDescription: 'Email invalid error',
      icon: '',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

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

  it('should render submit button with correct text and type', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    const submitButton = screen.getByRole('button', { name: /Submit newsletter signup/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('should have proper email input attributes', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toHaveAttribute('id', 'newsletter-email')
    expect(emailInput).toHaveAttribute('name', 'email')
    expect(emailInput).toHaveAttribute('autocomplete', 'email')
  })

  it('should render centered layout', () => {
    const { container } = render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

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

  it('should have flex gap-2 on input row for RTL direction (dir attribute handles layout)', () => {
    const { container } = render(<NewsletterSignupCTA direction={DirectionEnum.RTL} data={mockSectionData} />)
    const inputRow = container.querySelector('.flex.gap-2')
    expect(inputRow).toBeInTheDocument()
  })

  it('should call onClick handler when submit button is clicked', () => {
    render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

    // Enter email and check consent so button is enabled
    const emailInput = screen.getByPlaceholderText('Enter your email')
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    const checkbox = screen.getByTestId('consent-checkbox')
    fireEvent.click(checkbox)

    const submitButton = screen.getByRole('button', { name: /Submit newsletter signup/i })
    // Verify it doesn't crash when clicked (covers the empty handler)
    fireEvent.click(submitButton)
  })

  describe('consent checkbox', () => {
    it('should render consent checkbox unchecked by default', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const checkbox = screen.getByTestId('consent-checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })

    it('should render consent label text as markdown', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const consentText = screen.getByTestId('consent-text')
      expect(consentText).toBeInTheDocument()
      expect(consentText).toHaveTextContent(/Privacy Policy/)
    })

    it('should disable submit button when consent is not checked', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Submit newsletter signup/i })
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when email is filled and consent is checked', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })

      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /Submit newsletter signup/i })
      expect(submitButton).not.toBeDisabled()
    })

    it('should show consentRequiredError when submitting without consent', async () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })

      // Check consent to enable submit, then uncheck
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      expect(screen.getByTestId('consent-error')).toHaveTextContent('You must accept the privacy policy to subscribe.')
      expect(mockSubscribeNewsletter).not.toHaveBeenCalled()
    })

    it('should clear consent error when checkbox is checked', async () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })

      // Check consent to enable button, uncheck, then submit to trigger error
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox) // check
      fireEvent.click(checkbox) // uncheck

      const form = document.querySelector('form')
      fireEvent.submit(form!)
      expect(screen.getByTestId('consent-error')).toBeInTheDocument()

      // Check consent again - error should clear
      fireEvent.click(checkbox)
      expect(screen.queryByTestId('consent-error')).not.toBeInTheDocument()
    })

    it('should apply text-left for LTR consent text', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const consentText = screen.getByTestId('consent-text')
      expect(consentText).toHaveClass('text-left')
      expect(consentText).not.toHaveClass('text-right')
    })

    it('should apply text-right for RTL consent text', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.RTL} data={mockSectionData} />)

      const consentText = screen.getByTestId('consent-text')
      expect(consentText).toHaveClass('text-right')
    })

    it('should disable consent checkbox during submission', async () => {
      let resolvePromise: (value: unknown) => void
      mockSubscribeNewsletter.mockReturnValueOnce(
        new Promise(resolve => {
          resolvePromise = resolve
        })
      )

      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(checkbox).toBeDisabled()
      })

      resolvePromise!({ success: true })

      await waitFor(() => {
        expect(screen.getByTestId('newsletter-success')).toBeInTheDocument()
      })
    })
  })

  describe('email validation', () => {
    it('should disable submit button when email is empty', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const submitButton = screen.getByRole('button', { name: /Submit newsletter signup/i })
      expect(submitButton).toBeDisabled()
    })

    it('should show CMS required error when submitting empty email', async () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      // Type something then clear it, check consent
      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'a' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)
      fireEvent.change(emailInput, { target: { value: '' } })

      // Force submit by submitting the form
      const form = document.querySelector('form')
      fireEvent.submit(form!)

      expect(screen.getByTestId('email-error')).toHaveTextContent('Please enter your email address.')
      expect(mockSubscribeNewsletter).not.toHaveBeenCalled()
    })

    it('should show CMS invalid error when submitting invalid email', async () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      expect(screen.getByTestId('email-error')).toHaveTextContent('Please enter a valid email address.')
      expect(mockSubscribeNewsletter).not.toHaveBeenCalled()
    })

    it('should clear email error when user types', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'bad' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      // Submit to trigger error
      const form = document.querySelector('form')
      fireEvent.submit(form!)
      expect(screen.getByTestId('email-error')).toBeInTheDocument()

      // Type again to clear error
      fireEvent.change(emailInput, { target: { value: 'bad2' } })
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument()
    })

    it('should set aria-invalid on email input when there is an error', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'bad' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    })

    it('should apply error border styling when email is invalid', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'bad' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      expect(emailInput.className).toContain('border-error-500')
    })

    it('should show error text aligned right in RTL mode', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.RTL} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'bad' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      const errorSpan = screen.getByTestId('email-error')
      expect(errorSpan).toHaveClass('text-right')
    })

    it('should show error text aligned left in LTR mode', () => {
      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'bad' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      const errorSpan = screen.getByTestId('email-error')
      expect(errorSpan).toHaveClass('text-left')
    })
  })

  describe('form submission', () => {
    it('should call subscribeNewsletter on valid submission with consent', async () => {
      mockSubscribeNewsletter.mockResolvedValueOnce({ success: true })

      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(mockSubscribeNewsletter).toHaveBeenCalledWith('user@example.com')
      })
    })

    it('should trim email before submitting', async () => {
      mockSubscribeNewsletter.mockResolvedValueOnce({ success: true })

      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: '  user@example.com  ' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(mockSubscribeNewsletter).toHaveBeenCalledWith('user@example.com')
      })
    })

    it('should show DOI pending confirmation message after successful submission', async () => {
      mockSubscribeNewsletter.mockResolvedValueOnce({ success: true })

      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(screen.getByTestId('newsletter-success')).toBeInTheDocument()
      })

      // Form should be hidden
      expect(screen.queryByPlaceholderText('Enter your email')).not.toBeInTheDocument()
    })

    it('should show CMS pending confirmation message text in success state', async () => {
      mockSubscribeNewsletter.mockResolvedValueOnce({ success: true })

      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(screen.getByTestId('newsletter-success')).toHaveTextContent(
          'Check your email to confirm your subscription.'
        )
      })
    })

    it('should show success state with role="status" for accessibility', async () => {
      mockSubscribeNewsletter.mockResolvedValueOnce({ success: true })

      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    it('should show CMS error message when API returns null', async () => {
      mockSubscribeNewsletter.mockResolvedValueOnce(null)

      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(screen.getByTestId('submit-error')).toHaveTextContent('Something went wrong. Please try again.')
      })
    })

    it('should show CMS error message when API returns success=false', async () => {
      mockSubscribeNewsletter.mockResolvedValueOnce({ success: false })

      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(screen.getByTestId('submit-error')).toHaveTextContent('Something went wrong. Please try again.')
      })
    })

    it('should disable input during submission', async () => {
      // Make the promise hang to check loading state
      let resolvePromise: (value: unknown) => void
      mockSubscribeNewsletter.mockReturnValueOnce(
        new Promise(resolve => {
          resolvePromise = resolve
        })
      )

      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(emailInput).toBeDisabled()
      })

      // Resolve to clean up
      resolvePromise!({ success: true })

      await waitFor(() => {
        expect(screen.getByTestId('newsletter-success')).toBeInTheDocument()
      })
    })

    it('should clear submit error on new submission attempt', async () => {
      // First attempt fails
      mockSubscribeNewsletter.mockResolvedValueOnce(null)

      render(<NewsletterSignupCTA direction={DirectionEnum.LTR} data={mockSectionData} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      const checkbox = screen.getByTestId('consent-checkbox')
      fireEvent.click(checkbox)

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(screen.getByTestId('submit-error')).toBeInTheDocument()
      })

      // Second attempt - error should be cleared when form submits
      mockSubscribeNewsletter.mockResolvedValueOnce({ success: true })
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(screen.queryByTestId('submit-error')).not.toBeInTheDocument()
      })
    })
  })
})
