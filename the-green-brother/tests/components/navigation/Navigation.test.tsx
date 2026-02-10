// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Navigation component
 */

import { fireEvent, render, screen } from '@testing-library/react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img src={src} alt={alt} />
  },
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/en'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
}))

// Mock useNavigationResize hook
const mockSetSearchExpanded = jest.fn()
jest.mock('@/lib/navigation', () => ({
  ...(jest.requireActual('@/lib/navigation') as typeof import('@/lib/navigation')),
  useNavigationResize: jest.fn(() => ({
    navRef: { current: null },
    visibility: {
      startGroupMode: 'full' as const,
      endGroupMode: 'full' as const,
      collapsedItems: [] as string[],
      searchMaxWidth: 256,
      navWidth: 1024,
    },
    isSearchExpanded: false,
    setSearchExpanded: mockSetSearchExpanded,
    isReady: true,
  })),
}))

// Mock NavigationGroup
jest.mock('@/components/navigation/NavigationGroup', () => ({
  __esModule: true,
  NavigationGroup: function MockNavigationGroup({
    displayMode,
    position,
    children,
    hasIcons = true,
  }: {
    displayMode: string
    position: string
    children: (ctx: { showText: boolean; displayMode: string }) => React.ReactNode
    hasIcons?: boolean
  }) {
    const effectiveMode = displayMode === 'partial' && !hasIcons ? 'minimal' : displayMode
    const showText = effectiveMode === 'full'

    return (
      <div data-testid={`navigation-group-${position}`} data-display-mode={effectiveMode}>
        {children({ showText, displayMode: effectiveMode })}
      </div>
    )
  },
}))

// Mock CMS elements
jest.mock('@/components/elements', () => ({
  Icon: function MockIcon({ icon }: { icon?: { name?: string } }) {
    return <span data-testid="cms-icon">{icon?.name}</span>
  },
  Text: function MockText({ text }: { text?: string }) {
    return <span>{text}</span>
  },
  resolveIcon: jest.fn((icon: { name?: string } | undefined) => (icon?.name ?? 'default') as string),
  ButtonLink: function MockButtonLink(props: any) {
    const { children, data, className, showText } = props
    const ariaLabel = props['aria-label'] ?? data?.label?.ariaDescription
    const isBrand = data?.url === '/' && data?.label?.text === 'TheGreenBrother'
    const isMobile = (className as string | undefined)?.includes('md:hidden')
    // Distinguish desktop vs mobile brand buttons
    const testId =
      isBrand && showText !== undefined ? (isMobile ? 'mobile-brand-button' : 'desktop-brand-button') : undefined
    return (
      <a
        href={data?.url}
        className={className}
        aria-label={ariaLabel}
        data-testid={testId}
        data-show-text={showText !== undefined ? String(showText) : undefined}
      >
        {children}
      </a>
    )
  },
  getVisibilityClasses: jest.fn(() => 'mock-visibility-class'),
}))

// Mock menus
jest.mock('@/components/menus', () => ({
  LanguageMenu: function MockLanguageMenu({ onLanguageChange }: { onLanguageChange?: (lang: LanguageCode) => void }) {
    return (
      <div data-testid="language-menu">
        <button data-testid="change-lang-it" onClick={() => onLanguageChange?.(LanguageCode.IT)}>
          Change to Italian
        </button>
        <button data-testid="change-lang-en" onClick={() => onLanguageChange?.(LanguageCode.EN)}>
          Change to English
        </button>
      </div>
    )
  },
  ProductCategoriesMenu: function MockProductCategoriesMenu() {
    return <div data-testid="product-categories-menu">Product Categories</div>
  },
  SearchMenu: function MockSearchMenu({ onExpandChange }: { onExpandChange?: (expanded: boolean) => void }) {
    return (
      <div data-testid="search-menu">
        Search
        <button data-testid="expand-search" onClick={() => onExpandChange?.(true)}>
          Expand
        </button>
        <button data-testid="collapse-search" onClick={() => onExpandChange?.(false)}>
          Collapse
        </button>
      </div>
    )
  },
  ThemeMenu: function MockThemeMenu({ showText }: { showText?: boolean }) {
    return (
      <div data-testid="theme-menu" data-show-text={showText}>
        Theme
      </div>
    )
  },
}))

