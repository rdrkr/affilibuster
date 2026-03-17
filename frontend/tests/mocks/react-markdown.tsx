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
  /** Rehype plugins (not used in mock, but allows passing rehype-raw and rehype-sanitize) */
  rehypePlugins?: unknown[]
  /** Custom component renderers */
  components?: {
    /** Custom link renderer */
    a?: (props: { href?: string; children: React.ReactNode }) => React.ReactElement
    /** Custom image renderer */
    img?: (props: { src?: string; alt?: string; title?: string }) => React.ReactElement
    /** Custom code renderer */
    code?: (props: { children?: React.ReactNode }) => React.ReactElement
    /** Custom table renderer */
    table?: (props: { children?: React.ReactNode }) => React.ReactElement
    /** Custom center renderer for centered content */
    center?: (props: { children?: React.ReactNode }) => React.ReactElement
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
 * Check if lines at current position represent a GFM table
 * @param lines - Array of all lines
 * @param startIndex - Current line index
 * @returns boolean indicating if this is a table
 */
const isTable = (lines: string[], startIndex: number): boolean => {
  const line = lines[startIndex]
  const nextLine = lines[startIndex + 1]
  if (!line || !nextLine) return false

  // Table header row must have pipes
  if (!line.includes('|')) return false

  // Separator row must be pipes and dashes (e.g., |---|---|)
  const separatorPattern = /^\|?\s*[-:]+\s*\|/
  return separatorPattern.test(nextLine)
}

/**
 * Parse a GFM table starting at the given index
 * @param lines - Array of all lines
 * @param startIndex - Starting line index
 * @param getKey - Function to get unique keys
 * @returns Object with parsed table element and ending index
 */
const parseTable = (
  lines: string[],
  startIndex: number,
  getKey: () => number
): { element: React.ReactElement; endIndex: number } => {
  let i = startIndex

  // Parse header row
  const headerLine = lines[i] ?? ''
  const headerCells = headerLine
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell !== '')

  i++ // Move past header row
  i++ // Move past separator row

  // Parse body rows
  const bodyRows: string[][] = []
  while (i < lines.length && lines[i]?.includes('|')) {
    const rowLine = lines[i] ?? ''
    const cells = rowLine
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell !== '')
    if (cells.length > 0) {
      bodyRows.push(cells)
    }
    i++
  }

  const element = (
    <table key={getKey()}>
      <thead>
        <tr>
          {headerCells.map((cell, idx) => (
            <th key={idx}>{cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bodyRows.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell, cellIdx) => (
              <td key={cellIdx}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )

  return { element, endIndex: i }
}

/**
 * Simple markdown to HTML converter for testing
 * Supports: headings, paragraphs, lists, bold, italic, code, links, blockquotes, tables (GFM)
 * @param markdown - Markdown string to convert
 * @returns Array of React elements representing the rendered HTML
 */
const markdownToHTML = (markdown: string): React.ReactElement[] => {
  const lines = markdown.split('\n')
  const elements: React.ReactElement[] = []
  let key = 0
  const getKey = () => key++

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

    // Center tags (HTML)
    if (line.trim().startsWith('<center>')) {
      const centerLines: string[] = []
      // Check if it's an inline center tag (single line)
      if (line.includes('</center>')) {
        const inlineContent = line.replace(/<\/?center>/g, '').trim()
        elements.push(<center key={getKey()}>{parseInline(inlineContent)}</center>)
        i++
        continue
      }
      // Multi-line center block
      i++ // Skip opening <center>
      while (i < lines.length && !lines[i]?.trim().startsWith('</center>')) {
        centerLines.push(lines[i] ?? '')
        i++
      }
      i++ // Skip closing </center>
      // Parse the content inside center as markdown
      const innerContent = centerLines.join('\n')
      const innerElements = markdownToHTML(innerContent)
      elements.push(<center key={getKey()}>{innerElements}</center>)
      continue
    }

    // Tables (GFM)
    if (isTable(lines, i)) {
      const { element, endIndex } = parseTable(lines, i, getKey)
      elements.push(element)
      i = endIndex
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
      elements.push(<Tag key={getKey()}>{parseInline(text)}</Tag>)
      i++
      continue
    }

    // Unordered lists
    if (line.startsWith('- ')) {
      const listItems: React.ReactElement[] = []
      while (i < lines.length && lines[i]?.startsWith('- ')) {
        const text = lines[i]?.replace(/^- /, '') ?? ''
        listItems.push(<li key={getKey()}>{parseInline(text)}</li>)
        i++
      }
      elements.push(<ul key={getKey()}>{listItems}</ul>)
      continue
    }

    // Ordered lists
    if (/^\d+\.\s/.test(line)) {
      const listItems: React.ReactElement[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i] ?? '')) {
        const text = lines[i]?.replace(/^\d+\.\s/, '') ?? ''
        listItems.push(<li key={getKey()}>{parseInline(text)}</li>)
        i++
      }
      elements.push(<ol key={getKey()}>{listItems}</ol>)
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
        <pre key={getKey()}>
          <code>{codeLines}</code>
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
        <blockquote key={getKey()}>
          <p>{quoteLines}</p>
        </blockquote>
      )
      continue
    }

    // Paragraphs (default)
    elements.push(<p key={getKey()}>{parseInline(line)}</p>)
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
    const imageMatch = /^!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/.exec(remaining)
    if (imageMatch) {
      const altFromMatch = imageMatch[1] ?? ''
      const alt = altFromMatch !== '' ? altFromMatch : undefined
      const src = imageMatch[2] ?? ''
      const title = imageMatch[3]

      nodes.push(<img key={key++} src={src} alt={alt} title={title} />)
      remaining = remaining.slice(imageMatch[0].length)
      continue
    }

    // Raw HTML Images (<img src="..." alt="..." width="..." height="..." />)
    const rawImgMatch = /^<img\s+(.*?)>/.exec(remaining)
    if (rawImgMatch) {
      const attrsStr = rawImgMatch[1] ?? ''
      const getAttr = (name: string) => {
        const regex = new RegExp(`${name}=['"](.*?)['"]`)
        return regex.exec(attrsStr)?.[1]
      }
      const src = getAttr('src') ?? ''
      const alt = getAttr('alt')
      const title = getAttr('title')
      const width = getAttr('width')
      const height = getAttr('height')

      nodes.push(<img key={key++} src={src} alt={alt} title={title} width={width} height={height} />)
      remaining = remaining.slice(rawImgMatch[0].length)
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
  if (components?.a || components?.img || components?.code || components?.table || components?.center) {
    /**
     * Replace link, image, code, table, and center elements with custom components
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
        const imgProps = element.props as Record<string, unknown>
        return ImageComponent(imgProps)
      }

      // Replace code
      if (element.type === 'code' && components.code) {
        const CodeComponent = components.code as unknown as (props: ElementProps) => React.ReactElement
        const props = element.props as ElementProps
        return CodeComponent({
          children: props.children,
        })
      }

      // Replace table
      if (element.type === 'table' && components.table) {
        const TableComponent = components.table as unknown as (props: ElementProps) => React.ReactElement
        const props = element.props as ElementProps
        const tableElement = TableComponent({
          children: props.children,
        })
        // Clone with key to avoid React warnings
        return React.cloneElement(tableElement, { key: element.key })
      }

      // Replace center
      if (element.type === 'center' && components.center) {
        const CenterComponent = components.center as unknown as (props: ElementProps) => React.ReactElement
        const props = element.props as ElementProps

        // Recursively process children BEFORE passing to custom component
        let processedChildren = props.children
        if (props.children) {
          processedChildren = React.Children.map(props.children, child => {
            if (React.isValidElement(child)) {
              return replaceCustomElements(child)
            }
            return child
          })
        }

        const centerElement = CenterComponent({
          children: processedChildren,
        })
        // Clone with key to avoid React warnings
        return React.cloneElement(centerElement, { key: element.key })
      }

      // Recursively replace in children
      const props = element.props as ElementProps
      if (props.children) {
        const newChildren = React.Children.map(props.children, child => {
          if (
            React.isValidElement(child) &&
            (child.type === 'a' ||
              child.type === 'img' ||
              child.type === 'code' ||
              child.type === 'table' ||
              child.type === 'center')
          ) {
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
