// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for CookieSettingsButton component.
 *
 * Verifies that the button renders with CMS label text and
 * dispatches the custom DOM event to open cookie settings.
 */

import { fireEvent, render, screen } from '@testing-library/react'

import CookieSettingsButton from '@/components/consent/CookieSettingsButton'
import * as consentLib from '@/lib/consent'

jest.mock('@/lib/consent', () => ({
  openCookieSettings: jest.fn(),
}))

const mockOpenCookieSettings = consentLib.openCookieSettings as jest.MockedFunction<
  typeof consentLib.openCookieSettings
>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('CookieSettingsButton', () => {
  it('should render with the provided label text', () => {
    render(<CookieSettingsButton label="Cookie Settings" />)

    expect(screen.getByText('Cookie Settings')).toBeInTheDocument()
  })

  it('should render as a button element', () => {
    render(<CookieSettingsButton label="Cookie Settings" />)

    expect(screen.getByRole('button', { name: 'Cookie Settings' })).toBeInTheDocument()
  })

  it('should call openCookieSettings when clicked', () => {
    render(<CookieSettingsButton label="Cookie Settings" />)

    fireEvent.click(screen.getByText('Cookie Settings'))

    expect(mockOpenCookieSettings).toHaveBeenCalledTimes(1)
  })

  it('should render with different label text', () => {
    render(<CookieSettingsButton label="Impostazioni Cookie" />)

    expect(screen.getByText('Impostazioni Cookie')).toBeInTheDocument()
  })

  it('should handle empty label gracefully', () => {
    render(<CookieSettingsButton label="" />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button.textContent).toBe('')
  })
})
