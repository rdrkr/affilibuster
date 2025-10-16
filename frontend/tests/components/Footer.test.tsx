// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Footer component
 */

import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const { usePathname } = require('next/navigation');

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('language-aware links', () => {
    it('should render links without language prefix for root path', () => {
      usePathname.mockReturnValue('/');

      render(<Footer />);

      const privacyLink = screen.getByText('Privacy Policy');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('should render links with Italian prefix for /it path', () => {
      usePathname.mockReturnValue('/it/products');

      render(<Footer />);

      const privacyLink = screen.getByText('Privacy Policy');
      expect(privacyLink).toHaveAttribute('href', '/it/privacy');
    });

    it('should render links with Hebrew prefix for /he path', () => {
      usePathname.mockReturnValue('/he/about');

      render(<Footer />);

      const termsLink = screen.getByText('Terms of Service');
      expect(termsLink).toHaveAttribute('href', '/he/terms');
    });

    it('should render all footer links', () => {
      usePathname.mockReturnValue('/');

      render(<Footer />);

      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });

  describe('content sections', () => {
    it('should render About section', () => {
      usePathname.mockReturnValue('/');

      render(<Footer />);

      expect(screen.getByText('Affilibuster')).toBeInTheDocument();
      expect(
        screen.getByText(/Multi-language affiliate platform/i)
      ).toBeInTheDocument();
    });

    it('should render Quick Links section', () => {
      usePathname.mockReturnValue('/');

      render(<Footer />);

      expect(screen.getByText('Quick Links')).toBeInTheDocument();
    });

    it('should render Stay Updated section', () => {
      usePathname.mockReturnValue('/');

      render(<Footer />);

      expect(screen.getByText('Stay Updated')).toBeInTheDocument();
    });
  });

  describe('social links', () => {
    it('should render Twitter link with correct attributes', () => {
      usePathname.mockReturnValue('/');

      render(<Footer />);

      const twitterLink = screen.getByLabelText('Twitter');
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com');
      expect(twitterLink).toHaveAttribute('target', '_blank');
      expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render Facebook link with correct attributes', () => {
      usePathname.mockReturnValue('/');

      render(<Footer />);

      const facebookLink = screen.getByLabelText('Facebook');
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com');
      expect(facebookLink).toHaveAttribute('target', '_blank');
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render social link icons', () => {
      usePathname.mockReturnValue('/');

      const { container } = render(<Footer />);

      // Check for SVG icons
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('copyright', () => {
    it('should display current year', () => {
      usePathname.mockReturnValue('/');

      render(<Footer />);

      const currentYear = new Date().getFullYear();
      expect(
        screen.getByText(new RegExp(`© ${currentYear} Affilibuster`))
      ).toBeInTheDocument();
    });

    it('should display "All rights reserved"', () => {
      usePathname.mockReturnValue('/');

      render(<Footer />);

      expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have footer tag', () => {
      usePathname.mockReturnValue('/');

      const { container } = render(<Footer />);

      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should have primary background styling', () => {
      usePathname.mockReturnValue('/');

      const { container } = render(<Footer />);

      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-primary-900');
      expect(footer).toHaveClass('text-white');
    });

    it('should have mt-auto styling', () => {
      usePathname.mockReturnValue('/');

      const { container } = render(<Footer />);

      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('mt-auto');
    });
  });

  describe('link behavior', () => {
    it('should generate correct contact link for English', () => {
      usePathname.mockReturnValue('/en/products');

      render(<Footer />);

      const contactLink = screen.getByText('Contact');
      // English now uses /en prefix
      expect(contactLink).toHaveAttribute('href', '/en/contact');
    });

    it('should generate correct privacy link for Italian', () => {
      usePathname.mockReturnValue('/it');

      render(<Footer />);

      const privacyLink = screen.getByText('Privacy Policy');
      expect(privacyLink).toHaveAttribute('href', '/it/privacy');
    });

    it('should generate correct terms link for Hebrew', () => {
      usePathname.mockReturnValue('/he/products');

      render(<Footer />);

      const termsLink = screen.getByText('Terms of Service');
      expect(termsLink).toHaveAttribute('href', '/he/terms');
    });
  });
});
