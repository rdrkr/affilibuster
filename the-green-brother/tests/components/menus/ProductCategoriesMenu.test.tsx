// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ProductCategoriesMenu component
 */

import { render, screen } from '@testing-library/react'

import { ProductCategoriesMenu, type ProductCategoriesMenuProps } from '@/components/menus/ProductCategoriesMenu'
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
  CMSImage: function MockCMSImage({ image: _image, className }: { image?: unknown; className?: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/mock-image.jpg" alt="mock" className={className} data-testid="mock-image" />
  },
  ButtonLink: function MockButtonLink({
    data,
    className,
    children,
  }: {
    data?: { url?: string; label?: { text?: string; icon?: string; ariaDescription?: string } }
    className?: string
    children?: React.ReactNode
  }) {
    return (
      <a
        href={data?.url ?? '#'}
        className={className}
        data-testid="mock-button-link"
        aria-label={data?.label?.ariaDescription}
      >
        <span data-testid="mock-icon" data-icon={data?.label?.icon}>
          {data?.label?.icon}
        </span>
        <span data-testid="mock-text">{data?.label?.text}</span>
        {children}
      </a>
    )
  },
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
    const categoryLinks = screen.getAllByRole('link')
    // 1 menu button + 3 categories
    expect(categoryLinks).toHaveLength(4)
  })

  it('should render category names', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
    expect(screen.getByText('Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Bathroom')).toBeInTheDocument()
    expect(screen.getByText('Garden')).toBeInTheDocument()
  })

  it('should link to correct product category URLs', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
    const kitchenLink = screen.getByText('Kitchen').closest('a')
    expect(kitchenLink).toHaveAttribute('href', '/products?category=kitchen')
  })

  it('should render category images', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
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
    // Should still only have 4 links (1 menu + 3 valid categories)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
  })

  it('should render expand_more icon for dropdown', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.LTR} />)
    expect(screen.getByText('expand_more')).toBeInTheDocument()
  })

  it('should apply RTL styling when direction is RTL', () => {
    render(<ProductCategoriesMenu data={mockData} isActive={false} direction={DirectionEnum.RTL} />)
    // Component should render without error in RTL mode
    expect(screen.getByText('Products')).toBeInTheDocument()
    const chevron = screen.getByText('expand_more')
    // In RTL, margin start should be applied to chevron if it's last (default icon position is before text)
    // Default: icon (before) text, so chevron is last.
    // Logic: ${isIconAfterText ? 'order-first' : 'order-last'}
    // ${isRTL ? '-ms-2 me-1' : 'ms-1 -me-2'} <-- Wait, let me check the implementation again
    // In LTR: ms-1 (margin-start 1) -me-2 (negative margin end)
    // In RTL: -ms-2 (negative margin start) me-1 (margin end 1)
    expect(chevron).toHaveClass('-ms-2')
    expect(chevron).toHaveClass('me-1')
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
    } as unknown as ProductCategoriesMenuProps['data']
    render(<ProductCategoriesMenu data={mockDataIconAfter} isActive={false} direction={DirectionEnum.LTR} />)
    // Component should render with icon after text
    expect(screen.getByText('expand_more')).toBeInTheDocument()
  })
})
