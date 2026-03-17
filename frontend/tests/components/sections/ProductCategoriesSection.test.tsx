// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ProductCategoriesSection component
 */

import { render, screen } from '@testing-library/react'

import {
  ProductCategoriesSection,
  type ProductCategoriesSectionProps,
} from '@/components/sections/ProductCategoriesSection'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type ApiProductCategoryProductCategoryDocument,
} from '@/lib/generated/types.gen'

// Mock the CMS element components
jest.mock('@/components/elements', () => ({
  Icon: function MockIcon({ icon, size, className }: { icon?: string; size?: string; className?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
        {icon}
      </span>
    )
  },
  Text: function MockText({ text }: { text?: string }) {
    return <>{text}</>
  },
  Image: function MockImage({
    image,
    fallbackAlt,
  }: {
    image?: { url?: string; alternativeText?: string } | string
    fallbackAlt?: string
  }) {
    // ... logic for image mock ...
    const getImageUrl = () => {
      if (!image) return '/images/placeholder.svg'
      if (typeof image === 'string') return image
      if (!image.url) return '/images/placeholder.svg'
      return image.url.startsWith('http') ? image.url : `https://localhost:1337${image.url}`
    }
    const alt = typeof image === 'object' && image.alternativeText ? image.alternativeText : (fallbackAlt ?? '')

    return <img data-testid="mock-image" src={getImageUrl()} alt={alt} />
  },
  Header: function MockHeader({
    data,
    level = 2,
  }: {
    data: { header?: { text?: string; ariaDescription?: string }; subheader?: { text?: string } }
    level?: number
  }) {
    const Tag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    return (
      <div data-testid="mock-header">
        <Tag>{data.header?.text}</Tag>
        {data.subheader?.text && <p>{data.subheader.text}</p>}
      </div>
    )
  },
  ShortcutsGrid: function MockShortcutsGrid({
    header,
    items,
  }: {
    header: any
    items: { id: number; url: string; label: any }[]
  }) {
    return (
      <div data-testid="shortcuts-grid">
        {header && <div data-testid="grid-header">{header.header?.text}</div>}
        {header?.subheader && <div data-testid="grid-subheader">{header.subheader.text}</div>}
        <div data-testid="grid-items">
          {items.map(item => (
            <div
              key={item.id}
              data-testid="grid-item"
              data-label={item.label?.text}
              data-icon={item.label?.icon}
              data-href={item.url}
            >
              {item.label?.text}
            </div>
          ))}
        </div>
      </div>
    )
  },
}))

describe('ProductCategoriesSection', () => {
  const mockSectionData: ProductCategoriesSectionProps['data'] = {
    __component: 'sections.category-grid',
    id: 1,
    header: {
      alignment: AlignmentEnum.CENTER,
      promoteHeaderIcon: false,
      header: {
        text: 'Shop by Category',
        ariaDescription: 'Product categories section',

        iconPosition: IconPositionEnum.BEFORE_TEXT,
        icon: 'apps',
      },
      subheader: {
        text: 'Find what you need by category',
        ariaDescription: 'Categories description',

        iconPosition: IconPositionEnum.BEFORE_TEXT,
      },
    },
    categories: [],
  }

  const mockCategories: ApiProductCategoryProductCategoryDocument[] = [
    {
      documentId: 'cat-1',
      id: 1,
      slug: 'home',
      publishedAt: '2025-01-01',
      content: {
        text: 'Home',
        ariaDescription: 'Home category',

        iconPosition: IconPositionEnum.BEFORE_TEXT,
        icon: 'home',
      },
      image: {
        documentId: 'img-1',
        id: 1,
        name: 'home.webp',
        url: '/uploads/home.webp',
        hash: 'home_abc',
        mime: 'image/webp',
        size: 20,
        provider: 'local',
        publishedAt: '2025-01-01',
      },
      seoMetadata: {
        metaTitle: 'Home Category',
        metaDescription: 'Home category description',
      },
    },
    {
      documentId: 'cat-2',
      id: 2,
      slug: 'fashion',
      publishedAt: '2025-01-01',
      content: {
        text: 'Fashion',
        ariaDescription: 'Fashion category',

        iconPosition: IconPositionEnum.BEFORE_TEXT,
        icon: 'styler',
      },
      image: {
        documentId: 'img-2',
        id: 2,
        name: 'fashion.webp',
        url: '/uploads/fashion.webp',
        hash: 'fashion_abc',
        mime: 'image/webp',
        size: 20,
        provider: 'local',
        publishedAt: '2025-01-01',
      },
      seoMetadata: {
        metaTitle: 'Fashion Category',
        metaDescription: 'Fashion category description',
      },
    },
    {
      documentId: 'cat-3',
      id: 3,
      slug: 'tech',
      publishedAt: '2025-01-01',
      content: {
        text: 'Tech',
        ariaDescription: 'Tech category',

        iconPosition: IconPositionEnum.BEFORE_TEXT,
        icon: 'bolt',
      },
      image: {
        documentId: 'img-3',
        id: 3,
        name: 'tech.webp',
        url: '/uploads/tech.webp',
        hash: 'tech_abc',
        mime: 'image/webp',
        size: 20,
        provider: 'local',
        publishedAt: '2025-01-01',
      },
      seoMetadata: {
        metaTitle: 'Tech Category',
        metaDescription: 'Tech category description',
      },
    },
  ]

  it('should render section with header text', () => {
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={mockCategories} />
    )

    expect(screen.getByTestId('grid-header')).toHaveTextContent('Shop by Category')
  })

  it('should render subheader when provided', () => {
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={mockCategories} />
    )

    expect(screen.getByTestId('grid-subheader')).toHaveTextContent('Find what you need by category')
  })

  it('should not render subheader when not provided', () => {
    const { subheader: _subheader, ...headerWithoutSubheader } = mockSectionData.header
    const dataWithoutSubheader: ProductCategoriesSectionProps['data'] = {
      ...mockSectionData,
      header: headerWithoutSubheader,
    }

    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={dataWithoutSubheader} categories={mockCategories} />
    )

    expect(screen.queryByTestId('grid-subheader')).not.toBeInTheDocument()
  })

  it('should render all categories', () => {
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={mockCategories} />
    )

    const items = screen.getAllByTestId('grid-item')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Home')
    expect(items[1]).toHaveTextContent('Fashion')
    expect(items[2]).toHaveTextContent('Tech')
  })

  it('should render category links with correct href', () => {
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={mockCategories} />
    )

    const items = screen.getAllByTestId('grid-item')
    expect(items[0]).toHaveAttribute('data-href', '/products?category=home')
    expect(items[1]).toHaveAttribute('data-href', '/products?category=fashion')
    expect(items[2]).toHaveAttribute('data-href', '/products?category=tech')
  })

  it('should pass icon prop correctly', () => {
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={mockCategories} />
    )

    const items = screen.getAllByTestId('grid-item')
    expect(items[0]).toHaveAttribute('data-icon', 'home')
    expect(items[1]).toHaveAttribute('data-icon', 'styler')
    expect(items[2]).toHaveAttribute('data-icon', 'bolt')
  })

  it('should not render when categories array is empty', () => {
    const { container } = render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={[]} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('should handle category without a numeric id', () => {
    const categoryWithoutId = {
      ...mockCategories[0],
      id: undefined,
    } as unknown as ApiProductCategoryProductCategoryDocument
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={[categoryWithoutId]} />
    )

    const items = screen.getAllByTestId('grid-item')
    expect(items).toHaveLength(1)
  })
})
