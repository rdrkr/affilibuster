// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for LanguageMenu component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { LanguageMenu, type LanguageMenuProps } from '@/components/menus/LanguageMenu'
import { CodeEnum, IconPositionEnum } from '@/lib/generated/types.gen'

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

describe('LanguageMenu', () => {
  const mockOnLanguageChange = jest.fn()

  const mockData: LanguageMenuProps['data'] = {
    id: 1,
    menuButton: {
      url: '#',
      openInNewTab: false,
      label: {
        text: 'Language',
        icon: 'language',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Select language',
      },
    },
  }

  const mockLanguages: LanguageMenuProps['languages'] = [
    { name: 'English', flag: '🇺🇸', code: CodeEnum.EN },
    { name: 'Italiano', flag: '🇮🇹', code: CodeEnum.IT },
    { name: 'עברית', flag: '🇮🇱', code: CodeEnum.HE },
  ]

  beforeEach(() => {
    mockOnLanguageChange.mockClear()
  })

  it('should render menu button', () => {
    render(
      <LanguageMenu
        data={mockData}
        languages={mockLanguages}
        selectedLang={CodeEnum.EN}
        onLanguageChange={mockOnLanguageChange}
      />
    )
    const button = screen.getByRole('button', { name: 'Select language' })
    expect(button).toBeInTheDocument()
  })

  it('should render language options', () => {
    render(
      <LanguageMenu
        data={mockData}
        languages={mockLanguages}
        selectedLang={CodeEnum.EN}
        onLanguageChange={mockOnLanguageChange}
      />
    )
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Italiano')).toBeInTheDocument()
    expect(screen.getByText('עברית')).toBeInTheDocument()
  })

  it('should render flag emojis for languages', () => {
    render(
      <LanguageMenu
        data={mockData}
        languages={mockLanguages}
        selectedLang={CodeEnum.EN}
        onLanguageChange={mockOnLanguageChange}
      />
    )
    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    expect(screen.getByText('🇮🇹')).toBeInTheDocument()
    expect(screen.getByText('🇮🇱')).toBeInTheDocument()
  })

  it('should display selected language code in badge', () => {
    render(
      <LanguageMenu
        data={mockData}
        languages={mockLanguages}
        selectedLang={CodeEnum.EN}
        onLanguageChange={mockOnLanguageChange}
      />
    )
    expect(screen.getByText(CodeEnum.EN)).toBeInTheDocument()
  })

  it('should call onLanguageChange when language is clicked', () => {
    render(
      <LanguageMenu
        data={mockData}
        languages={mockLanguages}
        selectedLang={CodeEnum.EN}
        onLanguageChange={mockOnLanguageChange}
      />
    )
    const italianButton = screen.getByText('Italiano').closest('button')
    fireEvent.click(italianButton!)
    expect(mockOnLanguageChange).toHaveBeenCalledWith(CodeEnum.IT)
  })

  it('should highlight selected language', () => {
    render(
      <LanguageMenu
        data={mockData}
        languages={mockLanguages}
        selectedLang={CodeEnum.IT}
        onLanguageChange={mockOnLanguageChange}
      />
    )
    const italianButton = screen.getByText('Italiano').closest('button')
    expect(italianButton?.className).toContain('bg-white/5')
  })

  it('should not highlight unselected languages', () => {
    render(
      <LanguageMenu
        data={mockData}
        languages={mockLanguages}
        selectedLang={CodeEnum.EN}
        onLanguageChange={mockOnLanguageChange}
      />
    )
    const italianButton = screen.getByText('Italiano').closest('button')
    expect(italianButton?.className).not.toContain('bg-white/5')
  })

  it('should render menu button icon', () => {
    render(
      <LanguageMenu
        data={mockData}
        languages={mockLanguages}
        selectedLang={CodeEnum.EN}
        onLanguageChange={mockOnLanguageChange}
      />
    )
    const icons = screen.getAllByTestId('mock-icon')
    expect(icons[0]).toHaveAttribute('data-icon', 'language')
  })
})
