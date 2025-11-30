// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for HomeSections component
 */

import { render, screen } from '@testing-library/react'

import { HomeSections } from '@/components/homepage/HomeSections'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  VariantEnum,
  type ApiBlogPostBlogPostDocument,
  type ApiHomepageHomepageDocument,
  type ApiProductCategoryProductCategoryDocument,
  type ApiProductProductDocument,
} from '@/lib/generated/types.gen'

// Mock all section components
jest.mock('@/components/sections/HeroSection', () => ({
  HeroSection: function MockHeroSection({ data }: { data: { id: number } }) {
    return <div data-testid="hero-section" data-id={data.id} />
  },
}))

jest.mock('@/components/sections/FeaturedProductsSection', () => ({
  FeaturedProductsSection: function MockFeaturedProductsSection({ data }: { data: { id: number } }) {
    return <div data-testid="featured-products-section" data-id={data.id} />
  },
}))

jest.mock('@/components/sections/ProductCategoriesSection', () => ({
  ProductCategoriesSection: function MockProductCategoriesSection({ data }: { data: { id: number } }) {
    return <div data-testid="category-grid-section" data-id={data.id} />
  },
}))

jest.mock('@/components/sections/BrandFeaturesSection', () => ({
  BrandFeaturesSection: function MockBrandFeaturesSection({ data }: { data: { id: number } }) {
    return <div data-testid="feature-grid-section" data-id={data.id} />
  },
}))

jest.mock('@/components/sections/BlogTeaserSection', () => ({
  BlogTeaserSection: function MockBlogTeaserSection({ data }: { data: { id: number } }) {
    return <div data-testid="blog-teaser-section" data-id={data.id} />
  },
}))

jest.mock('@/components/call-to-actions/NewsletterSignupCTA', () => ({
  NewsletterSignupCTA: function MockNewsletterSignupCTA({ data }: { data: { id: number } }) {
    return <div data-testid="newsletter-signup-cta" data-id={data.id} />
  },
}))

jest.mock('@/components/elements', () => ({
  TextBlock: function MockTextBlock({ data }: { data: { id: number } }) {
    return <div data-testid="text-block" data-id={data.id} />
  },
}))

