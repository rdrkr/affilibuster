// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for TopicClient component
 */

import { screen } from '@testing-library/react'

// Mock components
jest.mock('@/components/elements', () => ({
  Header: function MockHeader({
    data,
    level = 2,
  }: {
    data: { header?: { text?: string }; subheader?: { text?: string } }
    level?: number
  }) {
    const HeadingTag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    return (
      <div data-testid="mock-header">
        <HeadingTag data-testid="mock-header-title">{data.header?.text}</HeadingTag>
        {data.subheader?.text && <p data-testid="mock-header-subtitle">{data.subheader.text}</p>}
      </div>
    )
  },
}))

jest.mock('@/components/blog', () => ({
  BlogCard: function MockBlogCard({
    post,
    basePath,
  }: {
    post: {
      documentId: string
      slug: string
      content?: { header?: { header?: { text?: string } } }
    }
    basePath?: string
  }) {
    return (
      <a data-testid="mock-blog-card" href={`${basePath ?? '/blog'}/${post.slug}`} className="group">
        <span data-testid="mock-blog-card-title">{post.content?.header?.header?.text}</span>
      </a>
    )
  },
}))

jest.mock('@/components/layout', () => ({
  PageClient: function MockPageClient({ children }: { children: React.ReactNode }) {
    return <div data-testid="mock-page-client">{children}</div>
  },
}))

import TopicClient from '@/app/[lang]/blog/tag/[tag]/TopicClient'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type ApiBlogPostBlogPostDocument,
  type ElementsLabelEntry,
} from '@/lib/generated/types.gen'
import { renderWithLayout } from '../../../../../utils/renderWithLayout'

describe('TopicClient', () => {
  const mockPosts: ApiBlogPostBlogPostDocument[] = [
    {
      documentId: 'post-1',
      slug: 'first-post',
      content: { header: { header: { text: 'First Post' } } },
      tags: [{ tag: { text: 'TestTag' } }],
    } as ApiBlogPostBlogPostDocument,
    {
      documentId: 'post-2',
      slug: 'second-post',
      content: { header: { header: { text: 'Second Post' } } },
      tags: [{ tag: { text: 'TestTag' } }],
    } as ApiBlogPostBlogPostDocument,
  ]

  const mockLabel: ElementsLabelEntry = {
    text: 'Label',
    id: 1,
    iconPosition: IconPositionEnum.BEFORE_TEXT,
    ariaDescription: 'Label',
  }

  it('should render tag header with decoded tag name', () => {
    renderWithLayout(
      <TopicClient tag="TestTag" posts={mockPosts} readTimeMinutesLabel={mockLabel} readArticleLabel={mockLabel} />,
      {
        layoutContext: { direction: DirectionEnum.LTR },
      }
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('TestTag')
  })

  it('should render URL-encoded tag names correctly', () => {
    renderWithLayout(
      <TopicClient
        tag="Eco%20Friendly"
        posts={mockPosts}
        readTimeMinutesLabel={mockLabel}
        readArticleLabel={mockLabel}
      />,
      {
        layoutContext: { direction: DirectionEnum.LTR },
      }
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Eco Friendly')
  })

  it('should render posts grid when posts exist', () => {
    renderWithLayout(
      <TopicClient tag="TestTag" posts={mockPosts} readTimeMinutesLabel={mockLabel} readArticleLabel={mockLabel} />,
      {
        layoutContext: { direction: DirectionEnum.LTR },
      }
    )

    // Expect double the cards due to responsive mobile/desktop markup
    const cards = screen.getAllByTestId('mock-blog-card')
    expect(cards).toHaveLength(4)
    expect(screen.getAllByText('First Post')).toHaveLength(2)
    expect(screen.getAllByText('Second Post')).toHaveLength(2)
  })

  it('should render CMS noItemsFound header when provided and no posts', () => {
    const noItemsFound = {
      header: {
        text: 'Nothing here!',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'No items found',
      },
      alignment: AlignmentEnum.CENTER,
      promoteHeaderIcon: false,
    }

    renderWithLayout(
      <TopicClient
        tag="EmptyTag"
        posts={[]}
        noItemsFound={noItemsFound}
        readTimeMinutesLabel={mockLabel}
        readArticleLabel={mockLabel}
      />,
      {
        layoutContext: { direction: DirectionEnum.LTR },
      }
    )

    expect(screen.getByText('Nothing here!')).toBeInTheDocument()
  })

  it('should render blog cards with correct basePath', () => {
    renderWithLayout(
      <TopicClient tag="TestTag" posts={mockPosts} readTimeMinutesLabel={mockLabel} readArticleLabel={mockLabel} />,
      {
        layoutContext: { direction: DirectionEnum.LTR },
      }
    )

    const firstCard = screen.getAllByTestId('mock-blog-card')[0]
    expect(firstCard).toHaveAttribute('href', '/blog/first-post')
  })
})
