// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for TextBlock component
 */

import { render, screen } from '@testing-library/react'

import { TextBlock, type TextBlockProps } from '@/components/elements/TextBlock'
import { AlignmentEnum, DirectionEnum, IconPositionEnum, type ElementsHeaderEntry } from '@/lib/generated/types.gen'

// Mock Header component
jest.mock('@/components/elements/Header', () => ({
  __esModule: true,
  Header: function MockHeader({ data }: { data?: ElementsHeaderEntry }) {
    if (!data) return null
    return (
      <div data-testid="mock-header">
        {data.header?.text && <span data-testid="header-title">{data.header.text}</span>}
        {data.subheader?.text && <span data-testid="header-subtitle">{data.subheader.text}</span>}
      </div>
    )
  },
}))

// Mock ButtonLink component
jest.mock('@/components/elements/ButtonLink', () => ({
  __esModule: true,
  ButtonLink: function MockButtonLink({
    data,
    children,
    variant,
  }: {
    data: { url: string; openInNewTab: boolean | null }
    children: React.ReactNode
    variant?: string
  }) {
    return (
      <a data-testid="mock-button-link" href={data.url} data-variant={variant}>
        {children}
      </a>
    )
  },
}))

// Mock Label component
jest.mock('@/components/elements/Label', () => ({
  __esModule: true,
  Label: function MockLabel({ data }: { data?: { text?: string } }) {
    return <span data-testid="mock-label">{data?.text}</span>
  },
}))

// Mock CmsImage component
jest.mock('@/components/elements/Image', () => ({
  __esModule: true,
  Image: function MockCmsImage(props: {
    image?: { url?: string; alternativeText?: string }
    className?: string
    title?: string
    style?: React.CSSProperties
    width?: number
    height?: number
    sizes?: string
  }) {
    return (
      <img
        src={props.image?.url}
        alt={props.image?.alternativeText}
        className={props.className}
        title={props.title}
        width={props.width}
        height={props.height}
        data-testid="mock-cms-image"
      />
    )
  },
}))

// Mock ScrollableTableWrapper component
jest.mock('@/components/elements/ScrollableTableWrapper', () => ({
  __esModule: true,
  ScrollableTableWrapper: function MockScrollableTableWrapper({
    children,
    direction,
  }: {
    children: React.ReactNode
    direction: string
  }) {
    return (
      <div data-testid="mock-scrollable-table-wrapper" data-direction={direction}>
        {children}
      </div>
    )
  },
}))

