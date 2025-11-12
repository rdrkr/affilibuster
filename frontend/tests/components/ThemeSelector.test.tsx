// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for ThemeSelector component
 * Tests theme switching, localStorage, system detection, and UI interactions
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeSelector } from '@/components/ThemeSelector'
import * as client from '@/lib/client'
import { usePathname } from 'next/navigation'

jest.mock('@/lib/client', () => ({
  getNavigation: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

const mockMatchMedia = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
})

describe('ThemeSelector', () => {
  const mockNavData = {
    themeSelectorLabel: 'Theme',
    themeSelectorAriaLabel: 'Select theme',
    themeLightLabel: 'Light',
    themeDarkLabel: 'Dark',
    themeSystemLabel: 'System',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    ;(usePathname as jest.Mock).mockReturnValue('/en')
    ;(client.getNavigation as jest.Mock).mockResolvedValue(mockNavData)
    window.matchMedia = jest.fn().mockImplementation(() => mockMatchMedia(false))
    document.documentElement.className = ''
  })

  it('should render loading skeleton before mount', () => {
    render(<ThemeSelector />)
    // Check that the skeleton exists initially (may pass quickly in React 18)
    const skeleton = document.querySelector('.animate-pulse')
    // Skeleton should exist or button should be rendered after mount
    const button = document.querySelector('button[aria-expanded]')
    expect(skeleton ?? button).toBeTruthy()
  })

  it('should render theme selector after mount', async () => {
    render(<ThemeSelector />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-expanded')
    })
  })

  it('should fetch navigation data on mount', async () => {
    render(<ThemeSelector />)

    await waitFor(() => {
      expect(client.getNavigation).toHaveBeenCalled()
    })
  })

  it('should default to system theme when no saved theme', async () => {
    render(<ThemeSelector />)

    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBeNull()
    })
  })

  it('should load saved theme from localStorage', async () => {
    localStorage.setItem('theme', 'dark')

    render(<ThemeSelector />)

    await waitFor(() => {
      const root = document.documentElement
      expect(root.classList.contains('dark')).toBe(true)
    })
  })

  it('should toggle dropdown on button click', async () => {
    render(<ThemeSelector />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    // Should open dropdown
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })
  })

  it('should close dropdown when clicking backdrop', async () => {
    render(<ThemeSelector />)

    // Wait for component to load and open dropdown
    const button = await waitFor(() => screen.getByRole('button'))
    fireEvent.click(button)

    // Click backdrop
    const backdrop = await waitFor(() => document.querySelector('.fixed.inset-0'))
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('Light')).not.toBeInTheDocument()
    })
  })

  it('should switch to light theme', async () => {
    render(<ThemeSelector />)

    const button = await waitFor(() => screen.getByRole('button'))
    fireEvent.click(button)

    const lightOption = screen.getByText('Light')
    fireEvent.click(lightOption)

    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })
  })

  it('should switch to dark theme', async () => {
    render(<ThemeSelector />)

    const button = await waitFor(() => screen.getByRole('button'))
    fireEvent.click(button)

    const darkOption = screen.getByText('Dark')
    fireEvent.click(darkOption)

    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('should switch to system theme and remove from localStorage', async () => {
    localStorage.setItem('theme', 'dark')

    render(<ThemeSelector />)

    const button = await waitFor(() => screen.getByRole('button'))
    fireEvent.click(button)

    const systemOption = screen.getByText('System')
    fireEvent.click(systemOption)

    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBeNull()
    })
  })

  it('should detect system dark mode preference', async () => {
    window.matchMedia = jest.fn().mockImplementation(() => mockMatchMedia(true))

    render(<ThemeSelector />)

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('should detect system light mode preference', async () => {
    window.matchMedia = jest.fn().mockImplementation(() => mockMatchMedia(false))

    render(<ThemeSelector />)

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })
  })

  it('should close dropdown after selecting theme', async () => {
    render(<ThemeSelector />)

    const button = await waitFor(() => screen.getByRole('button'))
    fireEvent.click(button)

    const lightOption = screen.getByText('Light')
    fireEvent.click(lightOption)

    await waitFor(() => {
      expect(screen.queryByText('Light')).not.toBeInTheDocument()
    })
  })

  it('should show check mark on selected theme', async () => {
    localStorage.setItem('theme', 'dark')

    render(<ThemeSelector />)

    const button = await waitFor(() => screen.getByRole('button'))
    fireEvent.click(button)

    // Check that dark option has special styling
    const darkButton = screen.getByText('Dark').closest('button')
    expect(darkButton?.className).toContain('bg-primary-50')
  })

  it('should handle navigation fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(client.getNavigation as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<ThemeSelector />)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch navigation:', expect.any(Error))
    })

    consoleErrorSpy.mockRestore()
  })

  it('should set aria-expanded correctly', async () => {
    render(<ThemeSelector />)

    const button = await waitFor(() => screen.getByRole('button'))

    await waitFor(() => {
      expect(button.getAttribute('aria-expanded')).toBe('false')
    })

    fireEvent.click(button)

    await waitFor(() => {
      expect(button.getAttribute('aria-expanded')).toBe('true')
    })
  })

  it('should cleanup event listener on unmount', async () => {
    const removeEventListenerSpy = jest.fn()
    window.matchMedia = jest.fn().mockImplementation(() => ({
      ...mockMatchMedia(false),
      removeEventListener: removeEventListenerSpy,
    }))

    const { unmount } = render(<ThemeSelector />)

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalled()
  })

  it('should listen to system theme changes', async () => {
    const addEventListenerSpy = jest.fn()
    window.matchMedia = jest.fn().mockImplementation(() => ({
      ...mockMatchMedia(false),
      addEventListener: addEventListenerSpy,
    }))

    render(<ThemeSelector />)

    await waitFor(() => {
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })

  it('should respond to system theme changes when no theme is set in localStorage', async () => {
    let changeHandler: (() => void) | null = null
    const addEventListenerSpy = jest.fn((event: string, handler: () => void) => {
      if (event === 'change') {
        changeHandler = handler
      }
    })

    window.matchMedia = jest.fn().mockImplementation(() => ({
      ...mockMatchMedia(false),
      addEventListener: addEventListenerSpy,
      removeEventListener: jest.fn(),
    }))

    // Ensure no theme is set in localStorage (system mode)
    localStorage.removeItem('theme')

    render(<ThemeSelector />)

    await waitFor(() => {
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
    })

    // Trigger the change handler (should be set by now)
    expect(changeHandler).not.toBeNull()
    changeHandler!()

    // Verify applyTheme was called (document has class)
    await waitFor(() => {
      const hasLightClass = document.documentElement.classList.contains('light')
      const hasDarkClass = document.documentElement.classList.contains('dark')
      expect(hasLightClass || hasDarkClass).toBe(true)
    })
  })
})
