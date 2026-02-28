// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { render, screen } from '@testing-library/react'

import { Breadcrumbs } from '@/components/elements/Breadcrumbs'
import {
  DirectionEnum,
  IconPositionEnum,
  LanguageCode,
  type ApiNavigationNavigationDocument,
} from '@/lib/generated/types.gen'

// Mock ButtonLink and Text components
jest.mock('@/components/elements/ButtonLink', () => ({
  ButtonLink: ({ data, className, direction }: any) => (
    <a href={data.url} className={className} data-testid="crumb-link" data-direction={direction}>
      {data.label?.text}
    </a>
  ),
}))

jest.mock('@/components/elements/Text', () => ({
  Text: ({ text }: any) => <span data-testid="text-component">{text}</span>,
}))

describe('Breadcrumbs', () => {
  const defaultPath = '/en/blog/my-post'

  const mockNavigation: ApiNavigationNavigationDocument = {
    documentId: 'nav-1',
    id: 'nav-1',
    siteTitle: 'Test Site',
    siteDescription: 'Test Description',
    publishedAt: '2024-01-01T00:00:00Z',
    brandButton: {
      url: '/',
      label: { text: 'Brand', ariaDescription: 'Go to brand', iconPosition: IconPositionEnum.BEFORE_TEXT },
      openInNewTab: false,
    },
    homeButton: {
      url: '/en',
      label: { text: 'Home', ariaDescription: 'Go to home', iconPosition: IconPositionEnum.BEFORE_TEXT },
      openInNewTab: false,
    },
    blogButton: {
      url: '/en/blog',
      label: { text: 'Blog', ariaDescription: 'Go to blog', iconPosition: IconPositionEnum.BEFORE_TEXT },
      openInNewTab: false,
    },
    aboutButton: {
      url: '/en/about',
      label: { text: 'About', ariaDescription: 'Go to about', iconPosition: IconPositionEnum.BEFORE_TEXT },
      openInNewTab: false,
    },
    productsMenu: {
      menuButton: {
        url: '/en/products',
        label: { text: 'Products', ariaDescription: 'Go to products', iconPosition: IconPositionEnum.BEFORE_TEXT },
        openInNewTab: false,
      },
    },
  } as ApiNavigationNavigationDocument

  it('should render home crumb and intermediate crumbs as links', () => {
    render(
      <Breadcrumbs
        lang={LanguageCode.EN}
        pathname={defaultPath}
        direction={DirectionEnum.LTR}
        navigation={mockNavigation}
      />
    )

    const links = screen.getAllByTestId('crumb-link')
    expect(links).toHaveLength(2) // Home (root), Blog (intermediate)
    expect(links[0]).toHaveAttribute('href', '/en')
    expect(links[0]).toHaveTextContent('Home')
    expect(links[1]).toHaveAttribute('href', '/en/blog')
    expect(links[1]).toHaveTextContent('Blog')
  })

  it('should render last crumb as text', () => {
    render(
      <Breadcrumbs
        lang={LanguageCode.EN}
        pathname={defaultPath}
        direction={DirectionEnum.LTR}
        navigation={mockNavigation}
      />
    )
    const text = screen.getByTestId('text-component')
    expect(text).toHaveTextContent('My post')
  })

  it('should respect customLastCrumbLabel', () => {
    render(
      <Breadcrumbs
        lang={LanguageCode.EN}
        pathname={defaultPath}
        direction={DirectionEnum.LTR}
        navigation={mockNavigation}
        customLastCrumbLabel={<span data-testid="custom-last">Custom Title</span>}
      />
    )
    expect(screen.getByTestId('custom-last')).toBeInTheDocument()
    expect(screen.queryByTestId('text-component')).not.toBeInTheDocument()
  })

  it('should auto-resolve path correctly', () => {
    const complexPath = '/en/category/sub-category/post'
    render(
      <Breadcrumbs
        lang={LanguageCode.EN}
        pathname={complexPath}
        direction={DirectionEnum.LTR}
        navigation={mockNavigation}
      />
    )

    const links = screen.getAllByTestId('crumb-link')
    expect(links).toHaveLength(3) // Home, Category, Sub Category
    expect(links[1]).toHaveTextContent('Category')
    expect(links[1]).toHaveAttribute('href', '/en/category')
    expect(links[2]).toHaveTextContent('Sub category')
    expect(links[2]).toHaveAttribute('href', '/en/category/sub-category')
  })

  it('should handle root path', () => {
    render(
      <Breadcrumbs lang={LanguageCode.EN} pathname="/en" direction={DirectionEnum.LTR} navigation={mockNavigation} />
    )
    // Only Home crumb, and it is last, so it should be text
    expect(screen.queryByTestId('crumb-link')).not.toBeInTheDocument()
    expect(screen.getByTestId('text-component')).toHaveTextContent('Home')
  })

  it('should handle path without lang prefix if that happens', () => {
    const noLangPath = '/blog/post'
    render(
      <Breadcrumbs
        lang={LanguageCode.EN}
        pathname={noLangPath}
        direction={DirectionEnum.LTR}
        navigation={mockNavigation}
      />
    )
    const links = screen.getAllByTestId('crumb-link')
    expect(links[0]).toHaveAttribute('href', '/en')
  })

  it('should drop "tag" segment from crumbs', () => {
    const tagPath = '/en/blog/tag/my-tag'
    render(
      <Breadcrumbs
        lang={LanguageCode.EN}
        pathname={tagPath}
        direction={DirectionEnum.LTR}
        navigation={mockNavigation}
      />
    )

    const links = screen.getAllByTestId('crumb-link')
    // Expected crumbs: Home -> Blog -> (Tag dropped) -> Last crumb (My tag)
    // Links: Home, Blog
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveTextContent('Home')
    expect(links[1]).toHaveTextContent('Blog')

    // Last element should be text "My tag"
    const text = screen.getByTestId('text-component')
    expect(text).toHaveTextContent('My tag')
  })

  it('renders correctly in RTL', () => {
    const { container } = render(
      <Breadcrumbs
        lang={LanguageCode.HE}
        pathname="/he/blog/post-1"
        direction={DirectionEnum.RTL}
        navigation={mockNavigation}
        customLastCrumbLabel="My Post"
      />
    )

    // Check that chevron icons are rotated
    const chevrons = container.querySelectorAll('.rotate-180')
    expect(chevrons.length).toBeGreaterThan(0)

    // Check that nav has flex-row-reverse for RTL
    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('me-2')

    // Check that ButtonLink receives direction prop
    const links = screen.getAllByTestId('crumb-link')
    links.forEach(link => {
      expect(link).toHaveAttribute('data-direction', DirectionEnum.RTL)
    })
  })

  it('should handle about path correctly', () => {
    render(
      <Breadcrumbs
        navigation={mockNavigation}
        pathname="/en/about"
        lang={LanguageCode.EN}
        direction={DirectionEnum.LTR}
      />
    )

    const links = screen.getAllByTestId('crumb-link')
    expect(links.length).toBeGreaterThan(0)
    // Home should be a link
    expect(links.find(link => link.textContent === 'Home')).toBeDefined()
    // About is the last crumb, so it's text not a link
    const text = screen.getByTestId('text-component')
    expect(text).toHaveTextContent('About')
  })

  it('should handle products path correctly', () => {
    render(
      <Breadcrumbs
        navigation={mockNavigation}
        pathname="/en/products"
        lang={LanguageCode.EN}
        direction={DirectionEnum.LTR}
      />
    )

    const links = screen.getAllByTestId('crumb-link')
    expect(links.length).toBeGreaterThan(0)
    // Home should be a link
    expect(links.find(link => link.textContent === 'Home')).toBeDefined()
    // Products is the last crumb, so it's text not a link
    const text = screen.getByTestId('text-component')
    expect(text).toHaveTextContent('Products')
  })

  it('should handle empty segment (home) correctly', () => {
    const { container } = render(
      <Breadcrumbs navigation={mockNavigation} pathname="/en/" lang={LanguageCode.EN} direction={DirectionEnum.LTR} />
    )

    // When on home page with empty segments, breadcrumbs component should render
    const nav = container.querySelector('nav')
    expect(nav).toBeInTheDocument()
  })
  it('should apply max-width truncation to last crumb', () => {
    render(
      <Breadcrumbs
        lang={LanguageCode.EN}
        pathname={defaultPath}
        direction={DirectionEnum.LTR}
        navigation={mockNavigation}
      />
    )
    const text = screen.getByTestId('text-component')
    const lastCrumbSpan = text.closest('span.truncate')
    expect(lastCrumbSpan).toHaveClass('max-w-48')
    expect(lastCrumbSpan).toHaveClass('sm:max-w-72')
    expect(lastCrumbSpan).toHaveClass('md:max-w-96')
  })

  it('should strip markdown formatting from breadcrumb labels', () => {
    const markdownNavigation = {
      ...mockNavigation,
      blogButton: {
        ...mockNavigation.blogButton,
        label: {
          ...mockNavigation.blogButton.label,
          text: '**Blog**',
        },
      },
    } as ApiNavigationNavigationDocument

    render(
      <Breadcrumbs
        navigation={markdownNavigation}
        pathname="/en/blog"
        lang={LanguageCode.EN}
        direction={DirectionEnum.LTR}
      />
    )

    // Blog is the last crumb, rendered as text — should strip ** markers
    const text = screen.getByTestId('text-component')
    expect(text).toHaveTextContent('Blog')
    expect(text.textContent).not.toContain('**')
  })
})