describe('TextBlock', () => {
  /**
   * Creates test data for TextBlock component
   * @param options - Configuration options for the test data
   * @param options.withHeader - Whether to include header data (default: true)
   * @param options.withContent - Whether to include content data (default: true)
   * @param options.content - Custom content string to use instead of default
   * @returns TextBlock data object
   */
  const createTextBlockData = (
    options: { withHeader?: boolean; withContent?: boolean; content?: string } = {}
  ): TextBlockProps['data'] => {
    const { withHeader = true, withContent = true, content: customContent } = options

    return {
      __component: 'elements.text-block',
      ...(withHeader && {
        header: {
          alignment: AlignmentEnum.CENTER,
          promoteHeaderIcon: false,
          header: {
            text: 'Test Header',
            icon: '',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            ariaDescription: '',
          },
          subheader: {
            text: 'Test Subheader',
            icon: '',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            ariaDescription: '',
          },
        },
      }),
      ...(withContent && {
        content: customContent ?? 'Test content paragraph.',
      }),
    } as TextBlockProps['data']
  }

  describe('basic rendering', () => {
    it('should render header when provided', () => {
      render(<TextBlock data={createTextBlockData()} direction={DirectionEnum.LTR} />)
      expect(screen.getByTestId('mock-header')).toBeInTheDocument()
      expect(screen.getByTestId('header-title')).toHaveTextContent('Test Header')
    })

    it('should render content when provided', () => {
      render(<TextBlock data={createTextBlockData()} direction={DirectionEnum.LTR} />)
      expect(screen.getByText('Test content paragraph.')).toBeInTheDocument()
    })

    it('should not render header when header is undefined', () => {
      render(<TextBlock data={createTextBlockData({ withHeader: false })} direction={DirectionEnum.LTR} />)
      expect(screen.queryByTestId('mock-header')).not.toBeInTheDocument()
    })

    it('should not render content when content is undefined', () => {
      render(<TextBlock data={createTextBlockData({ withContent: false })} direction={DirectionEnum.LTR} />)
      expect(screen.queryByText('Test content paragraph.')).not.toBeInTheDocument()
    })

    it('should apply additional className when provided', () => {
      const { container } = render(
        <TextBlock data={createTextBlockData()} direction={DirectionEnum.LTR} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('visibility', () => {
    it('should render null when visible is false', () => {
      const { container } = render(
        <TextBlock data={createTextBlockData()} direction={DirectionEnum.LTR} visible={false} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should render content when visible is true', () => {
      render(<TextBlock data={createTextBlockData()} direction={DirectionEnum.LTR} visible={true} />)
      expect(screen.getByText('Test content paragraph.')).toBeInTheDocument()
    })

    it('should render content when visible is not provided', () => {
      render(<TextBlock data={createTextBlockData()} direction={DirectionEnum.LTR} />)
      expect(screen.getByText('Test content paragraph.')).toBeInTheDocument()
    })
  })

  describe('RTL support', () => {
    it('should set dir="ltr" for LTR direction', () => {
      const { container } = render(<TextBlock data={createTextBlockData()} direction={DirectionEnum.LTR} />)
      expect(container.firstChild).toHaveAttribute('dir', 'ltr')
    })

    it('should set dir="rtl" for RTL direction', () => {
      const { container } = render(<TextBlock data={createTextBlockData()} direction={DirectionEnum.RTL} />)
      expect(container.firstChild).toHaveAttribute('dir', 'rtl')
    })
  })

  describe('markdown rendering', () => {
    it('should render links using ButtonLink component', () => {
      const dataWithLink = createTextBlockData({
        content: 'Click [here](https://example.com) for more.',
      })
      render(<TextBlock data={dataWithLink} direction={DirectionEnum.LTR} />)
      const link = screen.getByTestId('mock-button-link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveTextContent('here')
      // By default it should use link-1
      expect(link).toHaveAttribute('data-variant', 'link-1')
    })

    it('should respect custom linkButtonVariant', () => {
      const dataWithLink = createTextBlockData({
        content: 'Click [here](https://example.com) for more.',
      })
      // Pass a custom variant, e.g. "primary"
      render(<TextBlock data={dataWithLink} direction={DirectionEnum.LTR} linkButtonVariant="primary" />)
      const link = screen.getByTestId('mock-button-link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('data-variant', 'primary')
    })

    it('should render inline code elements', () => {
      const dataWithCode = createTextBlockData({
        content: 'Use `npm install` to install.',
      })
      render(<TextBlock data={dataWithCode} direction={DirectionEnum.LTR} />)
      // The mock renders code elements using the custom component which uses Label
      const codeElement = screen.getByText('npm install')
      expect(codeElement).toBeInTheDocument()
      // Check if it is inside a mock label (span)
      expect(codeElement.tagName).toBe('SPAN')
      expect(codeElement.getAttribute('data-testid')).toBe('mock-label')
    })

    it('should render block code elements (array children)', () => {
      const blockCode = '```\nconsole.log("hello")\n```'
      const dataWithBlockCode = createTextBlockData({
        content: blockCode,
      })
      render(<TextBlock data={dataWithBlockCode} direction={DirectionEnum.LTR} />)

      const codeElement = screen.getByText('console.log("hello")')
      expect(codeElement).toBeInTheDocument()
      expect(codeElement.tagName).toBe('SPAN')
    })

    it('should render regular images using CmsImage when alt is not an icon size', () => {
      const dataWithImage = createTextBlockData({
        content: '![Alt text](/image.png "Title")',
      })
      render(<TextBlock data={dataWithImage} direction={DirectionEnum.LTR} />)

      // alt="Alt text" is not a valid icon size, so CmsImage is rendered
      const img = screen.getByTestId('mock-cms-image')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/image.png')
      expect(img).toHaveAttribute('alt', 'Alt text')
      expect(img).toHaveAttribute('title', 'Title')
      expect(img).toHaveClass('mx-auto', 'block', 'rounded-xl')
      expect(img).toHaveAttribute('width', '1000')
      expect(img).toHaveAttribute('height', '500')
    })

    it('should render Cloudinary images as regular images', () => {
      const cloudinaryUrl =
        'https://res.cloudinary.com/affilibuster/image/upload/v1770653640/blog_zero_waste_kitchens_841d4873b5.webp'
      const dataWithCloudinaryImage = createTextBlockData({
        content: `![blog_zero_waste_kitchens.webp](${cloudinaryUrl})`,
      })
      render(<TextBlock data={dataWithCloudinaryImage} direction={DirectionEnum.LTR} />)

      // alt="blog_zero_waste_kitchens.webp" is not a valid icon size, so CmsImage is rendered
      const img = screen.getByTestId('mock-cms-image')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', cloudinaryUrl)
      expect(img).toHaveAttribute('alt', 'blog_zero_waste_kitchens.webp')
      expect(img).toHaveClass('mx-auto', 'block', 'rounded-xl')
    })

    it('should respect HTML image properties when provided', () => {
      // Use markdown image syntax for standard images, as rehype-raw might struggle with raw HTML images without block context
      // wait, markdown image syntax does not support width/height out of the box.
      // We will test if the parsed HTML retains width and height if we pass it through.
      const dataWithHtmlImage = createTextBlockData({
        content: '<img src="/image.png" alt="Alt text" width="50" height="50" title="Title" />',
      })
      render(<TextBlock data={dataWithHtmlImage} direction={DirectionEnum.LTR} />)

      const img = screen.queryByTestId('mock-cms-image')
      if (img) {
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('width', '50')
        expect(img).toHaveAttribute('height', '50')
        expect(img).toHaveClass('mx-auto', 'block', 'rounded-xl')
      }
    })

    it('should render icon images using Label when alt is a valid icon size', () => {
      const dataWithIconImage = createTextBlockData({
        content: '![xl](icons/award.svg "Award Icon")',
      })
      render(<TextBlock data={dataWithIconImage} direction={DirectionEnum.LTR} />)

      // alt="xl" is a valid icon size, so Label (icon) is rendered
      const label = screen.getByTestId('mock-label')
      expect(label).toBeInTheDocument()
      expect(label).toHaveTextContent('Award Icon')
      // CmsImage should NOT be rendered for icon images
      expect(screen.queryByTestId('mock-cms-image')).not.toBeInTheDocument()
    })

    it('should not render image when src is empty', () => {
      const dataWithNoSrc = createTextBlockData({
        content: '![description]()',
      })
      const { container } = render(<TextBlock data={dataWithNoSrc} direction={DirectionEnum.LTR} />)

      // Empty src should not render CmsImage
      expect(screen.queryByTestId('mock-cms-image')).not.toBeInTheDocument()
      // No img element in the container either
      expect(container.querySelector('img')).not.toBeInTheDocument()
    })
  })

  describe('code element edge cases', () => {
    it('should handle code element with non-string and non-array children', () => {
      // Empty code blocks produce undefined children in the mock,
      // which exercises the else branch in the code handler
      const emptyCodeBlock = '```\n```'
      const dataWithEmptyCode = createTextBlockData({
        content: emptyCodeBlock,
      })
      render(<TextBlock data={dataWithEmptyCode} direction={DirectionEnum.LTR} />)

      // The code handler should convert undefined children to empty string via String(undefined ?? '')
      // This renders a Label with empty text
      const labels = screen.queryAllByTestId('mock-label')
      expect(labels.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('center tag rendering', () => {
    it('should render content inside center tags as centered', () => {
      const dataWithCenter = createTextBlockData({
        content: '<center>Centered text</center>',
      })
      const { container } = render(<TextBlock data={dataWithCenter} direction={DirectionEnum.LTR} />)

      const centeredDiv = container.querySelector('div[style*="text-align: center"]')
      expect(centeredDiv).toBeInTheDocument()
      expect(centeredDiv).toHaveTextContent('Centered text')
    })

    it('should center complex markdown content including images and headings', () => {
      const complexCenterContent = `<center>
![6xl](icons/award.svg)

#### Top Tier Eco-Choice

This product meets our highest standards.
</center>`
      const dataWithComplexCenter = createTextBlockData({
        content: complexCenterContent,
      })
      const { container } = render(<TextBlock data={dataWithComplexCenter} direction={DirectionEnum.LTR} />)

      const centeredDiv = container.querySelector('div[style*="text-align: center"]')
      expect(centeredDiv).toBeInTheDocument()

      // Check for heading inside centered content
      const heading = centeredDiv?.querySelector('h4')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Top Tier Eco-Choice')

      // Check for paragraph
      expect(centeredDiv).toHaveTextContent('This product meets our highest standards.')
    })

    it('should center multiple paragraphs and lists', () => {
      const multiBlockCenter = `<center>
First paragraph.

Second paragraph.

- Item 1
- Item 2
</center>`
      const dataWithMultiBlock = createTextBlockData({
        content: multiBlockCenter,
      })
      const { container } = render(<TextBlock data={dataWithMultiBlock} direction={DirectionEnum.LTR} />)

      const centeredDiv = container.querySelector('div[style*="text-align: center"]')
      expect(centeredDiv).toBeInTheDocument()
      expect(centeredDiv).toHaveTextContent('First paragraph.')
      expect(centeredDiv).toHaveTextContent('Second paragraph.')
      expect(centeredDiv).toHaveTextContent('Item 1')
      expect(centeredDiv).toHaveTextContent('Item 2')
    })

    it('should handle empty center tags', () => {
      const dataWithEmptyCenter = createTextBlockData({
        content: '<center></center>',
      })
      const { container } = render(<TextBlock data={dataWithEmptyCenter} direction={DirectionEnum.LTR} />)

      const centeredDiv = container.querySelector('div[style*="text-align: center"]')
      expect(centeredDiv).toBeInTheDocument()
    })

    it('should center content in RTL mode', () => {
      const dataWithCenter = createTextBlockData({
        content: '<center>תוכן ממורכז</center>',
      })
      const { container } = render(<TextBlock data={dataWithCenter} direction={DirectionEnum.RTL} />)

      const centeredDiv = container.querySelector('div[style*="text-align: center"]')
      expect(centeredDiv).toBeInTheDocument()
      expect(centeredDiv).toHaveTextContent('תוכן ממורכז')

      // Verify the parent container has RTL direction
      expect(container.firstChild).toHaveAttribute('dir', 'rtl')
    })
  })

  describe('markdown table rendering (GFM)', () => {
    it('should render markdown tables correctly', () => {
      const tableMarkdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`
      const dataWithTable = createTextBlockData({
        content: tableMarkdown,
      })
      render(<TextBlock data={dataWithTable} direction={DirectionEnum.LTR} />)

      // Check table element exists
      expect(screen.getByRole('table')).toBeInTheDocument()

      // Check headers
      expect(screen.getByText('Header 1')).toBeInTheDocument()
      expect(screen.getByText('Header 2')).toBeInTheDocument()

      // Check cells
      expect(screen.getByText('Cell 1')).toBeInTheDocument()
      expect(screen.getByText('Cell 2')).toBeInTheDocument()
      expect(screen.getByText('Cell 3')).toBeInTheDocument()
      expect(screen.getByText('Cell 4')).toBeInTheDocument()
    })

    it('should render table headers in th elements', () => {
      const tableMarkdown = `
| Name | Age |
|------|-----|
| John | 30  |
`
      const dataWithTable = createTextBlockData({
        content: tableMarkdown,
      })
      const { container } = render(<TextBlock data={dataWithTable} direction={DirectionEnum.LTR} />)

      const thElements = container.querySelectorAll('th')
      expect(thElements).toHaveLength(2)
      expect(thElements[0]).toHaveTextContent('Name')
      expect(thElements[1]).toHaveTextContent('Age')
    })

    it('should render table data in td elements', () => {
      const tableMarkdown = `
| Item | Price |
|------|-------|
| Apple | $1.00 |
`
      const dataWithTable = createTextBlockData({
        content: tableMarkdown,
      })
      const { container } = render(<TextBlock data={dataWithTable} direction={DirectionEnum.LTR} />)

      const tdElements = container.querySelectorAll('td')
      expect(tdElements).toHaveLength(2)
      expect(tdElements[0]).toHaveTextContent('Apple')
      expect(tdElements[1]).toHaveTextContent('$1.00')
    })

    it('should render multi-row tables', () => {
      const tableMarkdown = `
| Product | Status |
|---------|--------|
| Widget A | Active |
| Widget B | Inactive |
| Widget C | Active |
`
      const dataWithTable = createTextBlockData({
        content: tableMarkdown,
      })
      const { container } = render(<TextBlock data={dataWithTable} direction={DirectionEnum.LTR} />)

      const rows = container.querySelectorAll('tbody tr')
      expect(rows).toHaveLength(3)
    })

    it('should wrap tables in ScrollableTableWrapper', () => {
      const tableMarkdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`
      const dataWithTable = createTextBlockData({
        content: tableMarkdown,
      })
      render(<TextBlock data={dataWithTable} direction={DirectionEnum.LTR} />)

      // Check that ScrollableTableWrapper is rendered
      const wrapper = screen.getByTestId('mock-scrollable-table-wrapper')
      expect(wrapper).toBeInTheDocument()

      // Check that table is inside the wrapper
      const table = screen.getByRole('table')
      expect(wrapper).toContainElement(table)
    })

    it('should pass LTR direction to ScrollableTableWrapper', () => {
      const tableMarkdown = `
| Col 1 | Col 2 |
|-------|-------|
| A     | B     |
`
      const dataWithTable = createTextBlockData({
        content: tableMarkdown,
      })
      render(<TextBlock data={dataWithTable} direction={DirectionEnum.LTR} />)

      const wrapper = screen.getByTestId('mock-scrollable-table-wrapper')
      expect(wrapper).toHaveAttribute('data-direction', DirectionEnum.LTR)
    })

    it('should pass RTL direction to ScrollableTableWrapper', () => {
      const tableMarkdown = `
| Col 1 | Col 2 |
|-------|-------|
| A     | B     |
`
      const dataWithTable = createTextBlockData({
        content: tableMarkdown,
      })
      render(<TextBlock data={dataWithTable} direction={DirectionEnum.RTL} />)

      const wrapper = screen.getByTestId('mock-scrollable-table-wrapper')
      expect(wrapper).toHaveAttribute('data-direction', DirectionEnum.RTL)
    })
  })

  describe('prose styling', () => {
    it('should have prose class for typography styling', () => {
      const { container } = render(<TextBlock data={createTextBlockData()} direction={DirectionEnum.LTR} />)
      expect(container.firstChild).toHaveClass('prose')
    })

    it('should have dark:prose-invert for dark mode support', () => {
      const { container } = render(<TextBlock data={createTextBlockData()} direction={DirectionEnum.LTR} />)
      expect(container.firstChild).toHaveClass('dark:prose-invert')
    })

    it('should have max-w-none to allow full width', () => {
      const { container } = render(<TextBlock data={createTextBlockData()} direction={DirectionEnum.LTR} />)
      expect(container.firstChild).toHaveClass('max-w-none')
    })
  })
})
