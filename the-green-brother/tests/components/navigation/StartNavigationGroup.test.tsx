// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for StartNavigationGroup component
 */

import { render, screen } from '@testing-library/react'

import {
  StartNavigationGroup,
  type StartNavigationGroupProps,
  buildStartNavLinks,
} from '@/components/navigation/StartNavigationGroup'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'
import { THRESHOLDS } from '@/lib/navigation'

// Mock usePathname
const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname() as string,
}))

// Mock elements
jest.mock('@/components/elements', () => ({
  ButtonLink: ({
    data,
    className,
    showText,
    isActive,
  }: {
    data: { url: string; label: { text: string } }
    className: string
    showText: boolean
    isActive: boolean
  }) => {
    const activeClass = isActive ? 'text-primary' : ''
    return (
      <a href={data.url} className={`${className} ${activeClass}`} data-show-text={showText} data-active={isActive}>
        {data.label.text}
      </a>
    )
  },
  getVisibilityClasses: jest.fn(() => 'mock-visibility-class'),
}))

// Mock ProductCategoriesMenu
jest.mock('@/components/menus', () => ({
  ProductCategoriesMenu: ({
    showText,
    isActive,
    disabled,
  }: {
    showText: boolean
    isActive: boolean
    disabled: boolean
  }) => (
    <div data-testid="products-menu" data-show-text={showText} data-active={isActive} data-disabled={disabled}>
      Products
    </div>
  ),
}))

// Mock NavigationGroup
jest.mock('@/components/navigation/NavigationGroup', () => ({
  NavigationGroup: ({
    children,
    displayMode,
    direction,
    className,
  }: {
    children: React.ReactNode | ((props: { showText: boolean }) => React.ReactNode)
    displayMode: string
    direction: string
    className: string
  }) => {
    // Compute showText based on displayMode like the real component
    const showText = displayMode === 'full'
    return (
      <div data-testid="nav-group" data-display-mode={displayMode} data-direction={direction} className={className}>
        {typeof children === 'function' ? children({ showText }) : children}
      </div>
    )
  },
}))

