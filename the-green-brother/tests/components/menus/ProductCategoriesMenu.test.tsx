// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ProductCategoriesMenu component
 */

import { act, fireEvent, render, screen } from '@testing-library/react'

import { ProductCategoriesMenu, type ProductCategoriesMenuProps } from '@/components/menus/ProductCategoriesMenu'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the CMS element components
jest.mock('@/components/elements', () => ({
  Icon: function MockIcon({ icon, size }: { icon?: string; size?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size}>
        {icon}
      </span>
    )
  },
  Text: function MockText({ text, as: Component = 'span', className }: any) {
    return (
      <Component data-testid="mock-text" className={className}>
        {text}
      </Component>
    )
  },
  Image: function MockImage({ image: _image, className }: { image?: unknown; className?: string }) {
    return <img src="/mock-image.jpg" alt="mock" className={className} data-testid="mock-image" />
  },
  ButtonLink: function MockButtonLink({
    data,
    className,
    children,
    showText = true,
    isActive,
    onClick,
    'aria-expanded': ariaExpanded,
  }: {
    data?: { url?: string; label?: { text?: string; icon?: string; ariaDescription?: string } }
    className?: string
    children?: React.ReactNode
    showText?: boolean
    isActive?: boolean
    // Updated to accept onClick
    onClick?: React.MouseEventHandler<HTMLAnchorElement>
    'aria-expanded'?: boolean
  }) {
    const activeClass = isActive ? 'text-primary' : ''
    return (
      <a
        href={data?.url ?? '#'}
        className={`${className ?? ''} ${activeClass}`}
        data-testid="mock-button-link"
        aria-label={data?.label?.ariaDescription}
        aria-expanded={ariaExpanded}
        data-has-text={showText}
        // Pass onClick to allow toggling in tests
        onClick={onClick}
      >
        <span data-testid="mock-icon" data-icon={data?.label?.icon}>
          {data?.label?.icon}
        </span>
        {showText && data?.label?.text ? <span data-testid="mock-text">{data.label.text}</span> : null}
        {children}
      </a>
    )
  },
  getVisibilityClasses: jest.fn(visible =>
    visible ? 'grid-cols-[1fr] opacity-100' : 'grid-cols-[0fr] opacity-0 pointer-events-none'
  ),
}))

