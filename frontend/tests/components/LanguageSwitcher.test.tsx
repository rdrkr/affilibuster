// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Component Test for LanguageSwitcher (T048)
 *
 * Tests the language switcher dropdown component.
 * Reference: plan.md:143-147 (Modular components: Language switcher)
 * Reference: T109 (LanguageSwitcher component implementation)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { languagesAPI } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock languages API
jest.mock('@/lib/api', () => ({
  languagesAPI: {
    getAll: jest.fn(),
  },
}));

describe('LanguageSwitcher Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  const mockLanguages = [
    {
      code: 'en',
      displayName: 'English',
      nativeName: 'English',
      direction: 'ltr' as const,
      urlPrefix: '',
      defaultCurrency: 'USD',
      localeCode: 'en-US',
      isDefault: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      code: 'it',
      displayName: 'Italian',
      nativeName: 'Italiano',
      direction: 'ltr' as const,
      urlPrefix: '/it',
      defaultCurrency: 'EUR',
      localeCode: 'it-IT',
      isDefault: false,
      isActive: true,
      sortOrder: 2,
    },
    {
      code: 'he',
      displayName: 'Hebrew',
      nativeName: 'עברית',
      direction: 'rtl' as const,
      urlPrefix: '/il',
      defaultCurrency: 'ILS',
      localeCode: 'he-IL',
      isDefault: false,
      isActive: true,
      sortOrder: 3,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/');
    (languagesAPI.getAll as jest.Mock).mockResolvedValue(mockLanguages);
  });

  it('should render language switcher button', async () => {
    render(<LanguageSwitcher />);

    // Should show loading state initially
    expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();

    // Wait for languages to load
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  it('should display current language in button', async () => {
    (usePathname as jest.Mock).mockReturnValue('/it/products');

    render(<LanguageSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeInTheDocument();
    });
  });

  it('should open dropdown when button is clicked', async () => {
    render(<LanguageSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    // Click button to open dropdown
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);

    // Should show all 3 languages
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Italiano')).toBeInTheDocument();
    expect(screen.getByText('עברית')).toBeInTheDocument();
  });

  it('should show checkmark next to current language', async () => {
    (usePathname as jest.Mock).mockReturnValue('/it/products');

    render(<LanguageSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeInTheDocument();
    });

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);

    // Find the Italian button in the dropdown
    const italianButton = screen.getAllByText('Italiano')[1]; // Second one is in dropdown
    const parentElement = italianButton.closest('button');

    // Should have checkmark (SVG) next to Italian
    expect(parentElement?.querySelector('svg')).toBeInTheDocument();
  });

  it('should navigate to Italian version when Italian is selected', async () => {
    (usePathname as jest.Mock).mockReturnValue('/products/eco-bottle');

    render(<LanguageSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);

    // Click Italian
    const italianButtons = screen.getAllByText('Italiano');
    fireEvent.click(italianButtons[italianButtons.length - 1]);

    // Should navigate to Italian version
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/it/products/eco-bottle');
    });
  });

  it('should navigate to Hebrew (RTL) version when Hebrew is selected', async () => {
    (usePathname as jest.Mock).mockReturnValue('/products/eco-bottle');

    render(<LanguageSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);

    // Click Hebrew
    const hebrewButtons = screen.getAllByText('עברית');
    fireEvent.click(hebrewButtons[hebrewButtons.length - 1]);

    // Should navigate to Hebrew version
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/il/products/eco-bottle');
    });
  });

  it('should switch from Italian to English correctly', async () => {
    (usePathname as jest.Mock).mockReturnValue('/it/prodotti/bottiglia');

    render(<LanguageSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeInTheDocument();
    });

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);

    // Click English
    const englishButtons = screen.getAllByText('English');
    fireEvent.click(englishButtons[englishButtons.length - 1]);

    // Should navigate to English version (remove /it prefix)
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/prodotti/bottiglia');
    });
  });

  it('should close dropdown when clicking backdrop', async () => {
    render(<LanguageSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);

    // Dropdown should be visible
    expect(screen.getAllByText('Italiano').length).toBeGreaterThan(1);

    // Click backdrop (div with aria-hidden="true")
    const backdrop = document.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    // Dropdown should close
    await waitFor(() => {
      expect(screen.getAllByText('Italiano').length).toBe(1);
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (languagesAPI.getAll as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<LanguageSwitcher />);

    // Should not crash, should stop loading
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /select language/i });
      expect(button).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should maintain RTL direction for Hebrew option', async () => {
    render(<LanguageSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);

    // Find Hebrew button
    const hebrewButtons = screen.getAllByText('עברית');
    const hebrewButton = hebrewButtons[hebrewButtons.length - 1].closest('button');

    // Should have dir="rtl"
    expect(hebrewButton).toHaveAttribute('dir', 'rtl');
  });

  it('should show loading state initially', () => {
    render(<LanguageSwitcher />);

    // Should show loading skeleton
    const loadingElement = document.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('should update current language when pathname changes', async () => {
    const { rerender } = render(<LanguageSwitcher />);

    // Initially English
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    // Change pathname to Italian
    (usePathname as jest.Mock).mockReturnValue('/it/products');

    rerender(<LanguageSwitcher />);

    // Should update to Italian
    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', async () => {
    render(<LanguageSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /select language/i });

    // Should have aria-label
    expect(button).toHaveAttribute('aria-label', 'Select language');

    // Should have aria-expanded
    expect(button).toHaveAttribute('aria-expanded', 'false');

    // Open dropdown
    fireEvent.click(button);

    // aria-expanded should be true
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
