// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for CookieSettingsAction component.
 *
 * Verifies that the component renders via ButtonAction with
 * the correct props and dispatches the openCookieSettings event on click.
 */

import { fireEvent, render, screen } from '@testing-library/react'

import CookieSettingsAction from '@/components/consent/CookieSettingsAction'
import * as consentLib from '@/lib/consent'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

jest.mock('@/lib/consent', () => ({
  openCookieSettings: jest.fn(),
}))

jest.mock('@/components/elements', () => ({
  ButtonAction: function MockButtonAction({
    data,
    onClick,
    variant,
    size,
  }: {
    data: { label?: { text?: string } }
    onClick: () => void
    variant: string
    size: string
  }) {
    return (
      <button onClick={onClick} data-variant={variant} data-size={size}>
        {data.label?.text}
      </button>
    )
  },
}))

const mockOpenCookieSettings = consentLib.openCookieSettings as jest.MockedFunction<
  typeof consentLib.openCookieSettings
>

/** Mock CMS button data. */
const mockButtonData = {
  url: '#cookie-settings',
  openInNewTab: false,
  label: {
    text: 'Cookie Settings',
    iconPosition: IconPositionEnum.BEFORE_TEXT,
    ariaDescription: 'Open cookie settings',
  },
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('CookieSettingsAction', () => {
  it('should render with the provided button data', () => {
    render(<CookieSettingsAction data={mockButtonData} direction={DirectionEnum.LTR} />)

    expect(screen.getByText('Cookie Settings')).toBeInTheDocument()
  })

  it('should call openCookieSettings when clicked', () => {
    render(<CookieSettingsAction data={mockButtonData} direction={DirectionEnum.LTR} />)

    fireEvent.click(screen.getByText('Cookie Settings'))

    expect(mockOpenCookieSettings).toHaveBeenCalledTimes(1)
  })

  it('should use link-2 variant by default', () => {
    render(<CookieSettingsAction data={mockButtonData} direction={DirectionEnum.LTR} />)

    const button = screen.getByText('Cookie Settings')
    expect(button).toHaveAttribute('data-variant', 'link-2')
  })

  it('should use xs size by default', () => {
    render(<CookieSettingsAction data={mockButtonData} direction={DirectionEnum.LTR} />)

    const button = screen.getByText('Cookie Settings')
    expect(button).toHaveAttribute('data-size', 'xs')
  })

  it('should accept custom variant', () => {
    render(<CookieSettingsAction data={mockButtonData} direction={DirectionEnum.LTR} variant="primary" />)

    const button = screen.getByText('Cookie Settings')
    expect(button).toHaveAttribute('data-variant', 'primary')
  })

  it('should accept custom size', () => {
    render(<CookieSettingsAction data={mockButtonData} direction={DirectionEnum.LTR} size="md" />)

    const button = screen.getByText('Cookie Settings')
    expect(button).toHaveAttribute('data-size', 'md')
  })

  it('should support RTL direction', () => {
    render(<CookieSettingsAction data={mockButtonData} direction={DirectionEnum.RTL} />)

    expect(screen.getByText('Cookie Settings')).toBeInTheDocument()
  })
})
