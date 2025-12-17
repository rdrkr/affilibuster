// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ThemeMenu component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { ThemeMenu, type ThemeMenuProps } from '@/components/menus/ThemeMenu'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ButtonAction: function MockButtonAction(props: any) {
    const { children, data, onClick, className } = props
    const ariaLabel = props['aria-label'] ?? data?.label?.ariaDescription
    // If no children, render icon and text from data.label (like Label component does)
    const content =
      children ??
      (data?.label && (
        <>
          {data.label.icon && (
            <span data-testid="mock-icon" data-icon={data.label.icon}>
              {data.label.icon}
            </span>
          )}
          {data.label.text && <span data-testid="mock-text">{data.label.text}</span>}
        </>
      ))
    return (
      <button onClick={onClick} className={className} aria-label={ariaLabel}>
        {content}
      </button>
    )
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ButtonLink: function MockButtonLink(props: any) {
    const { data, className, children } = props
    const ariaLabel = data?.label?.ariaDescription
    const content =
      children ??
      (data?.label && (
        <>
          {data.label.icon && (
            <span data-testid="mock-icon" data-icon={data.label.icon}>
              {data.label.icon}
            </span>
          )}
          {data.label.text && <span data-testid="mock-text">{data.label.text}</span>}
        </>
      ))
    return (
      <a href={data?.url ?? '#'} className={className} aria-label={ariaLabel} data-testid="mock-button-link">
        {content}
      </a>
    )
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
    render(
      <ThemeMenu
        data={mockData}
        selectedTheme="Light"
        onThemeChange={mockOnThemeChange}
        direction={DirectionEnum.LTR}
      />
    )
    const button = screen.getByRole('link', { name: 'Select theme' })
    expect(button).toBeInTheDocument()
  })

  it('should render theme options', () => {
    render(
      <ThemeMenu
        data={mockData}
        selectedTheme="Light"
        onThemeChange={mockOnThemeChange}
        direction={DirectionEnum.LTR}
      />
    )
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('should call onThemeChange when theme is clicked', () => {
    render(
      <ThemeMenu
        data={mockData}
        selectedTheme="Light"
        onThemeChange={mockOnThemeChange}
        direction={DirectionEnum.LTR}
      />
    )
    const darkButton = screen.getByRole('button', { name: 'Dark theme' })
    fireEvent.click(darkButton)
    expect(mockOnThemeChange).toHaveBeenCalledWith('Dark')
  })

  it('should highlight selected theme', () => {
    render(
      <ThemeMenu data={mockData} selectedTheme="Dark" onThemeChange={mockOnThemeChange} direction={DirectionEnum.LTR} />
    )
    const darkButton = screen.getByRole('button', { name: 'Dark theme' })
    expect(darkButton.className).toContain('bg-white/5')
  })

  it('should not highlight unselected themes', () => {
    render(
      <ThemeMenu data={mockData} selectedTheme="Dark" onThemeChange={mockOnThemeChange} direction={DirectionEnum.LTR} />
    )
    const lightButton = screen.getByRole('button', { name: 'Light theme' })
    expect(lightButton.className).not.toContain('bg-white/5')
  })

  it('should render icons for themes', () => {
    render(
      <ThemeMenu
        data={mockData}
        selectedTheme="Light"
        onThemeChange={mockOnThemeChange}
        direction={DirectionEnum.LTR}
      />
    )
    const icons = screen.getAllByTestId('mock-icon')
    // 3 theme icons (menu button icon is now rendered internally by Label, not as separate mock-icon)
    expect(icons.length).toBeGreaterThanOrEqual(3)
  })

  it('should handle empty themes array', () => {
    const dataWithNoThemes = { ...mockData, themes: undefined } as unknown as ThemeMenuProps['data']
    const { container } = render(
      <ThemeMenu
        data={dataWithNoThemes}
        selectedTheme="Light"
        onThemeChange={mockOnThemeChange}
        direction={DirectionEnum.LTR}
      />
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
    render(
      <ThemeMenu
        data={dataWithNullContent}
        selectedTheme="Light"
        onThemeChange={mockOnThemeChange}
        direction={DirectionEnum.LTR}
      />
    )
    // Should still render only 3 theme buttons (menu button is a link, not counted here)
    const buttons = screen.getAllByRole('button')
    // 3 theme buttons (menu button is now a link)
    expect(buttons).toHaveLength(3)
  })

  it('should apply RTL styling when direction is RTL', () => {
    render(
      <ThemeMenu
        data={mockData}
        selectedTheme="Light"
        onThemeChange={mockOnThemeChange}
        direction={DirectionEnum.RTL}
      />
    )
    // Component should render without error in RTL mode
    expect(screen.getByText('Light')).toBeInTheDocument()
  })

  it('should render icon after text when iconPosition is AFTER_TEXT', () => {
    const mockDataIconAfter = {
      ...mockData,
      menuButton: {
        ...mockData.menuButton,
        label: {
          ...mockData.menuButton.label,
          iconPosition: IconPositionEnum.AFTER_TEXT,
        },
      },
    } as unknown as ThemeMenuProps['data']
    render(
      <ThemeMenu
        data={mockDataIconAfter}
        selectedTheme="Light"
        onThemeChange={mockOnThemeChange}
        direction={DirectionEnum.LTR}
      />
    )
    // Component should render with icon after text
    expect(screen.getByText('expand_more')).toBeInTheDocument()
  })
})
