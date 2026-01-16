// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for EndNavigationGroup component
 */

import { EndNavigationGroup, type EndNavigationGroupProps } from '@/components/navigation/EndNavigationGroup'
import { CodeEnum, DirectionEnum, type ApiNavigationNavigationDocument, type Language } from '@/lib/generated/types.gen'
import { fireEvent, render, screen } from '@testing-library/react'

// Mock child components
jest.mock('@/components/menus', () => ({
  SearchMenu: ({ onExpandChange }: { onExpandChange: (expanded: boolean) => void }) => (
    <div data-testid="search-menu">
      <button
        onClick={() => {
          onExpandChange(true)
        }}
      >
        Expand
      </button>
      <button
        onClick={() => {
          onExpandChange(false)
        }}
      >
        Collapse
      </button>
    </div>
  ),
  ThemeMenu: () => <div data-testid="theme-menu">Theme</div>,
  LanguageMenu: () => <div data-testid="language-menu">Language</div>,
}))

jest.mock('@/components/navigation/MobileNavigationGroup', () => ({
  MobileNavigationGroup: ({
    isOpen,
    onToggle,
    visible,
  }: {
    isOpen: boolean
    onToggle: () => void
    visible?: boolean
  }) => (
    <div data-testid="mobile-nav-group" data-visible={visible}>
      <button onClick={onToggle} aria-expanded={isOpen}>
        Toggle Mobile
      </button>
    </div>
  ),
}))

jest.mock('@/components/elements', () => ({
  ButtonLink: ({ showText, className }: { showText: boolean; className?: string }) => (
    <div data-testid="login-button" data-show-text={showText} className={className}>
      Login
      {showText && <span>Login Text</span>}
    </div>
  ),
}))

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}))

