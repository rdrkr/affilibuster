// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Navigation component
 */

import { fireEvent, render, screen } from '@testing-library/react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ alt, src }: { alt: string; src: string }) {
    // eslint-disable-next-line @next/next/no-img-element
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

// Mock CMS elements
jest.mock('@/components/elements', () => ({
  CMSIcon: function MockCMSIcon({ icon }: { icon?: { name?: string } }) {
    return <span data-testid="cms-icon">{icon?.name}</span>
  },
  CMSText: function MockCMSText({ text }: { text?: string }) {
    return <span>{text}</span>
  },
  resolveIcon: jest.fn((icon: { name?: string } | undefined) => (icon?.name ?? 'default') as string),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ButtonLink: function MockButtonLink(props: any) {
    const { children, data, className } = props
    const ariaLabel = props['aria-label'] ?? data?.label?.ariaDescription
    return (
      <a href={data?.url} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    )
  },
}))

// Mock menus
jest.mock('@/components/menus', () => ({
  LanguageMenu: function MockLanguageMenu({ onLanguageChange }: { onLanguageChange?: (lang: CodeEnum) => void }) {
    return (
      <div data-testid="language-menu">
        <button data-testid="change-lang-it" onClick={() => onLanguageChange?.(CodeEnum.IT)}>
          Change to Italian
        </button>
        <button data-testid="change-lang-en" onClick={() => onLanguageChange?.(CodeEnum.EN)}>
          Change to English
        </button>
      </div>
    )
  },
  ProductCategoriesMenu: function MockProductCategoriesMenu() {
    return <div data-testid="product-categories-menu">Product Categories</div>
  },
  SearchMenu: function MockSearchMenu() {
    return <div data-testid="search-menu">Search</div>
  },
  ThemeMenu: function MockThemeMenu() {
    return <div data-testid="theme-menu">Theme</div>
  },
}))

// Mock MobileMenu
jest.mock('@/components/navigation/MobileMenu', () => ({
  MobileMenu: function MockMobileMenu({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
    return (
      <>
        <button data-testid="mobile-menu-toggle" onClick={onToggle}>
          Toggle
        </button>
        {isOpen ? <div data-testid="mobile-menu">Mobile Menu</div> : null}
      </>
    )
  },
}))

import { Navigation } from '@/components/navigation/Navigation'
import { ApiNavigationNavigationDocument, CodeEnum, DirectionEnum, Language } from '@/lib/generated/types.gen'

describe('Navigation', () => {
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
    searchButton: { label: { text: 'Search' } },
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
    const { container } = render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

    // Navigation renders successfully
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render all menus and child components', () => {
    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

    // Check that the mocked child components render
    expect(screen.getByTestId('search-menu')).toBeInTheDocument()
    expect(screen.getByTestId('theme-menu')).toBeInTheDocument()
    expect(screen.getByTestId('language-menu')).toBeInTheDocument()
    expect(screen.getByTestId('product-categories-menu')).toBeInTheDocument()
  })

  it('should render search menu', () => {
    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

    expect(screen.getByTestId('search-menu')).toBeInTheDocument()
  })

  it('should render theme menu', () => {
    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

    expect(screen.getByTestId('theme-menu')).toBeInTheDocument()
  })

  it('should render language menu', () => {
    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

    expect(screen.getByTestId('language-menu')).toBeInTheDocument()
  })

  it('should render with CMS button data', () => {
    const { container } = render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

    // Component renders with all defined button links
    const links = container.querySelectorAll('a')
    expect(links.length).toBeGreaterThan(0)
  })

  it('should render mobile menu component', () => {
    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

    // Mobile menu component is present (though hidden by default)
    // The actual toggle is handled by the MobileMenu mock
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  })

  it('should render product categories menu', () => {
    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

    expect(screen.getByTestId('product-categories-menu')).toBeInTheDocument()
  })

  it('should render without languages when not provided', () => {
    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

    // Should still render without errors
    expect(screen.getByTestId('language-menu')).toBeInTheDocument()
  })

  it('should render with languages when provided', () => {
    const languages = [
      { code: CodeEnum.EN, name: 'English', displayName: 'English', flag: '/flags/en.png' },
      { code: CodeEnum.IT, name: 'Italian', displayName: 'Italiano', flag: '/flags/it.png' },
    ]

    render(<Navigation direction={DirectionEnum.LTR} data={mockData} languages={languages as unknown as Language[]} />)

    expect(screen.getByTestId('language-menu')).toBeInTheDocument()
  })

  it('should toggle mobile menu when button is clicked', () => {
    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

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

    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

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

    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

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

    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

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

    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

    // Click the button to change to Italian - should default to /it
    const changeLangButton = screen.getByTestId('change-lang-it')
    fireEvent.click(changeLangButton)

    // Should call router.push with the new language path
    expect(mockPush).toHaveBeenCalledWith('/it')
  })

  it('should handle root pathname without language prefix', () => {
    const { usePathname } = jest.requireMock<typeof import('next/navigation')>('next/navigation')
    ;(usePathname as jest.Mock).mockReturnValue('/')

    render(<Navigation direction={DirectionEnum.LTR} data={mockData} />)

    // Component should render without errors - getLanguageFromPathname returns CodeEnum.EN as default
    expect(screen.getByTestId('language-menu')).toBeInTheDocument()
  })

  it('should apply RTL classes when direction is rtl', () => {
    const { container } = render(<Navigation data={mockData} direction={DirectionEnum.RTL} />)

    // Check for flex-row-reverse class on containers
    expect(container.innerHTML).toContain('flex-row-reverse')
  })
})
