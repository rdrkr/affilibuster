// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for ConsentGate component.
 *
 * Verifies conditional rendering of children based on consent category.
 */

import { render, screen } from '@testing-library/react'

import ConsentGate from '@/components/consent/ConsentGate'
import * as consentLib from '@/lib/consent'

// Mock the consent library
jest.mock('@/lib/consent', () => ({
  useConsent: jest.fn(),
}))

const mockUseConsent = consentLib.useConsent as jest.MockedFunction<typeof consentLib.useConsent>

/**
 * Helper to create mock useConsent return value.
 * @param acceptedCategories - The categories the user has accepted
 * @returns Mock UseConsentReturn object
 */
function createMockConsent(acceptedCategories: string[]): consentLib.UseConsentReturn {
  return {
    hasConsented: acceptedCategories.length > 0,
    acceptedCategories,
    isSettingsOpen: false,
    isDoNotTrackEnabled: false,
    acceptAll: jest.fn(),
    rejectAll: jest.fn(),
    saveCustom: jest.fn(),
    openSettings: jest.fn(),
    closeSettings: jest.fn(),
  }
}

describe('ConsentGate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render children when category is accepted', () => {
    mockUseConsent.mockReturnValue(createMockConsent(['analytics', 'marketing']))

    render(
      <ConsentGate category="analytics">
        <div data-testid="child">Analytics Script</div>
      </ConsentGate>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should return null when category is not accepted', () => {
    mockUseConsent.mockReturnValue(createMockConsent(['necessary']))

    const { container } = render(
      <ConsentGate category="analytics">
        <div data-testid="child">Analytics Script</div>
      </ConsentGate>
    )

    expect(container.innerHTML).toBe('')
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
  })

  it('should return null when no consent given (empty categories)', () => {
    mockUseConsent.mockReturnValue(createMockConsent([]))

    const { container } = render(
      <ConsentGate category="analytics">
        <div data-testid="child">Analytics Script</div>
      </ConsentGate>
    )

    expect(container.innerHTML).toBe('')
  })

  it('should work with marketing category', () => {
    mockUseConsent.mockReturnValue(createMockConsent(['necessary', 'marketing']))

    render(
      <ConsentGate category="marketing">
        <div data-testid="marketing-child">Marketing Pixel</div>
      </ConsentGate>
    )

    expect(screen.getByTestId('marketing-child')).toBeInTheDocument()
  })

  it('should not render marketing children when only analytics is accepted', () => {
    mockUseConsent.mockReturnValue(createMockConsent(['necessary', 'analytics']))

    const { container } = render(
      <ConsentGate category="marketing">
        <div data-testid="marketing-child">Marketing Pixel</div>
      </ConsentGate>
    )

    expect(container.innerHTML).toBe('')
  })
})
