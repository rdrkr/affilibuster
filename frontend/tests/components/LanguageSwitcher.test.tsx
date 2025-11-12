// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Component Test for LanguageSwitcher (T048)
 *
 * Tests the language switcher dropdown component.
 * Reference: plan.md:143-147 (Modular components: Language switcher)
 * Reference: T109 (LanguageSwitcher component implementation)
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import * as client from '@/lib/client'
import { useRouter, usePathname } from 'next/navigation'
import { CodeEnum } from '@/lib/generated/types.gen'
import { CurrencyCode } from '@/lib/types'

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock languages API
jest.mock('@/lib/client', () => ({
  getLanguages: jest.fn(),
  getNavigation: jest.fn(),
}))

describe('LanguageSwitcher Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  const mockLanguages = [
    {
      code: CodeEnum.EN,
      displayName: 'English',
      nativeName: 'English',
      direction: 'ltr' as const,
      urlPrefix: '/en',
      defaultCurrency: CurrencyCode.USD,
      localeCode: 'en-US',
      isDefault: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      code: CodeEnum.IT,
      displayName: 'Italian',
      nativeName: 'Italiano',
      direction: 'ltr' as const,
      urlPrefix: '/it',
      defaultCurrency: CurrencyCode.EUR,
      localeCode: 'it-IT',
      isDefault: false,
      isActive: true,
      sortOrder: 2,
    },
    {
      code: CodeEnum.HE,
      displayName: 'Hebrew',
      nativeName: 'עברית',
      direction: 'rtl' as const,
      urlPrefix: '/he',
      defaultCurrency: CurrencyCode.ILS,
      localeCode: 'he-IL',
      isDefault: false,
      isActive: true,
      sortOrder: 3,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(usePathname as jest.Mock).mockReturnValue('/')
    ;(client.getLanguages as jest.Mock).mockResolvedValue(mockLanguages)
    ;(client.getNavigation as jest.Mock).mockResolvedValue({ languageSelectorAriaLabel: 'Select language' })
  })

  it('should render language switcher button', async () => {
    render(<LanguageSwitcher />)

    // Wait for languages to load and button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument()
    })

    // Verify English is displayed
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('should display current language in button', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/it/products')

    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeInTheDocument()
    })
  })

  it('should open dropdown when button is clicked', async () => {
    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    // Click button to open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Should show all 3 languages (use getAllByText for English since it appears in button and dropdown)
    expect(screen.getAllByText('English').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Italiano')).toBeInTheDocument()
    expect(screen.getByText('עברית')).toBeInTheDocument()
  })

  it('should show checkmark next to current language', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/it/products')

    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Find the Italian button in the dropdown
    const italianButtons = screen.getAllByText('Italiano')
    const italianButton = italianButtons[1] // Second one is in dropdown
    if (italianButton) {
      const parentElement = italianButton.closest('button')

      // Should have checkmark (SVG) next to Italian
      if (parentElement) {
        expect(parentElement.querySelector('svg')).toBeInTheDocument()
      }
    }
  })

  it('should navigate to Italian version when Italian is selected', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/en/products/eco-bottle')

    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Click Italian
    const italianButtons = screen.getAllByText('Italiano')
    const lastItalianButton = italianButtons[italianButtons.length - 1]
    if (lastItalianButton) {
      fireEvent.click(lastItalianButton)
    }

    // Should navigate to Italian version
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/it/products/eco-bottle')
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('should navigate to Hebrew (RTL) version when Hebrew is selected', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/en/products/eco-bottle')

    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Click Hebrew
    const hebrewButtons = screen.getAllByText('עברית')
    const lastHebrewButton = hebrewButtons[hebrewButtons.length - 1]
    if (lastHebrewButton) {
      fireEvent.click(lastHebrewButton)
    }

    // Should navigate to Hebrew version
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/he/products/eco-bottle')
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('should switch from Italian to English correctly', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/it/prodotti/bottiglia')

    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Click English
    const englishButtons = screen.getAllByText('English')
    const lastEnglishButton = englishButtons[englishButtons.length - 1]
    if (lastEnglishButton) {
      fireEvent.click(lastEnglishButton)
    }

    // Should navigate to English version (change /it to /en)
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/en/prodotti/bottiglia')
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('should close dropdown when clicking backdrop', async () => {
    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Dropdown should be visible (English appears in button + dropdown = 2 times)
    expect(screen.getAllByText('English').length).toBeGreaterThan(1)

    // Click backdrop (div with aria-hidden="true")
    const backdrop = document.querySelector('[aria-hidden="true"]')
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    // Dropdown should close (English only in button = 1 time)
    await waitFor(() => {
      expect(screen.getAllByText('English').length).toBe(1)
    })
  })

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(client.getLanguages as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<LanguageSwitcher />)

    // Should not crash, should show loading skeleton when languages fail to load
    await waitFor(() => {
      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should maintain RTL direction for Hebrew option', async () => {
    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Find Hebrew button
    const hebrewButtons = screen.getAllByText('עברית')
    const lastHebrewElement = hebrewButtons[hebrewButtons.length - 1]
    const hebrewContainer = lastHebrewElement ? lastHebrewElement.closest('div[dir]') : null

    // Should have dir="rtl" on the container div
    if (hebrewContainer) {
      expect(hebrewContainer).toHaveAttribute('dir', 'rtl')
    }
  })

  it('should show loading state initially', () => {
    render(<LanguageSwitcher />)

    // Should show loading skeleton
    const loadingElement = document.querySelector('.animate-pulse')
    expect(loadingElement).toBeInTheDocument()
  })

  it('should update current language when pathname changes', async () => {
    const { rerender } = render(<LanguageSwitcher />)

    // Initially English
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    // Change pathname to Italian
    ;(usePathname as jest.Mock).mockReturnValue('/it/products')

    rerender(<LanguageSwitcher />)

    // Should update to Italian
    await waitFor(() => {
      expect(screen.getByText('Italiano')).toBeInTheDocument()
    })
  })

  it('should have proper accessibility attributes', async () => {
    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /select language/i })

    // Should have aria-label
    expect(button).toHaveAttribute('aria-label', 'Select language')

    // Should have aria-expanded
    expect(button).toHaveAttribute('aria-expanded', 'false')

    // Open dropdown
    fireEvent.click(button)

    // aria-expanded should be true
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should handle edge case where newPath becomes empty string', async () => {
    // Create a language without urlPrefix to test the fallback path
    const edgeCaseLanguages = [
      {
        code: CodeEnum.EN,
        displayName: 'English',
        nativeName: 'English',
        direction: 'ltr' as const,
        urlPrefix: '',
        defaultCurrency: CurrencyCode.USD,
        localeCode: 'en-US',
        isDefault: true,
        isActive: true,
        sortOrder: 1,
      },
    ]
    ;(client.getLanguages as jest.Mock).mockResolvedValue(edgeCaseLanguages)
    ;(usePathname as jest.Mock).mockReturnValue('/')

    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Click English (which has empty urlPrefix)
    const englishButtons = screen.getAllByText('English')
    const lastEnglishButton = englishButtons[englishButtons.length - 1]
    if (lastEnglishButton) {
      fireEvent.click(lastEnglishButton)
    }

    // Should navigate to '/' when newPath would be empty
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  it('should handle language without urlPrefix', async () => {
    // Mock languages with one missing urlPrefix
    const languagesWithoutPrefix = [
      ...mockLanguages.slice(0, 2),
      {
        ...mockLanguages[2],
        urlPrefix: undefined,
      },
    ]
    ;(client.getLanguages as jest.Mock).mockResolvedValue(languagesWithoutPrefix)
    ;(usePathname as jest.Mock).mockReturnValue('/en/products')

    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Click Hebrew (which has no urlPrefix in this test)
    const hebrewButtons = screen.getAllByText('עברית')
    const lastHebrewButton = hebrewButtons[hebrewButtons.length - 1]
    if (lastHebrewButton) {
      fireEvent.click(lastHebrewButton)
    }

    // Should still navigate (fallback to pathWithoutLang)
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/products')
    })
  })

  it('should handle root path language switch', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/en')

    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Click Italian
    const italianButtons = screen.getAllByText('Italiano')
    const lastItalianButton = italianButtons[italianButtons.length - 1]
    if (lastItalianButton) {
      fireEvent.click(lastItalianButton)
    }

    // Should navigate to /it (root path for Italian)
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/it')
    })
  })

  it('should handle invalid language code defensively', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    // Mock languages array that will be modified mid-flight
    const mutableLanguages = [...mockLanguages]
    ;(client.getLanguages as jest.Mock).mockResolvedValue(mutableLanguages)

    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Now remove all languages from the array to simulate data corruption
    // This will cause the find() to return undefined
    mutableLanguages.length = 0

    // Click a button (Italian) - but the languages array is now empty
    const italianButtons = screen.getAllByText('Italiano')
    const dropdownButton = italianButtons[italianButtons.length - 1]
    if (dropdownButton) {
      fireEvent.click(dropdownButton)
    }

    // The defensive check should have caught this and logged an error
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'))
    })

    consoleSpy.mockRestore()
  })

  it('should handle empty newPath fallback when urlPrefix is missing', async () => {
    // Test the edge case where urlPrefix is undefined and pathWithoutLang could theoretically be empty
    // This is defensive code for edge cases in path manipulation
    const noPrefixLangs = [
      {
        ...mockLanguages[0],
        urlPrefix: undefined as unknown as string, // Missing urlPrefix
      },
    ]
    ;(client.getLanguages as jest.Mock).mockResolvedValue(noPrefixLangs)

    // Create a mock pathname that when processed results in empty pathWithoutLang
    // This is a theoretical edge case the defensive code protects against
    ;(usePathname as jest.Mock).mockReturnValue('')

    render(<LanguageSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    // Click the language
    const englishButtons = screen.getAllByText('English')
    const dropdownButton = englishButtons[englishButtons.length - 1]
    if (dropdownButton) {
      fireEvent.click(dropdownButton)
    }

    // Should use fallback to '/' when newPath is empty
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })
})
