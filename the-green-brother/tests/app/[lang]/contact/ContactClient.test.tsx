// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ContactClient component
 */

import { render, screen } from '@testing-library/react'

import ContactClient from '@/app/[lang]/contact/ContactClient'
import type { ApiContactUsContactUsDocument } from '@/lib/generated/types.gen'

describe('ContactClient', () => {
  it('should render with default title when contactData is null', () => {
    render(<ContactClient contactData={null} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Contact & Support')
  })

  it('should render title from CMS data', () => {
    const contactData = {
      title: 'Get In Touch',
    } as ApiContactUsContactUsDocument

    render(<ContactClient contactData={contactData} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Get In Touch')
  })

  it('should render subtitle when available', () => {
    const contactData = {
      title: 'Contact Us',
      subtitle: 'We would love to hear from you',
    } as ApiContactUsContactUsDocument

    render(<ContactClient contactData={contactData} />)

    expect(screen.getByText('We would love to hear from you')).toBeInTheDocument()
  })

  it('should not render subtitle when not available', () => {
    const contactData = {
      title: 'Contact Us',
    } as ApiContactUsContactUsDocument

    render(<ContactClient contactData={contactData} />)

    expect(screen.queryByText('We would love to hear from you')).not.toBeInTheDocument()
  })

  it('should render contact form placeholder', () => {
    render(<ContactClient contactData={null} />)

    expect(screen.getByText('Contact form with CMS labels')).toBeInTheDocument()
  })
})
