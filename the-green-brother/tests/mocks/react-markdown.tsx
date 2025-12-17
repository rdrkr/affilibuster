// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Enhanced mock for react-markdown that actually converts markdown to HTML
 * This allows proper testing of markdown rendering without ESM issues
 */

import React from 'react'

/**
 * Props for ReactMarkdown component
 */
interface ReactMarkdownProps {
  /** Markdown content to render */
  children: string
  /** Remark plugins (not used in mock) */
  remarkPlugins?: unknown[]
  /** Custom component renderers */
  components?: {
    /** Custom link renderer */
    a?: (props: { href?: string; children: React.ReactNode }) => React.ReactElement
    /** Custom image renderer */
    img?: (props: { src?: string; alt?: string; title?: string }) => React.ReactElement
    /** Other custom renderers */
    [key: string]: unknown
  }
}

/**
 * Props interface for element.props
 */
interface ElementProps {
  /** Element href */
  href?: string
  /** Element children */
  children?: React.ReactNode
}

/**
 * Simple markdown to HTML converter for testing
 * Supports: headings, paragraphs, lists, bold, italic, code, links, blockquotes
 * @param markdown - Markdown string to convert
 * @returns Array of React elements representing the rendered HTML
 */
const markdownToHTML = (markdown: string): React.ReactElement[] => {
  const lines = markdown.split('\n')
  const elements: React.ReactElement[] = []
  let key = 0

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (!line) {
      i++
      continue
    }

    // Skip empty lines
    if (line.trim() === '') {
      i++
      continue
    }

    // Headings
    if (line.startsWith('#')) {
      const match = /^#+/.exec(line)
      const level = (match?.[0].length ?? 1) as 1 | 2 | 3 | 4 | 5 | 6
      const text = line.replace(/^#+\s*/, '')
      // Use object lookup to avoid template literal type issues
      const headingTags = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' } as const
      const Tag = headingTags[level]
      elements.push(<Tag key={key++}>{parseInline(text)}</Tag>)
      i++
      continue
    }

    // Unordered lists
    if (line.startsWith('- ')) {
      const listItems: React.ReactElement[] = []
      while (i < lines.length && lines[i]?.startsWith('- ')) {
        const text = lines[i]?.replace(/^- /, '') ?? ''
        listItems.push(<li key={key++}>{parseInline(text)}</li>)
        i++
      }
      elements.push(<ul key={key++}>{listItems}</ul>)
      continue
    }

    // Ordered lists
    if (/^\d+\.\s/.test(line)) {
      const listItems: React.ReactElement[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i] ?? '')) {
        const text = lines[i]?.replace(/^\d+\.\s/, '') ?? ''
        listItems.push(<li key={key++}>{parseInline(text)}</li>)
        i++
      }
      elements.push(<ol key={key++}>{listItems}</ol>)
      continue
    }

    // Code blocks
    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++ // Skip opening ```
      while (i < lines.length && !lines[i]?.startsWith('```')) {
        codeLines.push(lines[i] ?? '')
        i++
      }
      i++ // Skip closing ```
      elements.push(
        <pre key={key++}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      continue
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      const quoteLines: React.ReactNode[] = []
      while (i < lines.length && lines[i]?.startsWith('> ')) {
        const text = lines[i]?.replace(/^> /, '') ?? ''
        quoteLines.push(parseInline(text))
        i++
      }
      elements.push(
        <blockquote key={key++}>
          <p>{quoteLines}</p>
        </blockquote>
      )
      continue
    }

    // Paragraphs (default)
    elements.push(<p key={key++}>{parseInline(line)}</p>)
    i++
  }

  return elements
}

/**
 * Parse inline markdown (bold, italic, code, links)
 * Supports line breaks with remarkBreaks plugin behavior
 * @param text - Inline text to parse
 * @returns Array of React nodes representing the parsed inline content
 */
