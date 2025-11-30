// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ThemeMenu component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { ThemeMenu, type ThemeMenuProps } from '@/components/menus/ThemeMenu'
import { IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the CMS element components
jest.mock('@/components/elements', () => ({
  CMSIcon: function MockCMSIcon({ icon, size }: { icon?: string; size?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size}>
        {icon}
      </span>
    )
  },
  CMSText: function MockCMSText({ text }: { text?: string }) {
    return <span data-testid="mock-text">{text}</span>
  },
}))

describe('ThemeMenu', () => {
  const mockOnThemeChange = jest.fn()

  const mockData = {
    id: 1,
    menuButton: {
      url: '#',
      openInNewTab: false,
      label: {
        text: 'Theme',
        icon: 'palette',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Select theme',
      },
    },
    themes: [
      {
        id: 1,
        documentId: 'theme-1',
        publishedAt: '2024-01-01',
        content: {
          text: 'Light',
          icon: 'light_mode',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Light theme',
        },
      },
      {
        id: 2,
        documentId: 'theme-2',
        publishedAt: '2024-01-01',
        content: {
          text: 'Dark',
          icon: 'dark_mode',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Dark theme',
        },
      },
      {
        id: 3,
        documentId: 'theme-3',
        publishedAt: '2024-01-01',
        content: {
          text: 'System',
          icon: 'computer',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'System theme',
        },
      },
    ],
  } as unknown as ThemeMenuProps['data']

  beforeEach(() => {
    mockOnThemeChange.mockClear()
  })

  it('should render menu button', () => {
    render(<ThemeMenu data={mockData} selectedTheme="Light" onThemeChange={mockOnThemeChange} />)
    const button = screen.getByRole('button', { name: 'Select theme' })
    expect(button).toBeInTheDocument()
  })

  it('should render theme options', () => {
    render(<ThemeMenu data={mockData} selectedTheme="Light" onThemeChange={mockOnThemeChange} />)
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('should call onThemeChange when theme is clicked', () => {
    render(<ThemeMenu data={mockData} selectedTheme="Light" onThemeChange={mockOnThemeChange} />)
    const darkButton = screen.getByRole('button', { name: 'Dark theme' })
    fireEvent.click(darkButton)
    expect(mockOnThemeChange).toHaveBeenCalledWith('Dark')
  })

  it('should highlight selected theme', () => {
    render(<ThemeMenu data={mockData} selectedTheme="Dark" onThemeChange={mockOnThemeChange} />)
    const darkButton = screen.getByRole('button', { name: 'Dark theme' })
    expect(darkButton.className).toContain('bg-white/5')
  })

  it('should not highlight unselected themes', () => {
    render(<ThemeMenu data={mockData} selectedTheme="Dark" onThemeChange={mockOnThemeChange} />)
    const lightButton = screen.getByRole('button', { name: 'Light theme' })
    expect(lightButton.className).not.toContain('bg-white/5')
  })

  it('should render icons for themes', () => {
    render(<ThemeMenu data={mockData} selectedTheme="Light" onThemeChange={mockOnThemeChange} />)
    const icons = screen.getAllByTestId('mock-icon')
    // Menu button icon + 3 theme icons
    expect(icons.length).toBeGreaterThanOrEqual(4)
  })

  it('should handle empty themes array', () => {
    const dataWithNoThemes = { ...mockData, themes: undefined } as unknown as ThemeMenuProps['data']
    const { container } = render(
      <ThemeMenu data={dataWithNoThemes} selectedTheme="Light" onThemeChange={mockOnThemeChange} />
    )
    // Should render without theme buttons (only the menu button)
    const themeButtons = container.querySelectorAll('[aria-label*="theme"]')
    // Only the menu button should remain, no theme option buttons
    expect(themeButtons.length).toBeLessThanOrEqual(1)
  })

  it('should skip themes with null content', () => {
    const dataWithNullContent = {
      ...mockData,
      themes: [
        ...((mockData as { themes?: unknown[] }).themes ?? []),
        { id: 4, documentId: 'theme-4', publishedAt: '2024-01-01', content: undefined },
      ],
    } as unknown as ThemeMenuProps['data']
    render(<ThemeMenu data={dataWithNullContent} selectedTheme="Light" onThemeChange={mockOnThemeChange} />)
    // Should still render only 3 theme buttons
    const buttons = screen.getAllByRole('button')
    // 1 menu button + 3 theme buttons
    expect(buttons).toHaveLength(4)
  })
})
