// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Navigation component
 */

import { render, screen } from '@testing-library/react'
import { Navigation } from '@/components/Navigation'
import { usePathname } from 'next/navigation'

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

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('logo', () => {
    it('should render Affilibuster logo', () => {
      usePathname.mockReturnValue('/')

      render(<Navigation />)

      expect(screen.getByText('Affilibuster')).toBeInTheDocument()
    })

    it('should link logo to root for English', () => {
      usePathname.mockReturnValue('/products')

      render(<Navigation />)

      const logo = screen.getByText('Affilibuster')
      expect(logo).toHaveAttribute('href', '/')
    })

    it('should link logo to Italian root', () => {
      usePathname.mockReturnValue('/it/products')

      render(<Navigation />)

      const logo = screen.getByText('Affilibuster')
      expect(logo).toHaveAttribute('href', '/it')
    })

    it('should link logo to Hebrew root', () => {
      usePathname.mockReturnValue('/he/about')

      render(<Navigation />)

      const logo = screen.getByText('Affilibuster')
      expect(logo).toHaveAttribute('href', '/he')
    })
  })

  describe('navigation links', () => {
    it('should render all navigation links', () => {
      usePathname.mockReturnValue('/')

      render(<Navigation />)

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
    })

    it('should render links without prefix for English', () => {
      usePathname.mockReturnValue('/products')

      render(<Navigation />)

      const homeLink = screen.getByText('Home')
      const productsLink = screen.getByText('Products')
      const aboutLink = screen.getByText('About')

      expect(homeLink).toHaveAttribute('href', '/')
      expect(productsLink).toHaveAttribute('href', '/products')
      expect(aboutLink).toHaveAttribute('href', '/about')
    })

    it('should render links with Italian prefix', () => {
      usePathname.mockReturnValue('/it/about')

      render(<Navigation />)

      const homeLink = screen.getByText('Home')
      const productsLink = screen.getByText('Products')
      const aboutLink = screen.getByText('About')

      expect(homeLink).toHaveAttribute('href', '/it')
      expect(productsLink).toHaveAttribute('href', '/it/products')
      expect(aboutLink).toHaveAttribute('href', '/it/about')
    })

    it('should render links with Hebrew prefix', () => {
      usePathname.mockReturnValue('/he/products')

      render(<Navigation />)

      const homeLink = screen.getByText('Home')
      expect(homeLink).toHaveAttribute('href', '/he')
    })
  })

  describe('active link styling', () => {
    it('should highlight active link on home page', () => {
      usePathname.mockReturnValue('/')

      render(<Navigation />)

      const homeLink = screen.getByText('Home')
      expect(homeLink).toHaveClass('text-white')
    })

    it('should highlight active link on products page', () => {
      usePathname.mockReturnValue('/products')

      render(<Navigation />)

      const productsLink = screen.getByText('Products')
      expect(productsLink).toHaveClass('text-white')
    })

    it('should highlight active link on Italian about page', () => {
      usePathname.mockReturnValue('/it/about')

      render(<Navigation />)

      const aboutLink = screen.getByText('About')
      expect(aboutLink).toHaveClass('text-white')
    })

    it('should not highlight inactive links', () => {
      usePathname.mockReturnValue('/products')

      render(<Navigation />)

      const homeLink = screen.getByText('Home')
      const aboutLink = screen.getByText('About')

      expect(homeLink).not.toHaveClass('text-white')
      expect(aboutLink).not.toHaveClass('text-white')
    })
  })

  describe('child components', () => {
    it('should render LanguageSwitcher', () => {
      usePathname.mockReturnValue('/')

      render(<Navigation />)

      expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
    })

    it('should render CurrencySelector', () => {
      usePathname.mockReturnValue('/')

      render(<Navigation />)

      expect(screen.getByTestId('currency-selector')).toBeInTheDocument()
    })
  })

  describe('mobile menu button', () => {
    it('should render mobile menu button', () => {
      usePathname.mockReturnValue('/')

      render(<Navigation />)

      const mobileButton = screen.getByLabelText('Open menu')
      expect(mobileButton).toBeInTheDocument()
    })

    it('should have proper aria-label', () => {
      usePathname.mockReturnValue('/')

      render(<Navigation />)

      const mobileButton = screen.getByLabelText('Open menu')
      expect(mobileButton).toHaveAttribute('aria-label', 'Open menu')
    })

    it('should contain hamburger icon', () => {
      usePathname.mockReturnValue('/')

      render(<Navigation />)

      const button = screen.getByLabelText('Open menu')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should have nav tag', () => {
      usePathname.mockReturnValue('/')

      const { container } = render(<Navigation />)

      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })

    it('should have primary background', () => {
      usePathname.mockReturnValue('/')

      const { container } = render(<Navigation />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('bg-primary-800')
      expect(nav).toHaveClass('text-white')
    })

    it('should have shadow styling', () => {
      usePathname.mockReturnValue('/')

      const { container } = render(<Navigation />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('shadow-lg')
    })
  })
})
