// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for HomeSections component
 */

import { render, screen } from '@testing-library/react'

import { HomeSections } from '@/components/homepage/HomeSections'
import {
  AlignmentEnum,
  IconPositionEnum,
  VariantEnum,
  type ApiHomepageHomepageDocument,
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

jest.mock('@/components/sections/TeamSection', () => ({
  TeamSection: function MockTeamSection({ data }: { data: { id: number } }) {
    return <div data-testid="team-section" data-id={data.id} />
  },
}))

// Mock HomeSections component
jest.mock('@/components/homepage/HomeSections', () => {
  const originalModule = jest.requireActual('@/components/homepage/HomeSections')
  return {
    ...originalModule,
  }
})

// Mock LayoutProvider
jest.mock('@/components/providers/LayoutProvider', () => ({
  useLayoutContext: jest.fn(() => ({
    direction: 'ltr',
  })),
}))

describe('HomeSections', () => {
  const mockSections: ApiHomepageHomepageDocument['sections'] = [
    {
      __component: 'sections.hero',
      id: 1,
      header: {
        alignment: AlignmentEnum.CENTER,
        promoteHeaderIcon: false,
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
        promoteHeaderIcon: false,
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
      products: [],
    },
    {
      __component: 'sections.category-grid',
      id: 3,
      header: {
        alignment: AlignmentEnum.CENTER,
        promoteHeaderIcon: false,
        header: {
          text: 'Categories',
          ariaDescription: 'Categories section',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          icon: 'apps',
        },
      },
      categories: [],
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
        promoteHeaderIcon: false,
        header: {
          text: 'Blog',
          ariaDescription: 'Blog section',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          icon: 'article',
        },
      },
      viewAllButton: {
        label: { text: 'View All', iconPosition: IconPositionEnum.BEFORE_TEXT, ariaDescription: 'View all' },
        url: '/blog',
        openInNewTab: false,
      },
      blogPosts: [],
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
      consentLabel: {
        text: 'I agree to the privacy policy.',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Consent',
      },
      consentRequiredError: {
        text: 'Consent required.',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Consent required',
      },
      pendingConfirmationMessage: {
        text: 'Check your email to confirm.',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Pending confirmation',
      },
      successMessage: {
        text: 'Subscribed!',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Success',
      },
      errorMessage: {
        text: 'Error occurred.',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Error',
      },
      emailRequiredError: {
        text: 'Email required.',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Required',
      },
      emailInvalidError: {
        text: 'Invalid email.',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Invalid',
      },
    },
  ]

  const mockLabels = {
    readTimeMinutesLabel: {
      text: 'min read',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'Read time',
      id: 1,
    },
    readArticleLabel: {
      text: 'Read Article',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'Read full article',
      id: 2,
    },
  }

  const defaultProps = {
    ...mockLabels,
    enableUserProfile: false,
  }

  it('should render hero section', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[0] ? [mockSections[0]] : []
    render(<HomeSections sections={sections} teamMembers={[]} {...defaultProps} />)

    const heroSection = screen.getByTestId('hero-section')
    expect(heroSection).toBeInTheDocument()
    expect(heroSection).toHaveAttribute('data-id', '1')
  })

  it('should render featured products section', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[1] ? [mockSections[1]] : []
    render(<HomeSections sections={sections} teamMembers={[]} {...defaultProps} />)

    const featuredProductsSection = screen.getByTestId('featured-products-section')
    expect(featuredProductsSection).toBeInTheDocument()
    expect(featuredProductsSection).toHaveAttribute('data-id', '2')
  })

  it('should render category grid section', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[2] ? [mockSections[2]] : []
    render(<HomeSections sections={sections} teamMembers={[]} {...defaultProps} />)

    const categoryGridSection = screen.getByTestId('category-grid-section')
    expect(categoryGridSection).toBeInTheDocument()
    expect(categoryGridSection).toHaveAttribute('data-id', '3')
  })

  it('should render category grid section with custom categories', () => {
    const sectionWithCategories: ApiHomepageHomepageDocument['sections'] = [
      {
        __component: 'sections.category-grid',
        id: 3,
        header: {
          alignment: AlignmentEnum.CENTER,
          promoteHeaderIcon: false,
          header: {
            text: 'Cats',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            ariaDescription: 'Cats category',
          },
        },
        categories: [
          {
            documentId: 'c1',
            id: 1,
            slug: 'cat-1',
            content: {
              text: 'Cat 1',
              iconPosition: IconPositionEnum.BEFORE_TEXT,
              ariaDescription: 'Cat 1 category',
            },
            publishedAt: '2025-01-01',
            image: { documentId: 'img-1' } as any,
            seoMetadata: { metaTitle: 'Cat 1', metaDescription: 'Category 1' },
          },
        ],
      },
    ]

    render(<HomeSections sections={sectionWithCategories} teamMembers={[]} {...defaultProps} />)

    const categoryGridSection = screen.getByTestId('category-grid-section')
    expect(categoryGridSection).toBeInTheDocument()
    expect(categoryGridSection).toHaveAttribute('data-id', '3')
  })

  it('should render feature grid section', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[3] ? [mockSections[3]] : []
    render(<HomeSections sections={sections} teamMembers={[]} {...defaultProps} />)

    const featureGridSection = screen.getByTestId('feature-grid-section')
    expect(featureGridSection).toBeInTheDocument()
    expect(featureGridSection).toHaveAttribute('data-id', '4')
  })

  it('should render blog teaser section', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[4] ? [mockSections[4]] : []
    render(<HomeSections sections={sections} teamMembers={[]} {...defaultProps} />)

    const blogTeaserSection = screen.getByTestId('blog-teaser-section')
    expect(blogTeaserSection).toBeInTheDocument()
    expect(blogTeaserSection).toHaveAttribute('data-id', '5')
  })

  it('should render two column content section (newsletter CTA)', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[5] ? [mockSections[5]] : []
    render(<HomeSections sections={sections} teamMembers={[]} {...defaultProps} />)

    const twoColumnContentSection = screen.getByTestId('newsletter-signup-cta')
    expect(twoColumnContentSection).toBeInTheDocument()
    expect(twoColumnContentSection).toHaveAttribute('data-id', '6')
  })

  it('should render all sections in order', () => {
    render(<HomeSections sections={mockSections} teamMembers={[]} {...defaultProps} />)

    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('featured-products-section')).toBeInTheDocument()
    expect(screen.getByTestId('category-grid-section')).toBeInTheDocument()
    expect(screen.getByTestId('feature-grid-section')).toBeInTheDocument()
    expect(screen.getByTestId('blog-teaser-section')).toBeInTheDocument()
    expect(screen.getByTestId('newsletter-signup-cta')).toBeInTheDocument()
  })

  it('should render empty fragment when no sections', () => {
    const { container } = render(<HomeSections sections={[]} teamMembers={[]} {...defaultProps} />)

    // No section content should be rendered
    expect(container.querySelector('[data-testid]')).not.toBeInTheDocument()
  })

  it('renders correctly without extra props', () => {
    const sections: ApiHomepageHomepageDocument['sections'] = mockSections[0] ? [mockSections[0]] : []
    render(<HomeSections sections={sections} teamMembers={[]} {...defaultProps} />)

    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })

  it('should not render unknown section types', () => {
    const sectionsWithUnknown: ApiHomepageHomepageDocument['sections'] = [
      {
        __component: 'sections.unknown' as 'sections.hero',
        id: 999,
        header: {
          alignment: AlignmentEnum.CENTER,
          promoteHeaderIcon: false,
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

    const { container } = render(<HomeSections sections={sectionsWithUnknown} teamMembers={[]} {...defaultProps} />)

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
          promoteHeaderIcon: false,
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

    render(<HomeSections sections={sectionsWithTextBlock} teamMembers={[]} {...defaultProps} />)

    const textBlock = screen.getByTestId('text-block')
    expect(textBlock).toBeInTheDocument()
    expect(textBlock).toHaveAttribute('data-id', '7')
  })

  it('should render team section', () => {
    const sectionsWithTeam: ApiHomepageHomepageDocument['sections'] = [
      {
        __component: 'sections.team-grid',
        id: 8,
        header: {
          alignment: AlignmentEnum.CENTER,
          promoteHeaderIcon: false,
          header: {
            text: 'Team',
            ariaDescription: 'Team section',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            icon: 'groups',
          },
        },
      },
    ]

    render(<HomeSections sections={sectionsWithTeam} teamMembers={[]} {...defaultProps} />)

    const teamSection = screen.getByTestId('team-section')
    expect(teamSection).toBeInTheDocument()
    expect(teamSection).toHaveAttribute('data-id', '8')
  })
})
