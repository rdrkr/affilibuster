// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ContactClient component
 */

import { screen } from '@testing-library/react'
import { renderWithLayout } from '../../../utils/renderWithLayout'

import ContactClient from '@/app/[lang]/contact/ContactClient'
import type { ApiContactUsContactUsDocument } from '@/lib/generated/types.gen'

describe('ContactClient', () => {
  it('should render with default title when contactData is null', () => {
    renderWithLayout(<ContactClient contactData={null} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Contact & Support')
  })

  it('should render title from CMS data', () => {
    const contactData = {
      title: 'Get In Touch',
    } as ApiContactUsContactUsDocument

    renderWithLayout(<ContactClient contactData={contactData} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Get In Touch')
  })

  it('should render subtitle when available', () => {
    const contactData = {
      title: 'Contact Us',
      subtitle: 'We would love to hear from you',
    } as ApiContactUsContactUsDocument

    renderWithLayout(<ContactClient contactData={contactData} />)

    expect(screen.getByText('We would love to hear from you')).toBeInTheDocument()
  })

  it('should not render subtitle when not available', () => {
    const contactData = {
      title: 'Contact Us',
    } as ApiContactUsContactUsDocument

    renderWithLayout(<ContactClient contactData={contactData} />)

    expect(screen.queryByText('We would love to hear from you')).not.toBeInTheDocument()
  })

  it('should render contact form placeholder', () => {
    renderWithLayout(<ContactClient contactData={null} />)

    expect(screen.getByText('Contact form with CMS labels')).toBeInTheDocument()
  })
})