describe('EndNavigationGroup', () => {
  const mockSetTheme = jest.fn()
  const mockOnSearchExpandChange = jest.fn()

  const mockData = {
    searchMenu: {
      menuButton: { label: { icon: 'search' } },
    },
    themeMenu: {
      menuButton: { label: { icon: 'theme' } },
    },
    languageMenu: {
      menuButton: { label: { icon: 'lang' } },
    },
    loginButton: {
      label: { icon: 'login' },
    },
    mobileMenuButton: {
      label: { icon: 'menu' },
    },
    // needed for buildStartNavLinks mock if used
    homeButton: {
      menuButton: { url: '/', label: { text: 'Home' } },
    },
    productsMenu: {
      menuButton: { url: '/products', label: { text: 'Products' } },
    },
    blogButton: {
      menuButton: { url: '/blog', label: { text: 'Blog' } },
    },
    aboutButton: {
      menuButton: { url: '/about', label: { text: 'About' } },
    },
  } as unknown as ApiNavigationNavigationDocument

  const defaultProps: EndNavigationGroupProps = {
    data: mockData,
    displayMode: 'full',
    startGroupMode: 'full',
    direction: DirectionEnum.LTR,
    navWidth: 1200,
    theme: 'light',
    setTheme: mockSetTheme,
    onSearchExpandChange: mockOnSearchExpandChange,
    apiLanguages: [
      { code: CodeEnum.EN, displayName: 'English', flag: '🇺🇸' },
      { code: CodeEnum.EN, displayName: 'English', flag: '🇺🇸' },
      { code: CodeEnum.IT, displayName: 'Italiano', flag: '🇮🇹' },
    ] as Language[],
    enableProductSearch: true,
    enableUserProfile: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all child menus and login button', () => {
    render(<EndNavigationGroup {...defaultProps} />)
    expect(screen.getByTestId('search-menu')).toBeInTheDocument()
    expect(screen.getByTestId('theme-menu')).toBeInTheDocument()
    expect(screen.getByTestId('language-menu')).toBeInTheDocument()
    expect(screen.getByTestId('login-button')).toBeInTheDocument()
  })

  describe('Mobile Menu Logic', () => {
    it('should NOT render SearchMenu when enableProductSearch is false', () => {
      render(<EndNavigationGroup {...defaultProps} enableProductSearch={false} />)
      expect(screen.queryByTestId('search-menu')).not.toBeInTheDocument()
    })

    it('should NOT show mobile menu when startGroupMode is full', () => {
      render(<EndNavigationGroup {...defaultProps} startGroupMode="full" />)
      const mobileNavGroup = screen.getByTestId('mobile-nav-group')
      // Check the visible prop passed to MobileNavigationGroup
      expect(mobileNavGroup).toHaveAttribute('data-visible', 'false')
    })

    it('should NOT show mobile menu when startGroupMode is partial', () => {
      render(<EndNavigationGroup {...defaultProps} startGroupMode="partial" />)
      const mobileNavGroup = screen.getByTestId('mobile-nav-group')
      // Mobile menu is now only shown in minimal mode
      expect(mobileNavGroup).toHaveAttribute('data-visible', 'false')
    })

    it('should show mobile menu when startGroupMode is minimal', () => {
      render(<EndNavigationGroup {...defaultProps} startGroupMode="minimal" />)
      const mobileNavGroup = screen.getByTestId('mobile-nav-group')
      // Check the visible prop passed to MobileNavigationGroup
      expect(mobileNavGroup).toHaveAttribute('data-visible', 'true')
    })

    it('should keep mobile menu visible when search expands if already visible (Case 3)', () => {
      // Per new logic: Case 3 - Was visible and not suppressed. Keep it that way.
      render(<EndNavigationGroup {...defaultProps} startGroupMode="minimal" />)
      const mobileNavGroup = screen.getByTestId('mobile-nav-group')

      // Initially visible
      expect(mobileNavGroup).toHaveAttribute('data-visible', 'true')

      // Expand search - with new logic, mobile menu stays visible (Case 3)
      fireEvent.click(screen.getByText('Expand'))

      // Should remain visible per Case 3 logic
      expect(mobileNavGroup).toHaveAttribute('data-visible', 'true')
    })

    it('should NOT restore mobile menu if prop changed to hidden while expanded', () => {
      const { rerender } = render(<EndNavigationGroup {...defaultProps} startGroupMode="minimal" />)

      // Expand search
      fireEvent.click(screen.getByText('Expand'))

      // Change prop to full (should hide mobile menu anyway)
      rerender(<EndNavigationGroup {...defaultProps} startGroupMode="full" />)

      // Collapse search
      fireEvent.click(screen.getByText('Collapse'))

      const mobileNavGroup = screen.getByTestId('mobile-nav-group')
      expect(mobileNavGroup).toHaveAttribute('data-visible', 'false')
    })

    it('should NOT un-suppress mobile menu when search collapses if navWidth is large (Fix Glitch)', () => {
      // 1. Start in Partial mode (navWidth = 1000 > START_MINIMAL 900)
      const { rerender } = render(<EndNavigationGroup {...defaultProps} startGroupMode="partial" navWidth={1000} />)
      const mobileNavGroup = screen.getByTestId('mobile-nav-group')
      expect(mobileNavGroup).toHaveAttribute('data-visible', 'false')

      // 2. Expand Search
      fireEvent.click(screen.getByText('Expand'))

      // 3. Parent updates mode to Minimal (due to effective width reduction)
      // Because we just became eligible for mobile menu while search is expanded, we should suppress (Case 1)
      rerender(<EndNavigationGroup {...defaultProps} startGroupMode="minimal" navWidth={1000} />)
      expect(mobileNavGroup).toHaveAttribute('data-visible', 'false') // Suppressed

      // 4. Collapse Search
      // Mode is still Minimal (prop hasn't updated yet)
      // NavWidth is still 1000 (>= START_MINIMAL which is 900)
      // Should NOT un-suppress (Case 2 fix)
      fireEvent.click(screen.getByText('Collapse'))
      expect(mobileNavGroup).toHaveAttribute('data-visible', 'false')
    })
  })

  describe('Login Text Logic', () => {
    it('should show login text when startGroupMode is full', () => {
      render(<EndNavigationGroup {...defaultProps} startGroupMode="full" />)
      const loginBtn = screen.getByTestId('login-button')
      expect(loginBtn).toHaveAttribute('data-show-text', 'true')
    })

    // Update according to complex logic:
    // shouldShowLoginText = start=='full' || ((start=='partial' || start=='minimal') && displayMode=='full')
    // If start=minimal and end=full -> Text Shows.
    // If start=minimal and end=partial -> Text Hides.

    it('should hide login text when start is minimal AND end is partial', () => {
      render(<EndNavigationGroup {...defaultProps} startGroupMode="minimal" displayMode="partial" />)
      const loginBtn = screen.getByTestId('login-button')
      expect(loginBtn).toHaveAttribute('data-show-text', 'false')
    })

    it('should keep login text visible if hidden by mode while search is expanded (Stability)', () => {
      // Start visible (Partial + Full)
      const { rerender } = render(<EndNavigationGroup {...defaultProps} startGroupMode="partial" displayMode="full" />)
      const loginBtn = screen.getByTestId('login-button')

      // Expand search
      fireEvent.click(screen.getByText('Expand'))

      // Now change mode to one where it SHOULD be hidden (prop update)
      // We must rerender to update props
      rerender(<EndNavigationGroup {...defaultProps} startGroupMode="partial" displayMode="minimal" />) // Hidden mode

      // Should remain visible because search is expanded and it WAS visible
      // Wait, can we preserve state across rerender? Yes, standard React behavior.
      expect(loginBtn).toHaveAttribute('data-show-text', 'true')

      // Collapse search -> should finally hide
      fireEvent.click(screen.getByText('Collapse'))
      expect(loginBtn).toHaveAttribute('data-show-text', 'false')
    })
  })

  describe('Login Text Logic Extended', () => {
    it('should handle complex state transition for Login Text (Case 2 coverage)', () => {
      // Goal: Trigger Case 2: else if (loginTextState.effectiveShow) -> newEffective = isSearchExpanded
      // Steps:
      // 1. Start Visible (effectiveShow = true) with Search Expanded
      // 2. Change props to Hidden (trigger Case 1 -> newEffective=true)
      // 3. Toggle Search to False (trigger Case 2 -> newEffective=false)

      const { rerender } = render(<EndNavigationGroup {...defaultProps} startGroupMode="partial" displayMode="full" />)
      const loginBtn = screen.getByTestId('login-button')

      // 1. Expand Search (Visible + Search=True)
      fireEvent.click(screen.getByText('Expand'))
      expect(loginBtn).toHaveAttribute('data-show-text', 'true')

      // 2. Change Props to Hidden (Visible + Search=True -> Hidden Mode)
      // Hits Case 1: wasVisible && isSearchExpanded -> Force True
      rerender(<EndNavigationGroup {...defaultProps} startGroupMode="partial" displayMode="minimal" />)
      expect(loginBtn).toHaveAttribute('data-show-text', 'true')

      // 3. Collapse Search (Hidden Mode + Search=False)
      // Hits Case 2: effectiveShow=True -> newEffective = isSearchExpanded (False)
      fireEvent.click(screen.getByText('Collapse'))
      expect(loginBtn).toHaveAttribute('data-show-text', 'false')
    })
  })

  describe('Mobile Menu Toggle Interaction', () => {
    it('should toggle mobile menu state internally', () => {
      render(<EndNavigationGroup {...defaultProps} startGroupMode="minimal" />)
      const toggleBtn = screen.getByRole('button', { name: 'Toggle Mobile' })

      // Initial: Closed
      expect(toggleBtn).toHaveAttribute('aria-expanded', 'false')

      // Click to open
      fireEvent.click(toggleBtn)
      expect(toggleBtn).toHaveAttribute('aria-expanded', 'true')

      // Click to close
      fireEvent.click(toggleBtn)
      expect(toggleBtn).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Icon Detection Logic', () => {
    it('should call onHasIconsChange with true when all items have icons', () => {
      const mockOnHasIconsChange = jest.fn()
      render(<EndNavigationGroup {...defaultProps} onHasIconsChange={mockOnHasIconsChange} />)
      expect(mockOnHasIconsChange).toHaveBeenCalledWith(true)
    })

    it('should call onHasIconsChange with false when an item is missing icon', () => {
      const mockOnHasIconsChange = jest.fn()
      const noIconData = {
        ...defaultProps.data,
        searchMenu: {
          ...defaultProps.data.searchMenu,
          menuButton: { label: { icon: undefined } },
        },
      } as unknown as EndNavigationGroupProps['data']

      render(<EndNavigationGroup {...defaultProps} data={noIconData} onHasIconsChange={mockOnHasIconsChange} />)
      expect(mockOnHasIconsChange).toHaveBeenCalledWith(false)
    })
  })
})
