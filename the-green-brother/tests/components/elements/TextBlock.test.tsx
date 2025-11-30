// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for TextBlock component
 */

import { render, screen } from '@testing-library/react'

import { TextBlock, type TextBlockProps } from '@/components/elements/TextBlock'
import { AlignmentEnum, DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the Header component
jest.mock('@/components/elements', () => ({
  Header: function MockHeader({
    data,
    level,
    className,
    headerClassName,
    subheaderClassName,
  }: {
    data?: { header?: { text?: string }; subheader?: { text?: string } }
    level?: number
    className?: string
    headerClassName?: string
    subheaderClassName?: string
  }) {
    return (
      <div
        data-testid="mock-header"
        data-level={level}
        data-classname={className}
        data-header-classname={headerClassName}
        data-subheader-classname={subheaderClassName}
      >
        {data?.header?.text && <h3>{data.header.text}</h3>}
        {data?.subheader?.text && <p>{data.subheader.text}</p>}
      </div>
    )
  },
}))

describe('TextBlock', () => {
  const mockTextBlockData: TextBlockProps['data'] = {
    __component: 'elements.text-block',
    id: 1,
    header: {
      alignment: AlignmentEnum.LANGUAGE_DIRECTION,
      header: {
        text: 'Block Title',
        icon: 'info',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Block title description',
      },
      subheader: {
        text: 'Block subtitle',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Subtitle description',
      },
    },
    content: '<p>Rich text content here</p>',
  }

  it('should render Header component', () => {
    render(<TextBlock direction={DirectionEnum.LTR} data={mockTextBlockData} />)
    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
  })

  it('should render header title', () => {
    render(<TextBlock direction={DirectionEnum.LTR} data={mockTextBlockData} />)
    expect(screen.getByText('Block Title')).toBeInTheDocument()
  })

  it('should render header subtitle', () => {
    render(<TextBlock direction={DirectionEnum.LTR} data={mockTextBlockData} />)
    expect(screen.getByText('Block subtitle')).toBeInTheDocument()
  })

  it('should pass level 3 to Header', () => {
    render(<TextBlock direction={DirectionEnum.LTR} data={mockTextBlockData} />)
    const header = screen.getByTestId('mock-header')
    expect(header).toHaveAttribute('data-level', '3')
  })

  it('should pass correct className to Header', () => {
    render(<TextBlock direction={DirectionEnum.LTR} data={mockTextBlockData} />)
    const header = screen.getByTestId('mock-header')
    expect(header).toHaveAttribute('data-classname', 'mb-4')
  })

  it('should pass headerClassName to Header', () => {
    render(<TextBlock direction={DirectionEnum.LTR} data={mockTextBlockData} />)
    const header = screen.getByTestId('mock-header')
    expect(header).toHaveAttribute('data-header-classname', 'text-2xl text-white')
  })

  it('should pass subheaderClassName to Header', () => {
    render(<TextBlock direction={DirectionEnum.LTR} data={mockTextBlockData} />)
    const header = screen.getByTestId('mock-header')
    expect(header).toHaveAttribute('data-subheader-classname', 'text-text-secondary-dark')
  })

  it('should render content as HTML', () => {
    const { container } = render(<TextBlock direction={DirectionEnum.LTR} data={mockTextBlockData} />)
    const contentDiv = container.querySelector('.prose')
    expect(contentDiv).toBeInTheDocument()
    expect(contentDiv?.innerHTML).toContain('<p>Rich text content here</p>')
  })

  it('should not render content div when content is undefined', () => {
    const dataWithoutContent = { ...mockTextBlockData, content: undefined } as unknown as TextBlockProps['data']
    const { container } = render(<TextBlock direction={DirectionEnum.LTR} data={dataWithoutContent} />)
    expect(container.querySelector('.prose')).not.toBeInTheDocument()
  })

  it('should not render content div when content is empty string', () => {
    const dataWithEmptyContent = { ...mockTextBlockData, content: '' }
    const { container } = render(<TextBlock direction={DirectionEnum.LTR} data={dataWithEmptyContent} />)
    expect(container.querySelector('.prose')).not.toBeInTheDocument()
  })

  it('should apply prose classes to content div', () => {
    const { container } = render(<TextBlock direction={DirectionEnum.LTR} data={mockTextBlockData} />)
    const contentDiv = container.querySelector('.prose')
    expect(contentDiv).toHaveClass('prose')
    expect(contentDiv).toHaveClass('prose-invert')
    expect(contentDiv).toHaveClass('max-w-none')
    expect(contentDiv).toHaveClass('text-text-secondary-dark')
  })

  it('should handle complex HTML content', () => {
    const dataWithComplexContent = {
      ...mockTextBlockData,
      content: '<h2>Heading</h2><p>Paragraph with <strong>bold</strong> text</p><ul><li>Item 1</li></ul>',
    }
    const { container } = render(<TextBlock direction={DirectionEnum.LTR} data={dataWithComplexContent} />)
    const contentDiv = container.querySelector('.prose')
    expect(contentDiv?.querySelector('h2')).toBeInTheDocument()
    expect(contentDiv?.querySelector('strong')).toBeInTheDocument()
    expect(contentDiv?.querySelector('ul')).toBeInTheDocument()
  })

  it('should apply dir="rtl" to content for RTL direction', () => {
    const { container } = render(<TextBlock direction={DirectionEnum.RTL} data={mockTextBlockData} />)
    const contentDiv = container.querySelector('.prose')
    expect(contentDiv).toHaveAttribute('dir', 'rtl')
  })

  it('should apply dir="ltr" to content for LTR direction', () => {
    const { container } = render(<TextBlock direction={DirectionEnum.LTR} data={mockTextBlockData} />)
    const contentDiv = container.querySelector('.prose')
    expect(contentDiv).toHaveAttribute('dir', 'ltr')
  })
})

describe('TextBlock default export', () => {
  it('should export TextBlock as default', async () => {
    const defaultExport = (await import('@/components/elements/TextBlock')).default
    expect(defaultExport).toBe(TextBlock)
  })
})
