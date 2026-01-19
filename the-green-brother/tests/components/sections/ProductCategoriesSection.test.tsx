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

    expect(screen.getByRole('heading', { level: 3, name: 'Shop by Category' })).toBeInTheDocument()
  })

  it('should render subheader when provided', () => {
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={mockCategories} />
    )

    expect(screen.getByText('Find what you need by category')).toBeInTheDocument()
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

    expect(screen.queryByText('Find what you need by category')).not.toBeInTheDocument()
  })

  it('should render all categories', () => {
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={mockCategories} />
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Fashion')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
  })

  it('should render category links with correct href', () => {
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={mockCategories} />
    )

    const homeLink = screen.getByRole('link', { name: /Home category/i })
    expect(homeLink).toHaveAttribute('href', '/products?category=home')

    const fashionLink = screen.getByRole('link', { name: /Fashion category/i })
    expect(fashionLink).toHaveAttribute('href', '/products?category=fashion')

    const techLink = screen.getByRole('link', { name: /Tech category/i })
    expect(techLink).toHaveAttribute('href', '/products?category=tech')
  })

  it('should render category icons', () => {
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={mockCategories} />
    )

    const icons = screen.getAllByTestId('mock-icon')
    expect(icons).toHaveLength(3)
    expect(icons[0]).toHaveAttribute('data-icon', 'home')
    expect(icons[1]).toHaveAttribute('data-icon', 'styler')
    expect(icons[2]).toHaveAttribute('data-icon', 'bolt')
  })

  it('should not render when categories array is empty', () => {
    const { container } = render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={[]} />
    )

    expect(container.querySelector('section')).not.toBeInTheDocument()
  })

  it('should have correct aria-label on section', () => {
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={mockCategories} />
    )

    const section = screen.getByRole('region', { name: 'Product categories section' })
    expect(section).toBeInTheDocument()
  })

  it('should have correct aria-label on category links', () => {
    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={mockCategories} />
    )

    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('aria-label', 'Home category')
    expect(links[1]).toHaveAttribute('aria-label', 'Fashion category')
    expect(links[2]).toHaveAttribute('aria-label', 'Tech category')
  })

  it('should skip categories without content', () => {
    const categoriesWithNull: ApiProductCategoryProductCategoryDocument[] = [
      ...mockCategories,
      {
        documentId: 'cat-4',
        id: 4,
        slug: 'invalid',
        publishedAt: '2025-01-01',
      } as ApiProductCategoryProductCategoryDocument,
    ]

    render(
      <ProductCategoriesSection direction={DirectionEnum.LTR} data={mockSectionData} categories={categoriesWithNull} />
    )

    // Should still render the 3 valid categories
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Fashion')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
  })
})
