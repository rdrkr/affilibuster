// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for CMSText component and resolveTextFormatHtml function
 */

import { render, screen } from '@testing-library/react'

import { CMSText, resolveTextFormat, resolveTextFormatHtml } from '@/components/elements/CMSText'

describe('CMSText', () => {
  it('should render null for undefined text', () => {
    const { container } = render(<CMSText text={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render null for null text', () => {
    const { container } = render(<CMSText text={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render null for empty string', () => {
    const { container } = render(<CMSText text="" />)
    expect(container.firstChild).toBeNull()
  })

  it('should render plain text', () => {
    render(<CMSText text="Hello World" />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should render text in span by default', () => {
    render(<CMSText text="Test" />)
    const element = screen.getByText('Test')
    expect(element.tagName).toBe('SPAN')
  })

  it('should render text with custom tag (p)', () => {
    render(<CMSText text="Paragraph" as="p" />)
    const element = screen.getByText('Paragraph')
    expect(element.tagName).toBe('P')
  })

  it('should render text with custom tag (h1)', () => {
    render(<CMSText text="Heading" as="h1" />)
    const element = screen.getByRole('heading', { level: 1 })
    expect(element).toBeInTheDocument()
  })

  it('should render text with custom tag (h2)', () => {
    render(<CMSText text="Heading" as="h2" />)
    const element = screen.getByRole('heading', { level: 2 })
    expect(element).toBeInTheDocument()
  })

  it('should render text with custom tag (div)', () => {
    render(<CMSText text="Content" as="div" />)
    const element = screen.getByText('Content')
    expect(element.tagName).toBe('DIV')
  })

  it('should apply className to container', () => {
    // eslint-disable-next-line better-tailwindcss/no-unregistered-classes
    render(<CMSText text="Styled" className="custom-class" />)
    const element = screen.getByText('Styled')
    expect(element).toHaveClass('custom-class')
  })

  it('should convert **bold** to primary-colored span', () => {
    const { container } = render(<CMSText text="Hello **World**" />)
    const boldSpan = container.querySelector('.text-primary')
    expect(boldSpan).toBeInTheDocument()
    expect(boldSpan).toHaveTextContent('World')
  })

  it('should handle multiple bold sections', () => {
    const { container } = render(<CMSText text="**First** and **Second**" />)
    const boldSpans = container.querySelectorAll('.text-primary')
    expect(boldSpans).toHaveLength(2)
    expect(boldSpans[0]).toHaveTextContent('First')
    expect(boldSpans[1]).toHaveTextContent('Second')
  })

  it('should handle text before and after bold', () => {
    const { container } = render(<CMSText text="Before **Bold** After" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.textContent).toBe('Before Bold After')
  })

  it('should handle only bold text', () => {
    const { container } = render(<CMSText text="**OnlyBold**" />)
    const boldSpan = container.querySelector('.text-primary')
    expect(boldSpan).toHaveTextContent('OnlyBold')
  })

  it('should handle text without bold markers', () => {
    render(<CMSText text="No bold here" />)
    expect(screen.getByText('No bold here')).toBeInTheDocument()
  })

  it('should handle text with asterisks but not bold markers', () => {
    render(<CMSText text="Some * asterisks * here" />)
    expect(screen.getByText('Some * asterisks * here')).toBeInTheDocument()
  })

  it('should handle all heading levels', () => {
    const tags: ('h3' | 'h4' | 'h5' | 'h6')[] = ['h3', 'h4', 'h5', 'h6']
    tags.forEach(tag => {
      const level = parseInt(tag.charAt(1), 10)
      const { unmount } = render(<CMSText text="Heading" as={tag} />)
      expect(screen.getByRole('heading', { level })).toBeInTheDocument()
      unmount()
    })
  })
})

describe('resolveTextFormat', () => {
  it('should return text as-is for empty string', () => {
    const result = resolveTextFormat('')
    expect(result).toBe('')
  })

  it('should handle plain text with no bold markers', () => {
    const result = resolveTextFormat('Plain text')
    expect(result).toBe('Plain text')
  })
})

describe('resolveTextFormatHtml', () => {
  it('should return empty string for undefined', () => {
    expect(resolveTextFormatHtml(undefined)).toBe('')
  })

  it('should return empty string for null', () => {
    expect(resolveTextFormatHtml(null)).toBe('')
  })

  it('should return empty string for empty string', () => {
    expect(resolveTextFormatHtml('')).toBe('')
  })

  it('should return plain text unchanged', () => {
    expect(resolveTextFormatHtml('Hello World')).toBe('Hello World')
  })

  it('should convert **bold** to span with text-primary class', () => {
    expect(resolveTextFormatHtml('Hello **World**')).toBe('Hello <span class="text-primary">World</span>')
  })

  it('should convert multiple bold sections', () => {
    expect(resolveTextFormatHtml('**A** and **B**')).toBe(
      '<span class="text-primary">A</span> and <span class="text-primary">B</span>'
    )
  })

  it('should handle only bold text', () => {
    expect(resolveTextFormatHtml('**OnlyBold**')).toBe('<span class="text-primary">OnlyBold</span>')
  })
})