// Mock MobileNavigationGroup
jest.mock('@/components/navigation/MobileNavigationGroup', () => ({
  MobileNavigationGroup: function MockMobileNavigationGroup({
    isOpen,
    onToggle,
    showTheme,
    themeData,
  }: {
    isOpen: boolean
    onToggle: () => void
    showTheme?: boolean
    themeData?: { selectedTheme: string }
  }) {
    return (
      <>
        <button data-testid="mobile-menu-toggle" onClick={onToggle}>
          Toggle
        </button>
        {isOpen ? (
          <div data-testid="mobile-menu" data-show-theme={showTheme} data-theme={themeData?.selectedTheme}>
            Mobile Menu
          </div>
        ) : null}
      </>
    )
  },
}))

// Mock ThemeProvider context
jest.mock('@/components/providers', () => ({
  useThemeContext: jest.fn(() => ({
    theme: 'system',
    resolvedTheme: 'dark',
    setTheme: jest.fn(),
    isLoading: false,
  })),
  ThemeProvider: function MockThemeProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  },
}))

import { Navigation } from '@/components/navigation/Navigation'
import { ApiNavigationNavigationDocument, LanguageCode, DirectionEnum, Language } from '@/lib/generated/types.gen'

describe('Navigation', () => {
  beforeEach(() => {
    mockSetSearchExpanded.mockClear()
    // Reset useNavigationResize mock to default values
    const { useNavigationResize } = jest.requireMock<typeof import('@/lib/navigation')>('@/lib/navigation')
    ;(useNavigationResize as jest.Mock).mockReturnValue({
      navRef: { current: null },
      visibility: {
        startGroupMode: 'full' as const,
        endGroupMode: 'full' as const,
        collapsedItems: [] as string[],
        searchMaxWidth: 256,
        navWidth: 1024,
      },
      isSearchExpanded: false,
      setSearchExpanded: mockSetSearchExpanded,
      setStartHasIcons: jest.fn(),
      setEndHasIcons: jest.fn(),
      isReady: true,
    })
  })

  const mockData = {
    logo: { url: '/images/logo.png', alternativeText: 'Logo' },
    brandButton: { url: '/', label: { text: 'TheGreenBrother', icon: { name: 'eco' } } },
    homeButton: { url: '/', label: { text: 'Home' } },
    productsMenu: {
      menuButton: { url: '/products', label: { text: 'Products' } },
      categories: [],
    },
    blogButton: { url: '/blog', label: { text: 'Blog' } },
    aboutButton: { url: '/about', label: { text: 'About' } },
    searchMenu: {
      menuButton: { label: { text: 'Search', icon: { name: 'search' } } },
    },
    themeMenu: {
      menuButton: { label: { text: 'Theme' } },
      themes: [],
    },
    languageMenu: {
      menuButton: { label: { text: 'Language' } },
    },
    loginButton: { url: '/login', label: { text: 'Login' } },
    signUpButton: { url: '/signup', label: { text: 'Sign Up' } },
    profileButton: { url: '/profile', label: { icon: { name: 'person' } } },
    mobileMenuButton: { label: { icon: { name: 'menu' } } },
    mobileMenuCloseButton: { label: { icon: { name: 'close' } } },
  } as unknown as ApiNavigationNavigationDocument

  it('should render navigation component', () => {
    const { container } = render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    // Navigation renders successfully
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render all menus and child components', () => {
    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    // Check that the mocked child components render
    expect(screen.getByTestId('search-menu')).toBeInTheDocument()
    expect(screen.getByTestId('theme-menu')).toBeInTheDocument()
    expect(screen.getByTestId('language-menu')).toBeInTheDocument()
    // NavigationGroup now contains product categories menu
    expect(screen.getByTestId('navigation-group-start')).toBeInTheDocument()
  })

  it('should render search menu', () => {
    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    expect(screen.getByTestId('search-menu')).toBeInTheDocument()
  })

  it('should NOT render search menu when disabled', () => {
    // Default is enableProductSearch=false, or we can explictly set it
    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={false} enableUserProfile={false} />
    )

    expect(screen.queryByTestId('search-menu')).not.toBeInTheDocument()
  })

  it('should render theme menu', () => {
    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    expect(screen.getByTestId('theme-menu')).toBeInTheDocument()
  })

  it('should render language menu', () => {
    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    expect(screen.getByTestId('language-menu')).toBeInTheDocument()
  })

  it('should render with CMS button data', () => {
    const { container } = render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    // Component renders with all defined button links
    const links = container.querySelectorAll('a')
    expect(links.length).toBeGreaterThan(0)
  })

  it('should render mobile menu component', () => {
    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    // Mobile menu component is present (though hidden by default)
    // The actual toggle is handled by the MobileMenu mock
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  })

  it('should render start navigation group with products menu', () => {
    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    // The start NavigationGroup contains nav links including products
    const startGroup = screen.getByTestId('navigation-group-start')
    expect(startGroup).toBeInTheDocument()
    expect(startGroup).toHaveAttribute('data-display-mode', 'full')
  })

  it('should render without languages when not provided', () => {
    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    // Should still render without errors
    expect(screen.getByTestId('language-menu')).toBeInTheDocument()
  })

  it('should render with languages when provided', () => {
    const languages = [
      { code: LanguageCode.EN, name: 'English', displayName: 'English', flag: '/flags/en.png' },
      { code: LanguageCode.IT, name: 'Italian', displayName: 'Italiano', flag: '/flags/it.png' },
    ]

    render(
      <Navigation
        direction={DirectionEnum.LTR}
        data={mockData}
        languages={languages as unknown as Language[]}
        enableUserProfile={false}
      />
    )

    expect(screen.getByTestId('language-menu')).toBeInTheDocument()
  })

  it('should toggle mobile menu when button is clicked', () => {
    const { useNavigationResize } = jest.requireMock<typeof import('@/lib/navigation')>('@/lib/navigation')
    ;(useNavigationResize as jest.Mock).mockReturnValue({
      navRef: { current: null },
      visibility: {
        startGroupMode: 'minimal' as const,
        endGroupMode: 'partial' as const,
        collapsedItems: ['home', 'products', 'blog', 'about'] as string[],
        searchMaxWidth: 256,
        navWidth: 1024,
      },
      setSearchExpanded: mockSetSearchExpanded,
      isReady: true,
    })

    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    const toggleButton = screen.getByTestId('mobile-menu-toggle')

    // Initially mobile menu should not be visible
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()

    // Click to open
    fireEvent.click(toggleButton)

    // Mobile menu should now be visible
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()

    // Click to close
    fireEvent.click(toggleButton)

    // Mobile menu should be hidden again
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  })

  it('should call router.push when language is changed to a different language', () => {
    const { useRouter } = jest.requireMock<typeof import('next/navigation')>('next/navigation')
    const mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })

    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    // Click the button to change to Italian
    const changeLangButton = screen.getByTestId('change-lang-it')
    fireEvent.click(changeLangButton)

    // Should call router.push with the new language path
    expect(mockPush).toHaveBeenCalledWith('/it')
  })

  it('should not call router.push when language is the same as current', () => {
    const { useRouter, usePathname } = jest.requireMock<typeof import('next/navigation')>('next/navigation')
    const mockPush = jest.fn()
    ;(usePathname as jest.Mock).mockReturnValue('/en')
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })

    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    // Click the button to "change" to English (same as current)
    const changeLangButton = screen.getByTestId('change-lang-en')
    fireEvent.click(changeLangButton)

    // Should NOT call router.push since language is the same
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should handle pathname with nested path when changing language', () => {
    const { useRouter, usePathname } = jest.requireMock<typeof import('next/navigation')>('next/navigation')
    const mockPush = jest.fn()
    ;(usePathname as jest.Mock).mockReturnValue('/en/products/123')
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })

    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    // Click the button to change to Italian
    const changeLangButton = screen.getByTestId('change-lang-it')
    fireEvent.click(changeLangButton)

    // Should call router.push with the language prefix replaced
    expect(mockPush).toHaveBeenCalledWith('/it/products/123')
  })

  it('should handle pathname without language prefix', () => {
    const { useRouter, usePathname } = jest.requireMock<typeof import('next/navigation')>('next/navigation')
    const mockPush = jest.fn()
    // A path that doesn't start with a 2-letter language code
    ;(usePathname as jest.Mock).mockReturnValue('/products')
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })

    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    // Click the button to change to Italian - should default to /it
    const changeLangButton = screen.getByTestId('change-lang-it')
    fireEvent.click(changeLangButton)

    // Should call router.push with the new language path
    expect(mockPush).toHaveBeenCalledWith('/it')
  })

  it('should handle root pathname without language prefix', () => {
    const { usePathname } = jest.requireMock<typeof import('next/navigation')>('next/navigation')
    ;(usePathname as jest.Mock).mockReturnValue('/')

    render(
      <Navigation direction={DirectionEnum.LTR} data={mockData} enableProductSearch={true} enableUserProfile={false} />
    )

    // Component should render without errors - getLanguageFromPathname returns LanguageCode.EN as default
    expect(screen.getByTestId('language-menu')).toBeInTheDocument()
  })

  describe('responsive visibility', () => {
    it('should call setSearchExpanded when search expands', () => {
      render(
        <Navigation
          direction={DirectionEnum.LTR}
          data={mockData}
          enableProductSearch={true}
          enableUserProfile={false}
        />
      )

      const expandButton = screen.getByTestId('expand-search')
      fireEvent.click(expandButton)

      expect(mockSetSearchExpanded).toHaveBeenCalledWith(true)
    })

    it('should call setSearchExpanded when search collapses', () => {
      render(
        <Navigation
          direction={DirectionEnum.LTR}
          data={mockData}
          enableProductSearch={true}
          enableUserProfile={false}
        />
      )

      const collapseButton = screen.getByTestId('collapse-search')
      fireEvent.click(collapseButton)

      expect(mockSetSearchExpanded).toHaveBeenCalledWith(false)
    })

    it('should pass showText to ThemeMenu', () => {
      render(
        <Navigation
          direction={DirectionEnum.LTR}
          data={mockData}
          enableProductSearch={true}
          enableUserProfile={false}
        />
      )

      const themeMenu = screen.getByTestId('theme-menu')
      expect(themeMenu).toHaveAttribute('data-show-text', 'true')
    })

    it('should hide nav links when startGroupMode is minimal', () => {
      const { useNavigationResize } = jest.requireMock<typeof import('@/lib/navigation')>('@/lib/navigation')
      ;(useNavigationResize as jest.Mock).mockReturnValue({
        navRef: { current: null },
        visibility: {
          startGroupMode: 'minimal' as const,
          endGroupMode: 'full' as const,
          collapsedItems: ['home', 'products', 'blog', 'about'],
          searchMaxWidth: 256,
          navWidth: 1024,
        },
        setSearchExpanded: mockSetSearchExpanded,
        isSearchExpanded: false,
        isReady: true,
      })

      render(
        <Navigation
          direction={DirectionEnum.LTR}
          data={mockData}
          enableProductSearch={true}
          enableUserProfile={false}
        />
      )

      // NavigationGroup should have minimal display mode
      const startGroup = screen.getByTestId('navigation-group-start')
      expect(startGroup).toHaveAttribute('data-display-mode', 'minimal')
    })

    it('should keep theme menu visible even in minimal mode (never collapses)', () => {
      const { useNavigationResize } = jest.requireMock<typeof import('@/lib/navigation')>('@/lib/navigation')
      ;(useNavigationResize as jest.Mock).mockReturnValue({
        navRef: { current: null },
        visibility: {
          startGroupMode: 'minimal' as const,
          endGroupMode: 'partial' as const,
          collapsedItems: ['home', 'products', 'blog', 'about'], // Note: no 'theme' or 'login'
          searchMaxWidth: 256,
          navWidth: 1024,
        },
        setSearchExpanded: mockSetSearchExpanded,
        isSearchExpanded: false,
        isReady: true,
      })

      render(
        <Navigation
          direction={DirectionEnum.LTR}
          data={mockData}
          enableProductSearch={true}
          enableUserProfile={false}
        />
      )

      // Theme menu should STILL be visible - it never collapses to mobile
      expect(screen.getByTestId('theme-menu')).toBeInTheDocument()
    })

    it('should pass showText=false to ThemeMenu when endGroupMode is partial', () => {
      const { useNavigationResize } = jest.requireMock<typeof import('@/lib/navigation')>('@/lib/navigation')
      ;(useNavigationResize as jest.Mock).mockReturnValue({
        navRef: { current: null },
        visibility: {
          startGroupMode: 'full' as const,
          endGroupMode: 'partial' as const,
          collapsedItems: [] as string[],
          searchMaxWidth: 256,
          navWidth: 1024,
        },
        setSearchExpanded: mockSetSearchExpanded,
        isSearchExpanded: false,
        isReady: true,
      })

      render(
        <Navigation
          direction={DirectionEnum.LTR}
          data={mockData}
          enableProductSearch={true}
          enableUserProfile={false}
        />
      )

      const themeMenu = screen.getByTestId('theme-menu')
      expect(themeMenu).toHaveAttribute('data-show-text', 'false')
    })
  })

  describe('brand text animation', () => {
    it('should show brand text when displayMode is full and search is not expanded', () => {
      const { useNavigationResize } = jest.requireMock<typeof import('@/lib/navigation')>('@/lib/navigation')
      ;(useNavigationResize as jest.Mock).mockReturnValue({
        navRef: { current: null },
        visibility: {
          startGroupMode: 'full' as const,
          endGroupMode: 'full' as const,
          collapsedItems: [] as string[],
          searchMaxWidth: 256,
          navWidth: 1024,
        },
        isSearchExpanded: false,
        isReady: true,
        setSearchExpanded: mockSetSearchExpanded,
      })

      render(
        <Navigation
          direction={DirectionEnum.LTR}
          data={mockData}
          enableProductSearch={true}
          enableUserProfile={false}
        />
      )

      const brandButton = screen.getByTestId('desktop-brand-button')
      // When displayMode !== 'minimal', showText should be true
      expect(brandButton).toHaveAttribute('data-show-text', 'true')
    })

    it('should show brand text when displayMode is minimal even if search is not expanded', () => {
      const { useNavigationResize } = jest.requireMock<typeof import('@/lib/navigation')>('@/lib/navigation')
      ;(useNavigationResize as jest.Mock).mockReturnValue({
        navRef: { current: null },
        visibility: {
          startGroupMode: 'minimal' as const,
          endGroupMode: 'minimal' as const,
          collapsedItems: ['home', 'products', 'blog', 'about'] as string[],
          searchMaxWidth: 256,
          navWidth: 1024,
        },
        isSearchExpanded: false,
        isReady: true,
        setSearchExpanded: mockSetSearchExpanded,
      })

      render(
        <Navigation
          direction={DirectionEnum.LTR}
          data={mockData}
          enableProductSearch={true}
          enableUserProfile={false}
        />
      )

      const brandButton = screen.getByTestId('desktop-brand-button')
      // When minimal mode, showText should be true (text threshold is SEARCH_ONLY)
      expect(brandButton).toHaveAttribute('data-show-text', 'true')
    })

    it('should hide brand text when displayMode is minimal AND search is expanded', () => {
      const { useNavigationResize } = jest.requireMock<typeof import('@/lib/navigation')>('@/lib/navigation')
      ;(useNavigationResize as jest.Mock).mockReturnValue({
        navRef: { current: null },
        visibility: {
          startGroupMode: 'minimal' as const,
          endGroupMode: 'minimal' as const,
          collapsedItems: ['home', 'products', 'blog', 'about'] as string[],
          searchMaxWidth: 256,
          navWidth: 800,
        },
        isSearchExpanded: true,
        isReady: true,
        setSearchExpanded: mockSetSearchExpanded,
      })

      render(
        <Navigation
          direction={DirectionEnum.LTR}
          data={mockData}
          enableProductSearch={true}
          enableUserProfile={false}
        />
      )

      const brandButton = screen.getByTestId('desktop-brand-button')
      // When search is expanded, brand text should be hidden to prevent overlap
      expect(brandButton).toHaveAttribute('data-show-text', 'false')
    })

    it('should show brand text when displayMode is full even if search is expanded', () => {
      const { useNavigationResize } = jest.requireMock<typeof import('@/lib/navigation')>('@/lib/navigation')
      ;(useNavigationResize as jest.Mock).mockReturnValue({
        navRef: { current: null },
        visibility: {
          startGroupMode: 'full' as const,
          endGroupMode: 'full' as const,
          collapsedItems: [] as string[],
          searchMaxWidth: 256,
          navWidth: 1024,
        },
        isSearchExpanded: true,
        isReady: true,
        setSearchExpanded: mockSetSearchExpanded,
      })

      render(
        <Navigation
          direction={DirectionEnum.LTR}
          data={mockData}
          enableProductSearch={true}
          enableUserProfile={false}
        />
      )

      const brandButton = screen.getByTestId('desktop-brand-button')
      // When displayMode is full, there's enough space - brand text stays visible
      expect(brandButton).toHaveAttribute('data-show-text', 'true')
    })
  })

  describe('loading state', () => {
    it('should render with opacity-0 when not ready', () => {
      const { useNavigationResize } = jest.requireMock<typeof import('@/lib/navigation')>('@/lib/navigation')
      ;(useNavigationResize as jest.Mock).mockReturnValue({
        navRef: { current: null },
        visibility: {
          startGroupMode: 'full' as const,
          endGroupMode: 'full' as const,
          collapsedItems: [] as string[],
          searchMaxWidth: 256,
          navWidth: 1024,
        },
        isSearchExpanded: false,
        isReady: false,
        setSearchExpanded: mockSetSearchExpanded,
        setStartHasIcons: jest.fn(),
        setEndHasIcons: jest.fn(),
      })

      const { container } = render(
        <Navigation
          direction={DirectionEnum.LTR}
          data={mockData}
          enableProductSearch={true}
          enableUserProfile={false}
        />
      )

      // The content div should have opacity-0 class when not ready
      const contentDiv = container.querySelector('.opacity-0')
      expect(contentDiv).toBeInTheDocument()

      // Navigation groups should NOT be rendered when not ready
      expect(screen.queryByTestId('navigation-group-start')).not.toBeInTheDocument()
    })
  })
})