const parseInline = (text: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold and italic (***text***)
    const boldItalicMatch = /^\*\*\*(.+?)\*\*\*/.exec(remaining)
    if (boldItalicMatch?.[1]) {
      nodes.push(
        <strong key={key++}>
          <em>{boldItalicMatch[1]}</em>
        </strong>
      )
      remaining = remaining.slice(boldItalicMatch[0].length)
      continue
    }

    // Bold (**text**)
    const boldMatch = /^\*\*(.+?)\*\*/.exec(remaining)
    if (boldMatch?.[1]) {
      nodes.push(<strong key={key++}>{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Italic (*text*)
    const italicMatch = /^\*(.+?)\*/.exec(remaining)
    if (italicMatch?.[1]) {
      nodes.push(<em key={key++}>{italicMatch[1]}</em>)
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // Inline code (`code`)
    const codeMatch = /^`(.+?)`/.exec(remaining)
    if (codeMatch?.[1]) {
      nodes.push(<code key={key++}>{codeMatch[1]}</code>)
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // Images (![alt](src "title"))
    const imageMatch = /^!\[(.+?)\]\((.*?)(?:\s+"(.+?)")?\)/.exec(remaining)
    if (imageMatch) {
      const alt = imageMatch[1] ?? ''
      const src = imageMatch[2] ?? ''
      const title = imageMatch[3]
      // eslint-disable-next-line @next/next/no-img-element
      nodes.push(<img key={key++} src={src} alt={alt} title={title} />)
      remaining = remaining.slice(imageMatch[0].length)
      continue
    }

    // Links ([text](url))
    const linkMatch = /^\[(.+?)\]\((.*?)\)/.exec(remaining)
    if (linkMatch) {
      // Pass undefined for empty URLs to test the href ?? '' fallback
      // Using explicit check to convert empty strings to undefined (not just null/undefined)
      const href = linkMatch[2] === '' ? undefined : linkMatch[2]
      const linkText = linkMatch[1] ?? ''
      nodes.push(
        <a key={key++} href={href}>
          {linkText}
        </a>
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // Regular text (up to next special character or end)
    const textMatch = /^[^*`[\n]+/.exec(remaining)
    if (textMatch) {
      nodes.push(textMatch[0])
      remaining = remaining.slice(textMatch[0].length)
      continue
    }

    // Single character fallback
    nodes.push(remaining[0])
    remaining = remaining.slice(1)
  }

  return nodes
}

/**
 * Enhanced ReactMarkdown mock that converts markdown to HTML
 * @param props - Component props
 * @param props.children - Markdown content to render
 * @param props.components - Custom component renderers
 * @returns Rendered markdown as React elements
 */
const ReactMarkdown = ({ children, components }: ReactMarkdownProps): React.ReactElement => {
  const elements = markdownToHTML(children)

  // Replace custom elements if components are provided
  if (components?.a || components?.img) {
    /**
     * Replace link and image elements with custom components
     * @param element - React element to process
     * @returns React element with replaced elements
     */
    const replaceCustomElements = (element: React.ReactElement): React.ReactElement => {
      // Replace links
      if (element.type === 'a' && components.a) {
        const LinkComponent = components.a
        const props = element.props as ElementProps
        return LinkComponent({
          ...(props.href !== undefined ? { href: props.href } : {}),
          children: props.children,
        })
      }

      // Replace images
      if (element.type === 'img' && components.img) {
        const ImageComponent = components.img
        const imgProps = element.props as { src?: string; alt?: string; title?: string }
        return ImageComponent({
          ...(imgProps.src !== undefined ? { src: imgProps.src } : {}),
          ...(imgProps.alt !== undefined ? { alt: imgProps.alt } : {}),
          ...(imgProps.title !== undefined ? { title: imgProps.title } : {}),
        })
      }

      // Recursively replace in children
      const props = element.props as ElementProps
      if (props.children) {
        const newChildren = React.Children.map(props.children, child => {
          if (React.isValidElement(child) && (child.type === 'a' || child.type === 'img')) {
            return replaceCustomElements(child)
          }
          return child
        })
        return React.cloneElement(element, {}, newChildren)
      }

      return element
    }

    const elementsWithCustomComponents = elements.map(el => replaceCustomElements(el))
    return <div key="markdown-wrapper">{elementsWithCustomComponents}</div>
  }

  return <div key="markdown-wrapper">{elements}</div>
}

export default ReactMarkdown