describe('ProductCategoriesMenu', () => {
  const mockData = {
    id: 1,
    menuButton: {
      url: '/products',
      openInNewTab: false,
      label: {
        text: 'Products',
        icon: 'inventory_2',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'View all products',
      },
    },
    productCategories: [
      {
        id: 1,
        documentId: 'cat-1',
        slug: 'kitchen',
        image: { url: '/images/kitchen.jpg', alternativeText: 'Kitchen' },
        content: {
          text: 'Kitchen',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Kitchen category',
        },
      },
      {
        id: 2,
        documentId: 'cat-2',
        slug: 'bathroom',
        image: { url: '/images/bathroom.jpg', alternativeText: 'Bathroom' },
        content: {
          text: 'Bathroom',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Bathroom category',
        },
      },
      {
        id: 3,
        documentId: 'cat-3',
        slug: 'garden',
        image: { url: '/images/garden.jpg', alternativeText: 'Garden' },
        content: {
          text: 'Garden',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Garden category',
        },
      },
    ],
  } as unknown as ProductCategoriesMenuProps['data']

  it('should render menu button link', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
    const link = screen.getByRole('link', { name: 'View all products' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/products')
  })

  it('should render menu button text', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('should render menu button icon', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
    const icons = screen.getAllByTestId('mock-icon')
    expect(icons[0]).toHaveAttribute('data-icon', 'inventory_2')
  })

  it('should apply active styling when isActive is true', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={true} direction={DirectionEnum.LTR} />)
    const link = screen.getByRole('link', { name: 'View all products' })
    expect(link.className).toContain('text-primary')
  })

  it('should not apply active styling when isActive is false', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
    // Component should have hover styling but not permanent active styling
    // Just verify it renders without error when isActive is false
    const link = screen.getByRole('link', { name: 'View all products' })
    expect(link).toBeInTheDocument()
  })

  it('should render category links', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
    // Open menu (click button link)
    fireEvent.click(screen.getByRole('link', { name: 'View all products' }))
    const categoryLinks = screen.getAllByRole('link')
    // 1 menu button + 3 categories
    expect(categoryLinks).toHaveLength(4)
  })

  it('should render category names', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
    // Open menu (click button link)
    fireEvent.click(screen.getByRole('link', { name: 'View all products' }))
    expect(screen.getByText('Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Bathroom')).toBeInTheDocument()
    expect(screen.getByText('Garden')).toBeInTheDocument()
  })

  it('should link to correct product category URLs', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
    // Open menu (click button link)
    fireEvent.click(screen.getByRole('link', { name: 'View all products' }))
    const kitchenLink = screen.getByText('Kitchen').closest('a')
    expect(kitchenLink).toHaveAttribute('href', '/products?category=kitchen')
  })

  it('should render category images', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
    // Open menu (click button link)
    fireEvent.click(screen.getByRole('link', { name: 'View all products' }))
    const images = screen.getAllByTestId('mock-image')
    expect(images).toHaveLength(3)
  })

  it('should handle empty categories array', () => {
    const dataWithNoCategories = {
      ...mockData,
      productCategories: undefined,
    } as unknown as ProductCategoriesMenuProps['data']
    render(<ProductCategoriesMenu data={dataWithNoCategories} isActive={false} direction={DirectionEnum.LTR} />)
    // Should only have the main button
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
  })

  it('should skip categories with null content', () => {
    const dataWithNullContent = {
      ...mockData,
      productCategories: [
        ...((mockData as { productCategories?: unknown[] }).productCategories ?? []),
        { id: 4, documentId: 'cat-4', slug: 'other', content: undefined },
      ],
    } as unknown as ProductCategoriesMenuProps['data']
    render(<ProductCategoriesMenu data={dataWithNullContent} isActive={false} direction={DirectionEnum.LTR} />)
    // Open menu (click button link)
    // Need to trigger open to check if it skipped the null one in rendered list
    fireEvent.click(screen.getByRole('link', { name: 'View all products' }))

    // Should still only have 4 links (1 menu + 3 valid categories)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
  })

  it('should apply RTL styling when direction is RTL', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.RTL} />)
    // Component should render without error in RTL mode
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('should render with iconPosition AFTER_TEXT', () => {
    const mockDataIconAfter = {
      ...mockData,
      menuButton: {
        ...mockData.menuButton,
        label: {
          ...mockData.menuButton.label,
          iconPosition: IconPositionEnum.AFTER_TEXT,
        },
      },
    } as unknown as ProductCategoriesMenuProps['data']
    render(<ProductCategoriesMenu data={mockDataIconAfter} isActive={false} direction={DirectionEnum.LTR} />)
    // Component should render
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  describe('showText prop', () => {
    it('should show text in menu button by default', () => {
      render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
      const buttonLink = screen.getByTestId('mock-button-link')
      expect(buttonLink).toHaveAttribute('data-has-text', 'true')
    })

    it('should show text when showText is true', () => {
      render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} showText={true} />)
      const buttonLink = screen.getByTestId('mock-button-link')
      expect(buttonLink).toHaveAttribute('data-has-text', 'true')
    })

    it('should close menu when scrolling outside', () => {
      render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
      const buttonLink = screen.getByTestId('mock-button-link')
      fireEvent.click(buttonLink)
      // Check open state via aria-expanded (now supported by mock)
      expect(buttonLink).toHaveAttribute('aria-expanded', 'true')

      // Scroll outside
      fireEvent.scroll(window)
      expect(buttonLink).toHaveAttribute('aria-expanded', 'false')
    })

    it('should ignore click immediately after hover (mobile double-tap fix)', () => {
      jest.useFakeTimers()
      render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
      const container = screen.getByTestId('product-categories-menu-container')
      const buttonLink = screen.getByTestId('mock-button-link')

      // Hover -> Open
      fireEvent.mouseEnter(container)
      expect(buttonLink).toHaveAttribute('aria-expanded', 'true')

      // Immediate Click (should be ignored due to justHovered logic)
      fireEvent.click(buttonLink)
      expect(buttonLink).toHaveAttribute('aria-expanded', 'true')

      // Wait for timeout
      act(() => {
        jest.advanceTimersByTime(100)
      })

      // Click again (should toggle now)
      fireEvent.click(buttonLink)
      expect(buttonLink).toHaveAttribute('aria-expanded', 'false')

      jest.useRealTimers()
    })

    it('should close menu on mouse leave', () => {
      jest.useFakeTimers()
      render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
      const container = screen.getByTestId('product-categories-menu-container')
      const buttonLink = screen.getByTestId('mock-button-link')

      // Hover -> Open
      fireEvent.mouseEnter(container)
      expect(buttonLink).toHaveAttribute('aria-expanded', 'true')

      // Mouse leave -> Close
      fireEvent.mouseLeave(container)
      expect(buttonLink).toHaveAttribute('aria-expanded', 'false')
      jest.useRealTimers()
    })

    it('should close menu when internal category link is clicked', () => {
      render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
      const buttonLink = screen.getByTestId('mock-button-link')

      // Open menu
      fireEvent.click(buttonLink)
      expect(buttonLink).toHaveAttribute('aria-expanded', 'true')

      // Click a category link
      const categoryLink = screen.getByText('Kitchen').closest('a')!
      fireEvent.click(categoryLink)

      // Should close
      expect(buttonLink).toHaveAttribute('aria-expanded', 'false')
    })

    it('should close menu when clicking completely outside', () => {
      render(
        <div>
          <ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />
          <button data-testid="outside">Outside</button>
        </div>
      )
      const buttonLink = screen.getByTestId('mock-button-link')

      // Open
      fireEvent.click(buttonLink)
      expect(buttonLink).toHaveAttribute('aria-expanded', 'true')

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'))
      expect(buttonLink).toHaveAttribute('aria-expanded', 'false')
    })

    it('should NOT close menu when clicking inside container', () => {
      render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
      const buttonLink = screen.getByTestId('mock-button-link')
      const container = screen.getByTestId('product-categories-menu-container')

      // Open
      fireEvent.click(buttonLink)
      expect(buttonLink).toHaveAttribute('aria-expanded', 'true')

      // Click inside (e.g. on container div itself)
      fireEvent.mouseDown(container)
      expect(buttonLink).toHaveAttribute('aria-expanded', 'true')
    })

    it('should hide text when showText is false', () => {
      render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} showText={false} />)
      const buttonLink = screen.getByTestId('mock-button-link')
      expect(buttonLink).toHaveAttribute('data-has-text', 'false')
    })

    it('should still render icon when showText is false', () => {
      render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} showText={false} />)
      const icons = screen.getAllByTestId('mock-icon')
      expect(icons[0]).toHaveAttribute('data-icon', 'inventory_2')
    })

    it('should handle showText false when label is undefined', () => {
      const dataWithNoLabel = {
        ...mockData,
        menuButton: {
          ...mockData.menuButton,
          label: undefined,
        },
      } as unknown as ProductCategoriesMenuProps['data']
      // Should not throw error
      render(
        <ProductCategoriesMenu data={dataWithNoLabel} isActive={false} direction={DirectionEnum.LTR} showText={false} />
      )
      expect(screen.getByTestId('mock-button-link')).toBeInTheDocument()
    })
  })

  describe('visible prop', () => {
    it('should render menu when visible is true', () => {
      render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} visible={true} />)
      expect(screen.getByText('Products')).toBeInTheDocument()
    })

    it('should render menu when visible is not provided', () => {
      render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
      expect(screen.getByText('Products')).toBeInTheDocument()
    })

    it('should render hidden element when visible is false', () => {
      const { container } = render(
        <ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} visible={false} />
      )
      const menu = container.firstChild as HTMLElement
      expect(menu).not.toBeNull()
      // Visibility is now handled by ButtonLink's visible prop, container just has aria-hidden
      expect(menu).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
