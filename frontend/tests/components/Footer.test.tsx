// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Footer component
 */

import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/Footer'
import { usePathname } from 'next/navigation'
import { createMockFooter } from '../helpers/mockFactories'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

describe('Footer', () => {
  const mockFooterData = createMockFooter({
    copyrightText: '© 2025 Affilibuster. All rights reserved.',
    privacyPolicyLabel: 'Privacy Policy',
    termsOfServiceLabel: 'Terms of Service',
    contactLabel: 'Contact',
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue('/en')
  })

  describe('null data handling', () => {
    it('should return null when footerData is null', () => {
      const { container } = render(<Footer data={null} lang="en" />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('language-aware links', () => {
    it('should render links with English prefix', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en')

      render(<Footer data={mockFooterData} lang="en" />)

      const privacyLink = screen.getByText('Privacy Policy')
      expect(privacyLink).toHaveAttribute('href', '/en/privacy')
    })

    it('should render links with Italian prefix for /it path', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/it/products')

      render(<Footer data={mockFooterData} lang="it" />)

      const privacyLink = screen.getByText('Privacy Policy')
      expect(privacyLink).toHaveAttribute('href', '/it/privacy')
    })

    it('should render links with Hebrew prefix for /he path', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/he/about')

      render(<Footer data={mockFooterData} lang="he" />)

      const termsLink = screen.getByText('Terms of Service')
      expect(termsLink).toHaveAttribute('href', '/he/terms')
    })

    it('should render all footer links', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Footer data={mockFooterData} lang="en" />)

      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })
  })

  describe('content sections', () => {
    it('should render About section', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      const { container } = render(<Footer data={mockFooterData} lang="en" />)

      // Check for logo SVG (brand name text was removed per CMS centralization)
      const logoSvg = container.querySelector('svg.text-secondary-400')
      expect(logoSvg).toBeInTheDocument()
      expect(screen.getByText(/Your trusted source for product recommendations/i)).toBeInTheDocument()
    })

    it('should render Quick Links section', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Footer data={mockFooterData} lang="en" />)

      expect(screen.getByText('Quick Links')).toBeInTheDocument()
    })

    it('should render Subscribe to Newsletter section', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Footer data={mockFooterData} lang="en" />)

      expect(screen.getByText('Subscribe to Newsletter')).toBeInTheDocument()
    })
  })

  describe('social links', () => {
    it('should render Twitter link with correct attributes', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Footer data={mockFooterData} lang="en" />)

      const twitterLink = screen.getByLabelText('Follow us on Twitter')
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com')
      expect(twitterLink).toHaveAttribute('target', '_blank')
      expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render Facebook link with correct attributes', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Footer data={mockFooterData} lang="en" />)

      const facebookLink = screen.getByLabelText('Follow us on Facebook')
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com')
      expect(facebookLink).toHaveAttribute('target', '_blank')
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render social link icons', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      const { container } = render(<Footer data={mockFooterData} lang="en" />)

      // Check for SVG icons
      const svgIcons = container.querySelectorAll('svg')
      expect(svgIcons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('copyright', () => {
    it('should display current year', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Footer data={mockFooterData} lang="en" />)

      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`© ${currentYear.toString()} Affilibuster`))).toBeInTheDocument()
    })

    it('should display "All rights reserved"', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Footer data={mockFooterData} lang="en" />)

      expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should have footer tag', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      const { container } = render(<Footer data={mockFooterData} lang="en" />)

      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('should have primary background styling', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      const { container } = render(<Footer data={mockFooterData} lang="en" />)

      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('bg-primary-900')
      expect(footer).toHaveClass('text-white')
    })

    it('should have mt-auto styling', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      const { container } = render(<Footer data={mockFooterData} lang="en" />)

      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('mt-auto')
    })
  })

  describe('link behavior', () => {
    it('should generate correct contact link for English', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en/products')

      render(<Footer data={mockFooterData} lang="en" />)

      const contactLink = screen.getByText('Contact')
      // English now uses /en prefix
      expect(contactLink).toHaveAttribute('href', '/en/contact')
    })

    it('should generate correct privacy link for Italian', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/it')

      render(<Footer data={mockFooterData} lang="it" />)

      const privacyLink = screen.getByText('Privacy Policy')
      expect(privacyLink).toHaveAttribute('href', '/it/privacy')
    })

    it('should generate correct terms link for Hebrew', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/he/products')

      render(<Footer data={mockFooterData} lang="he" />)

      const termsLink = screen.getByText('Terms of Service')
      expect(termsLink).toHaveAttribute('href', '/he/terms')
    })
  })
})
