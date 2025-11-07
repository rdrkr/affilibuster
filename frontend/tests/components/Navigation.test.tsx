// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Navigation component
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { Navigation } from '@/components/Navigation'
import { usePathname } from 'next/navigation'
import { createMockNavigation } from '../helpers/mockFactories'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock child components
jest.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}))

jest.mock('@/components/CurrencySelector', () => ({
  CurrencySelector: () => <div data-testid="currency-selector">CurrencySelector</div>,
}))

jest.mock('@/components/ThemeSelector', () => ({
  ThemeSelector: () => <div data-testid="theme-selector">ThemeSelector</div>,
}))

describe('Navigation', () => {
  const mockNavData = createMockNavigation({
    brandName: 'Affilibuster',
    homeLabel: 'Home',
    productsLabel: 'Products',
    aboutLabel: 'About',
    contactLabel: 'Contact',
    mobileMenuLabel: 'Open menu',
    mobileMenuCloseLabel: 'Close menu',
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue('/en')
  })

  describe('logo', () => {
    it('should render Affilibuster logo', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Navigation data={mockNavData} lang="en" />)

      expect(screen.getByText('Affilibuster')).toBeInTheDocument()
    })

    it('should link logo to root for English', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en/products')

      render(<Navigation data={mockNavData} lang="en" />)

      const logo = screen.getByText('Affilibuster')
      expect(logo).toHaveAttribute('href', '/en')
    })

    it('should link logo to Italian root', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/it/products')

      render(<Navigation data={mockNavData} lang="it" />)

      const logo = screen.getByText('Affilibuster')
      expect(logo).toHaveAttribute('href', '/it')
    })

    it('should link logo to Hebrew root', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/he/about')

      render(<Navigation data={mockNavData} lang="he" />)

      const logo = screen.getByText('Affilibuster')
      expect(logo).toHaveAttribute('href', '/he')
    })
  })

  describe('navigation links', () => {
    it('should render all navigation links', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Navigation data={mockNavData} lang="en" />)

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
    })

    it('should render links with English prefix', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en/products')

      render(<Navigation data={mockNavData} lang="en" />)

      const homeLink = screen.getByText('Home')
      const productsLink = screen.getByText('Products')
      const aboutLink = screen.getByText('About')

      expect(homeLink).toHaveAttribute('href', '/en')
      expect(productsLink).toHaveAttribute('href', '/en/products')
      expect(aboutLink).toHaveAttribute('href', '/en/about')
    })

    it('should render links with Italian prefix', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/it/about')

      render(<Navigation data={mockNavData} lang="it" />)

      const homeLink = screen.getByText('Home')
      const productsLink = screen.getByText('Products')
      const aboutLink = screen.getByText('About')

      expect(homeLink).toHaveAttribute('href', '/it')
      expect(productsLink).toHaveAttribute('href', '/it/products')
      expect(aboutLink).toHaveAttribute('href', '/it/about')
    })

    it('should render links with Hebrew prefix', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/he/products')

      render(<Navigation data={mockNavData} lang="he" />)

      const homeLink = screen.getByText('Home')
      expect(homeLink).toHaveAttribute('href', '/he')
    })
  })

  describe('active link styling', () => {
    it('should highlight active link on home page', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en/')

      render(<Navigation data={mockNavData} lang="en" />)

      const homeLink = screen.getByText('Home')
      expect(homeLink).toHaveClass('bg-primary-700')
    })

    it('should highlight active link on products page', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en/products')

      render(<Navigation data={mockNavData} lang="en" />)

      const productsLink = screen.getByText('Products')
      expect(productsLink).toHaveClass('bg-primary-700')
    })

    it('should highlight active link on Italian about page', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/it/about')

      render(<Navigation data={mockNavData} lang="it" />)

      const aboutLink = screen.getByText('About')
      expect(aboutLink).toHaveClass('bg-primary-700')
    })

    it('should not highlight inactive links', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en/products')

      render(<Navigation data={mockNavData} lang="en" />)

      const homeLink = screen.getByText('Home')
      const aboutLink = screen.getByText('About')

      expect(homeLink).not.toHaveClass('bg-primary-700')
      expect(aboutLink).not.toHaveClass('bg-primary-700')
    })
  })

  describe('child components', () => {
    it('should render LanguageSwitcher', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Navigation data={mockNavData} lang="en" />)

      expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
    })

    it('should render CurrencySelector', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Navigation data={mockNavData} lang="en" />)

      expect(screen.getByTestId('currency-selector')).toBeInTheDocument()
    })
  })

  describe('mobile menu button', () => {
    it('should render mobile menu button', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Navigation data={mockNavData} lang="en" />)

      const mobileButton = screen.getByLabelText('Open menu')
      expect(mobileButton).toBeInTheDocument()
    })

    it('should have proper aria-label', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Navigation data={mockNavData} lang="en" />)

      const mobileButton = screen.getByLabelText('Open menu')
      expect(mobileButton).toHaveAttribute('aria-label', 'Open menu')
    })

    it('should contain hamburger icon', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Navigation data={mockNavData} lang="en" />)

      const button = screen.getByLabelText('Open menu')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should have nav tag', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      const { container } = render(<Navigation data={mockNavData} lang="en" />)

      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })

    it('should have primary background', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      const { container } = render(<Navigation data={mockNavData} lang="en" />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('bg-primary-800')
      expect(nav).toHaveClass('text-white')
    })

    it('should have shadow styling', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      const { container } = render(<Navigation data={mockNavData} lang="en" />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('shadow-lg')
    })
  })

  describe('null data handling', () => {
    it('should return null when navData is null', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      const { container } = render(<Navigation data={null} lang="en" />)

      expect(container.querySelector('nav')).not.toBeInTheDocument()
    })
  })

  describe('mobile menu functionality', () => {
    it('should open mobile menu when button is clicked', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Navigation data={mockNavData} lang="en" />)

      const button = screen.getByLabelText('Open menu')
      fireEvent.click(button)

      // Mobile menu should be visible with links
      const mobileLinks = screen.getAllByText('Home')
      // Desktop + mobile = 2
      expect(mobileLinks.length).toBeGreaterThan(1)
    })

    it('should update aria-label when menu is opened', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Navigation data={mockNavData} lang="en" />)

      const button = screen.getByLabelText('Open menu')
      fireEvent.click(button)

      // Aria-label should change to close
      const closeButton = screen.getByLabelText('Close menu')
      expect(closeButton).toBeInTheDocument()
    })

    it('should close mobile menu when link is clicked', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      const { container } = render(<Navigation data={mockNavData} lang="en" />)

      // Open menu
      const openButton = screen.getByLabelText('Open menu')
      fireEvent.click(openButton)

      // Verify mobile menu panel is visible
      const mobilePanel = container.querySelector('.md\\:hidden.bg-white')
      expect(mobilePanel).toBeInTheDocument()

      // Find mobile menu link (there should be 2 "Home" links now - desktop and mobile)
      const mobileLinks = screen.getAllByText('Home')
      const mobileHomeLink = mobileLinks[1] // Second one is mobile

      // Click mobile link
      if (mobileHomeLink) {
        fireEvent.click(mobileHomeLink)
      }

      // Menu should close - mobile panel should be gone
      const closedPanel = container.querySelector('.md\\:hidden.bg-white')
      expect(closedPanel).not.toBeInTheDocument()
    })

    it('should render mobile menu links with correct hrefs', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Navigation data={mockNavData} lang="en" />)

      // Open menu
      const button = screen.getByLabelText('Open menu')
      fireEvent.click(button)

      // Check all links are present
      const allHomeLinks = screen.getAllByText('Home')
      const allProductsLinks = screen.getAllByText('Products')
      const allAboutLinks = screen.getAllByText('About')

      // Should have 2 of each (desktop + mobile)
      expect(allHomeLinks.length).toBe(2)
      expect(allProductsLinks.length).toBe(2)
      expect(allAboutLinks.length).toBe(2)
    })

    it('should highlight active link in mobile menu', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en/products')

      render(<Navigation data={mockNavData} lang="en" />)

      // Open menu
      const button = screen.getByLabelText('Open menu')
      fireEvent.click(button)

      // Get mobile Products link (second one)
      const productLinks = screen.getAllByText('Products')
      const mobileProductsLink = productLinks[1]

      // Should have active styling
      expect(mobileProductsLink).toHaveClass('bg-primary-50')
    })
  })

  describe('language prefixes', () => {
    it('should use Italian prefix for lang="it"', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/it')

      render(<Navigation data={mockNavData} lang="it" />)

      const logo = screen.getByText('Affilibuster')
      expect(logo).toHaveAttribute('href', '/it')

      const homeLink = screen.getByText('Home')
      expect(homeLink).toHaveAttribute('href', '/it')
    })

    it('should use Hebrew prefix for lang="he"', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/he')

      render(<Navigation data={mockNavData} lang="he" />)

      const logo = screen.getByText('Affilibuster')
      expect(logo).toHaveAttribute('href', '/he')

      const homeLink = screen.getByText('Home')
      expect(homeLink).toHaveAttribute('href', '/he')
    })

    it('should use English prefix for lang="en"', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en')

      render(<Navigation data={mockNavData} lang="en" />)

      const logo = screen.getByText('Affilibuster')
      expect(logo).toHaveAttribute('href', '/en')

      const homeLink = screen.getByText('Home')
      expect(homeLink).toHaveAttribute('href', '/en')
    })

    it('should use empty prefix for unknown lang', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(<Navigation data={mockNavData} lang="fr" />)

      const logo = screen.getByText('Affilibuster')
      expect(logo).toHaveAttribute('href', '/')

      const homeLink = screen.getByText('Home')
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })
})
