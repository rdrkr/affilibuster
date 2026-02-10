// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for contact page server component
 */

// Mock the client module
jest.mock('@/lib/content', () => ({
  getContactUs: jest.fn(),
}))

// Mock the ContactClient component
jest.mock('@/app/[lang]/contact/ContactClient', () => ({
  __esModule: true,
  default: function MockContactClient({ contactData }: { contactData: unknown }) {
    return <div data-testid="contact-client" data-has-data={contactData ? 'true' : 'false'} />
  },
}))

import ContactPage from '@/app/[lang]/contact/page'
import { getContactUs } from '@/lib/content'
import { LanguageCode } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const mockGetContactUs = getContactUs as jest.MockedFunction<typeof getContactUs>

describe('ContactPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch contact data and pass to ContactClient', async () => {
    const mockContactData = { title: 'Contact Us', subtitle: 'Get in touch' }
    mockGetContactUs.mockResolvedValue(mockContactData as Awaited<ReturnType<typeof getContactUs>>)

    const Component = await ContactPage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(mockGetContactUs).toHaveBeenCalledWith(LanguageCode.EN)
    expect(screen.getByTestId('contact-client')).toBeInTheDocument()
    expect(screen.getByTestId('contact-client').getAttribute('data-has-data')).toBe('true')
  })

  it('should pass null when contact data is not available', async () => {
    mockGetContactUs.mockResolvedValue(null)

    const Component = await ContactPage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(screen.getByTestId('contact-client').getAttribute('data-has-data')).toBe('false')
  })

  it('should work with Italian locale', async () => {
    mockGetContactUs.mockResolvedValue({ title: 'Contattaci' } as Awaited<ReturnType<typeof getContactUs>>)

    await ContactPage({ params: Promise.resolve({ lang: LanguageCode.IT }) })

    expect(mockGetContactUs).toHaveBeenCalledWith(LanguageCode.IT)
  })
})
