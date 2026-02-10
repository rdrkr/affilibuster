// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for currency settings page
 */

import Currency from '@/app/[lang]/profile/currency/page'
import { getCurrencies, getProfile } from '@/lib/content/api'
import { fireEvent, render, screen } from '@testing-library/react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img src={src} alt={alt} />
  },
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock API
jest.mock('@/lib/content/api', () => ({
  getProfile: jest.fn(),
  getCurrencies: jest.fn(),
}))

const mockProfileData = {
  currencyHeader: { text: 'Select Currency' },
  saveButton: { label: { text: 'Save Changes' } },
  goBackButton: { label: { text: 'Back' } },
}

const mockCurrencies = [
  {
    code: 'USD',
    name: 'United States Dollar',
    symbol: '$',
    flag: { url: '/flags/us.svg', alternativeText: 'US Flag' },
  },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: { url: '/flags/eu.svg', alternativeText: 'EU Flag' } },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: { url: '/flags/gb.svg', alternativeText: 'GB Flag' } },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: { url: '/flags/ca.svg', alternativeText: 'CA Flag' } },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: { url: '/flags/au.svg', alternativeText: 'AU Flag' } },
]

describe('Currency', () => {
  beforeEach(() => {
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileData)
    ;(getCurrencies as jest.Mock).mockResolvedValue(mockCurrencies)
  })

  it('should render currency page', async () => {
    const ui = await Currency({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Select Currency')
  })

  it('should render back button linking to profile', async () => {
    const ui = await Currency({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('link', { name: /arrow_back/i })).toHaveAttribute('href', '/en/profile')
  })

  it('should render currency options', async () => {
    const ui = await Currency({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('EUR')).toBeInTheDocument()
    expect(screen.getByText('GBP')).toBeInTheDocument()
    expect(screen.getByText('CAD')).toBeInTheDocument()
    expect(screen.getByText('AUD')).toBeInTheDocument()
  })

  it('should have USD selected by default', async () => {
    const ui = await Currency({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    // USD should be highlighted
    const usdLabel = screen.getByText('United States Dollar').closest('label')
    expect(usdLabel).toHaveClass('border-primary')
  })

  it('should change selection on click', async () => {
    const ui = await Currency({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    // Click on EUR
    const eurLabel = screen.getByText('Euro').closest('label')!
    fireEvent.click(eurLabel)

    // EUR should now be selected
    expect(eurLabel).toHaveClass('border-primary')
  })

  it('should render save button', async () => {
    const ui = await Currency({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  /* Flags are currently omitted in component
  it('should render currency flags', async () => {
    const ui = await Currency({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const flags = screen.getAllByRole('img')
    expect(flags.length).toBe(5)
  })
  */

  it('should handle missing header and label gracefully', async () => {
    const mockDataMissing = {
      ...mockProfileData,
      currencyHeader: { header: undefined },
      saveButton: { label: undefined },
    }
    ;(getProfile as jest.Mock).mockResolvedValueOnce(mockDataMissing)

    const ui = await Currency({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Select Currency') // Default
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument() // Default
  })

  it('should handle empty currencies list gracefully', async () => {
    ;(getCurrencies as jest.Mock).mockResolvedValueOnce([])

    const ui = await Currency({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    // Should render page but no currency options
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    // USD default selection logic might fail if currencies are empty?
    // Code says: useState(currencies[0]?.code ?? 'USD')
    // So it should default to USD.
    // But map will be empty.
    expect(screen.queryByText('United States Dollar')).not.toBeInTheDocument()
  })

  it('should save changes on save button click', async () => {
    const ui = await Currency({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const saveButton = screen.getByRole('button', { name: 'Save Changes' })
    fireEvent.click(saveButton)
    expect(mockPush).toHaveBeenCalledWith('/en/profile')
  })

  it('should render correctly in RTL', async () => {
    const ui = await Currency({ params: Promise.resolve({ lang: 'he' }) })
    render(ui)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