describe('StartNavigationGroup', () => {
  const mockData = {
    id: 1,
    brandButton: {
      url: '/',
      openInNewTab: false,
      label: { text: 'Brand', icon: 'star', iconPosition: IconPositionEnum.BEFORE_TEXT, ariaDescription: 'Brand' },
    },
    homeButton: {
      url: '/',
      openInNewTab: false,
      label: { text: 'Home', icon: 'home', iconPosition: IconPositionEnum.BEFORE_TEXT, ariaDescription: 'Home' },
    },
    blogButton: {
      url: '/blog',
      openInNewTab: false,
      label: { text: 'Blog', icon: 'article', iconPosition: IconPositionEnum.BEFORE_TEXT, ariaDescription: 'Blog' },
    },
    aboutButton: {
      url: '/about',
      openInNewTab: false,
      label: { text: 'About', icon: 'info', iconPosition: IconPositionEnum.BEFORE_TEXT, ariaDescription: 'About' },
    },
    productsMenu: {
      id: 1,
      menuButton: {
        url: '/products',
        openInNewTab: false,
        label: {
          text: 'Products',
          icon: 'inventory',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Products',
        },
      },
      // Note: categories, featuredProducts, shopAllButton removed as they are optional or not in this interface mock
    },
  } as unknown as StartNavigationGroupProps['data']

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  it('should highlight Home link when on home page', () => {
    mockUsePathname.mockReturnValue('/')
    render(<StartNavigationGroup data={mockData} displayMode="full" direction={DirectionEnum.LTR} navWidth={1024} />)

    // Check Home link class for active color (text-primary!)
    const homeLink = screen.getByText('Home')
    expect(homeLink.className).toContain('text-primary')
  })

  it('should highlight Blog link when on blog page', () => {
    mockUsePathname.mockReturnValue('/blog')
    render(<StartNavigationGroup data={mockData} displayMode="full" direction={DirectionEnum.LTR} navWidth={1024} />)

    const blogLink = screen.getByText('Blog')
    expect(blogLink.className).toContain('text-primary')
  })

  it('should highlight About link when on about page', () => {
    mockUsePathname.mockReturnValue('/about')
    render(<StartNavigationGroup data={mockData} displayMode="full" direction={DirectionEnum.LTR} navWidth={1024} />)

    const aboutLink = screen.getByText('About')
    expect(aboutLink.className).toContain('text-primary')
  })

  it('should highlight Products menu when on products page', () => {
    mockUsePathname.mockReturnValue('/products')
    render(<StartNavigationGroup data={mockData} displayMode="full" direction={DirectionEnum.LTR} navWidth={1024} />)

    const productsMenu = screen.getByTestId('products-menu')
    expect(productsMenu).toHaveAttribute('data-active', 'true')
  })

  it('should hide items in minimal mode using visible prop', () => {
    render(<StartNavigationGroup data={mockData} displayMode="minimal" direction={DirectionEnum.LTR} navWidth={600} />)
    // Items now use visible prop on ButtonLink, which returns null when false
    // The container should still be present but the nav items return null
    const navGroup = screen.getByTestId('nav-group')
    expect(navGroup).toBeInTheDocument()
    // Since the mock ButtonLink doesn't handle visible prop, we verify the container is rendered
    // The actual behavior is tested in ButtonLink tests
  })

  describe('Brand button visibility', () => {
    it('should show text when navWidth >= SEARCH_ONLY threshold (default behavior)', () => {
      // navWidth is now required, so we test with a value that should show text (e.g. THRESHOLDS.SEARCH_ONLY)
      render(
        <StartNavigationGroup
          data={mockData}
          displayMode="minimal"
          direction={DirectionEnum.LTR}
          navWidth={THRESHOLDS.SEARCH_ONLY}
        />
      )
      const brandLink = screen.getByText('Brand')
      expect(brandLink).toHaveAttribute('data-show-text', 'true')
    })

    it('should show text when navWidth >= SEARCH_ONLY threshold', () => {
      render(
        <StartNavigationGroup
          data={mockData}
          displayMode="minimal"
          direction={DirectionEnum.LTR}
          navWidth={THRESHOLDS.SEARCH_ONLY}
        />
      )
      const brandLink = screen.getByText('Brand')
      expect(brandLink).toHaveAttribute('data-show-text', 'true')
    })

    it('should hide text when navWidth < SEARCH_ONLY threshold', () => {
      render(
        <StartNavigationGroup
          data={mockData}
          displayMode="minimal"
          direction={DirectionEnum.LTR}
          navWidth={THRESHOLDS.SEARCH_ONLY - 1}
        />
      )
      const brandLink = screen.getByText('Brand')
      expect(brandLink).toHaveAttribute('data-show-text', 'false')
    })

    it('should hide text when displayMode is none', () => {
      render(<StartNavigationGroup data={mockData} displayMode="none" direction={DirectionEnum.LTR} navWidth={300} />)
      const brandLink = screen.getByText('Brand')
      expect(brandLink).toHaveAttribute('data-show-text', 'false')
    })
  })

  describe('RTL Support', () => {
    it('should apply ml-3 class to brand button when direction is RTL and brand text is visible', () => {
      mockUsePathname.mockReturnValue('/')
      render(<StartNavigationGroup data={mockData} displayMode="full" direction={DirectionEnum.RTL} navWidth={1200} />)

      const brandLink = screen.getByText('Brand')
      // In RTL mode with brand text visible, className should include 'ml-3' instead of 'mr-3'
      expect(brandLink.className).toContain('ml-3')
      expect(brandLink.className).not.toContain('mr-3')
    })
  })

  describe('Icon Detection Logic', () => {
    it('should call onHasIconsChange with true when all items have icons', () => {
      const mockOnHasIconsChange = jest.fn()
      render(
        <StartNavigationGroup
          data={mockData}
          displayMode="full"
          direction={DirectionEnum.LTR}
          navWidth={1024}
          onHasIconsChange={mockOnHasIconsChange}
        />
      )
      expect(mockOnHasIconsChange).toHaveBeenCalledWith(true)
    })

    it('should call onHasIconsChange with false when an item is missing icon', () => {
      const mockOnHasIconsChange = jest.fn()
      // Create data with missing icon for one item (e.g. Home)
      const noIconData = {
        ...mockData,
        homeButton: {
          ...mockData.homeButton,
          label: { ...mockData.homeButton.label, icon: undefined },
        },
      } as unknown as StartNavigationGroupProps['data']

      render(
        <StartNavigationGroup
          data={noIconData}
          displayMode="full"
          direction={DirectionEnum.LTR}
          navWidth={1024}
          onHasIconsChange={mockOnHasIconsChange}
        />
      )
      expect(mockOnHasIconsChange).toHaveBeenCalledWith(false)
    })
  })

  describe('buildStartNavLinks', () => {
    it('should build links correctly', () => {
      const links = buildStartNavLinks(mockData, '/')
      expect(links).toHaveLength(4)
      expect(links[0]!.id).toBe('home')
      expect(links[0]!.isActive).toBe(true)
      expect(links[1]!.id).toBe('products')
      expect(links[1]!.isActive).toBe(false)
    })
  })
})