describe('HomeSections', () => {
  const mockSections: ApiHomepageHomepageDocument['sections'] = [
    {
      __component: 'sections.hero',
      id: 1,
      header: {
        alignment: AlignmentEnum.CENTER,
        header: {
          text: 'Hero',
          ariaDescription: 'Hero section',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          icon: 'star',
        },
      },
      image: {
        documentId: 'img-1',
        id: 1,
        name: 'hero.webp',
        url: '/uploads/hero.webp',
        hash: 'hero_abc',
        mime: 'image/webp',
        size: 100,
        provider: 'local',
        publishedAt: '2025-01-01',
      },
      variant: VariantEnum.TEXT_OVER_BACKGROUND,
    },
    {
      __component: 'sections.featured-products',
      id: 2,
      header: {
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
        header: {
          text: 'Products',
          ariaDescription: 'Products section',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          icon: 'shopping_cart',
        },
      },
      viewAllButton: {
        label: { text: 'View All', iconPosition: IconPositionEnum.BEFORE_TEXT, ariaDescription: 'View all' },
        url: '/products',
        openInNewTab: false,
      },
    },
    {
      __component: 'sections.category-grid',
      id: 3,
      header: {
        alignment: AlignmentEnum.CENTER,
        header: {
          text: 'Categories',
          ariaDescription: 'Categories section',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          icon: 'apps',
        },
      },
    },
    {
      __component: 'sections.brand-features-section',
      id: 4,
      showHeader: true,
      headerText: 'Features',
      headerAriaDescription: 'Features section',
      subheaderText: 'Our key features',
      features: [],
    },
    {
      __component: 'sections.blog-teaser',
      id: 5,
      header: {
        alignment: AlignmentEnum.CENTER,
        header: {
          text: 'Blog',
          ariaDescription: 'Blog section',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          icon: 'article',
        },
      },
    },
    {
      __component: 'call-to-actions.newsletter-signup-cta',
      id: 6,
      title: 'Newsletter',
      description: 'Description',
      emailPlaceholder: {
        text: 'Email',
        ariaDescription: 'Email input',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        icon: 'email',
      },
      submitButton: {
        label: { text: 'Submit', iconPosition: IconPositionEnum.BEFORE_TEXT, ariaDescription: 'Submit' },
        url: '#',
        openInNewTab: false,
      },
    },
  ]

  const mockProducts: ApiProductProductDocument[] = []
  const mockCategories: ApiProductCategoryProductCategoryDocument[] = []
  const mockBlogPosts: ApiBlogPostBlogPostDocument[] = []

  it('should render hero section', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[0] ? [mockSections[0]] : []
    render(
      <HomeSections
        direction={DirectionEnum.LTR}
        sections={sections}
        products={mockProducts}
        categories={mockCategories}
        blogPosts={mockBlogPosts}
      />
    )

    const heroSection = screen.getByTestId('hero-section')
    expect(heroSection).toBeInTheDocument()
    expect(heroSection).toHaveAttribute('data-id', '1')
  })

  it('should render featured products section', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[1] ? [mockSections[1]] : []
    render(
      <HomeSections
        direction={DirectionEnum.LTR}
        sections={sections}
        products={mockProducts}
        categories={mockCategories}
        blogPosts={mockBlogPosts}
      />
    )

    const featuredProductsSection = screen.getByTestId('featured-products-section')
    expect(featuredProductsSection).toBeInTheDocument()
    expect(featuredProductsSection).toHaveAttribute('data-id', '2')
  })

  it('should render category grid section', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[2] ? [mockSections[2]] : []
    render(
      <HomeSections
        direction={DirectionEnum.LTR}
        sections={sections}
        products={mockProducts}
        categories={mockCategories}
        blogPosts={mockBlogPosts}
      />
    )

    const categoryGridSection = screen.getByTestId('category-grid-section')
    expect(categoryGridSection).toBeInTheDocument()
    expect(categoryGridSection).toHaveAttribute('data-id', '3')
  })

  it('should render feature grid section', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[3] ? [mockSections[3]] : []
    render(
      <HomeSections
        direction={DirectionEnum.LTR}
        sections={sections}
        products={mockProducts}
        categories={mockCategories}
        blogPosts={mockBlogPosts}
      />
    )

    const featureGridSection = screen.getByTestId('feature-grid-section')
    expect(featureGridSection).toBeInTheDocument()
    expect(featureGridSection).toHaveAttribute('data-id', '4')
  })

  it('should render blog teaser section', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[4] ? [mockSections[4]] : []
    render(
      <HomeSections
        direction={DirectionEnum.LTR}
        sections={sections}
        products={mockProducts}
        categories={mockCategories}
        blogPosts={mockBlogPosts}
      />
    )

    const blogTeaserSection = screen.getByTestId('blog-teaser-section')
    expect(blogTeaserSection).toBeInTheDocument()
    expect(blogTeaserSection).toHaveAttribute('data-id', '5')
  })

  it('should render two column content section (newsletter CTA)', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[5] ? [mockSections[5]] : []
    render(
      <HomeSections
        direction={DirectionEnum.LTR}
        sections={sections}
        products={mockProducts}
        categories={mockCategories}
        blogPosts={mockBlogPosts}
      />
    )

    const twoColumnContentSection = screen.getByTestId('newsletter-signup-cta')
    expect(twoColumnContentSection).toBeInTheDocument()
    expect(twoColumnContentSection).toHaveAttribute('data-id', '6')
  })

  it('should render all sections in order', () => {
    render(
      <HomeSections
        direction={DirectionEnum.LTR}
        sections={mockSections}
        products={mockProducts}
        categories={mockCategories}
        blogPosts={mockBlogPosts}
      />
    )

    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('featured-products-section')).toBeInTheDocument()
    expect(screen.getByTestId('category-grid-section')).toBeInTheDocument()
    expect(screen.getByTestId('feature-grid-section')).toBeInTheDocument()
    expect(screen.getByTestId('blog-teaser-section')).toBeInTheDocument()
    expect(screen.getByTestId('newsletter-signup-cta')).toBeInTheDocument()
  })

  it('should render empty fragment when no sections', () => {
    const { container } = render(
      <HomeSections
        direction={DirectionEnum.LTR}
        sections={[]}
        products={mockProducts}
        categories={mockCategories}
        blogPosts={mockBlogPosts}
      />
    )

    // No section content should be rendered
    expect(container.querySelector('[data-testid]')).not.toBeInTheDocument()
  })

  it('renders correctly without extra props', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[0] ? [mockSections[0]] : []
    render(
      <HomeSections
        direction={DirectionEnum.LTR}
        sections={sections}
        products={mockProducts}
        categories={mockCategories}
        blogPosts={mockBlogPosts}
      />
    )

    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })

  it('should not render unknown section types', () => {
    const sectionsWithUnknown: ApiHomepageHomepageDocument['sections'] = [
      {
        __component: 'sections.unknown' as 'sections.hero',
        id: 999,
        header: {
          alignment: AlignmentEnum.CENTER,
          header: {
            text: 'Unknown',
            ariaDescription: 'Unknown section',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            icon: 'help',
          },
        },
        image: {
          documentId: 'img-1',
          id: 1,
          name: 'unknown.webp',
          url: '/uploads/unknown.webp',
          hash: 'unknown_abc',
          mime: 'image/webp',
          size: 10,
          provider: 'local',
          publishedAt: '2025-01-01',
        },
        variant: VariantEnum.TEXT_OVER_BACKGROUND,
      },
    ]

    const { container } = render(
      <HomeSections
        direction={DirectionEnum.LTR}
        sections={sectionsWithUnknown}
        products={mockProducts}
        categories={mockCategories}
        blogPosts={mockBlogPosts}
      />
    )

    // Unknown section should not render anything
    expect(container.querySelector('[data-testid]')).not.toBeInTheDocument()
  })

  it('should render text-block section', () => {
    const sectionsWithTextBlock: ApiHomepageHomepageDocument['sections'] = [
      {
        __component: 'elements.text-block',
        id: 7,
        header: {
          alignment: AlignmentEnum.LANGUAGE_DIRECTION,
          header: {
            text: 'Text Block',
            ariaDescription: 'Text block section',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            icon: 'text_format',
          },
        },
        content: 'This is text block content',
      },
    ]

    render(
      <HomeSections
        direction={DirectionEnum.LTR}
        sections={sectionsWithTextBlock}
        products={mockProducts}
        categories={mockCategories}
        blogPosts={mockBlogPosts}
      />
    )

    const textBlock = screen.getByTestId('text-block')
    expect(textBlock).toBeInTheDocument()
    expect(textBlock).toHaveAttribute('data-id', '7')
  })
})
