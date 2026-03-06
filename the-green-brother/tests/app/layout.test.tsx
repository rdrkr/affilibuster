// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for root layout component.
 * Root layout provides the HTML shell (html, head, body) with fonts and scripts.
 */

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'inter-variable' }),
  Heebo: () => ({ variable: 'heebo-variable' }),
}))

import RootLayout, { generateMetadata } from '@/app/layout'
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'

/** Props shape for the html element returned by RootLayout. */
interface HtmlElementProps {
  lang: string
  dir: string
  suppressHydrationWarning: boolean
  children: React.ReactNode
}

/**
 * Get typed props from the html ReactElement returned by RootLayout.
 * @param element - The ReactElement returned by RootLayout
 * @returns Typed HTML element props
 */
function getHtmlProps(element: ReactElement): HtmlElementProps {
  return element.props as HtmlElementProps
}

/**
 * Extract the body element from the HTML element returned by RootLayout.
 * @param element - The ReactElement returned by RootLayout
 * @returns The body ReactElement
 */
function getBodyElement(element: ReactElement): ReactElement {
  const htmlChildren = Children.toArray((element.props as { children: ReactNode }).children)
  const body = htmlChildren.find((child): child is ReactElement => isValidElement(child) && child.type === 'body')
  if (!body) {
    throw new Error('Expected <body> element inside <html>')
  }
  return body
}

/**
 * Extract the head element from the HTML element returned by RootLayout.
 * @param element - The ReactElement returned by RootLayout
 * @returns The head ReactElement
 */
function getHeadElement(element: ReactElement): ReactElement {
  const htmlChildren = Children.toArray((element.props as { children: ReactNode }).children)
  const head = htmlChildren.find((child): child is ReactElement => isValidElement(child) && child.type === 'head')
  if (!head) {
    throw new Error('Expected <head> element inside <html>')
  }
  return head
}

describe('RootLayout', () => {
  it('should return an html element', () => {
    const result = RootLayout({ children: <div>Test</div> })

    expect(result.type).toBe('html')
  })

  it('should set default lang to en', () => {
    const result = RootLayout({ children: <div>Test</div> })

    expect(getHtmlProps(result).lang).toBe('en')
  })

  it('should set default dir to ltr', () => {
    const result = RootLayout({ children: <div>Test</div> })

    expect(getHtmlProps(result).dir).toBe('ltr')
  })

  it('should include suppressHydrationWarning', () => {
    const result = RootLayout({ children: <div>Test</div> })

    expect(getHtmlProps(result).suppressHydrationWarning).toBe(true)
  })

  it('should render a body element with font CSS variable classes', () => {
    const result = RootLayout({ children: <div>Test</div> })

    const body = getBodyElement(result)
    const bodyClassName = (body.props as { className: string }).className
    expect(bodyClassName).toContain('inter-variable')
    expect(bodyClassName).toContain('heebo-variable')
    expect(bodyClassName).toContain('font-sans')
  })

  it('should render children inside the body', () => {
    const result = RootLayout({ children: <div data-testid="child">Test</div> })

    const body = getBodyElement(result)
    const bodyChildren = Children.toArray((body.props as { children: ReactNode }).children)
    const childElement = bodyChildren.find(
      (child): child is ReactElement =>
        isValidElement(child) && (child.props as { 'data-testid'?: string })['data-testid'] === 'child'
    )
    expect(childElement).toBeDefined()
  })

  it('should include head element with scripts', () => {
    const result = RootLayout({ children: <div>Test</div> })

    const head = getHeadElement(result)
    const headChildren = Children.toArray((head.props as { children: ReactNode }).children)

    // Should have three script elements (trusted types + locale + theme)
    const scripts = headChildren.filter(
      (child): child is ReactElement => isValidElement(child) && child.type === 'script'
    )
    expect(scripts).toHaveLength(3)
  })

  it('should include trusted types policy script', () => {
    const result = RootLayout({ children: <div>Test</div> })

    const head = getHeadElement(result)
    const headChildren = Children.toArray((head.props as { children: ReactNode }).children)
    const scripts = headChildren.filter(
      (child): child is ReactElement => isValidElement(child) && child.type === 'script'
    )

    const trustedTypesScript = (scripts[0]!.props as { dangerouslySetInnerHTML: { __html: string } })
      .dangerouslySetInnerHTML.__html
    expect(trustedTypesScript).toContain('trustedTypes')
    expect(trustedTypesScript).toContain('createPolicy')
    expect(trustedTypesScript).toContain('default')
  })

  it('should include locale detection script', () => {
    const result = RootLayout({ children: <div>Test</div> })

    const head = getHeadElement(result)
    const headChildren = Children.toArray((head.props as { children: ReactNode }).children)
    const scripts = headChildren.filter(
      (child): child is ReactElement => isValidElement(child) && child.type === 'script'
    )

    const localeScript = (scripts[1]!.props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML
      .__html
    expect(localeScript).toContain('window.location.pathname')
    expect(localeScript).toContain('document.documentElement.lang')
    expect(localeScript).toContain('document.documentElement.dir')
  })

  it('should include theme detection script', () => {
    const result = RootLayout({ children: <div>Test</div> })

    const head = getHeadElement(result)
    const headChildren = Children.toArray((head.props as { children: ReactNode }).children)
    const scripts = headChildren.filter(
      (child): child is ReactElement => isValidElement(child) && child.type === 'script'
    )

    const themeScript = (scripts[2]!.props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML
      .__html
    expect(themeScript).toContain('theme-preference')
    expect(themeScript).toContain('data-theme')
  })
})

describe('generateMetadata', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return metadataBase using process.env.NEXT_PUBLIC_SITE_URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-site.com'
    const metadata = generateMetadata()

    expect(metadata.metadataBase).toBeInstanceOf(URL)
    expect(metadata.metadataBase?.toString()).toBe('https://custom-site.com/')
    expect(metadata.manifest).toBe('/manifest.webmanifest')
  })

  it('should return metadataBase fallback to http://localhost:3000', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    const metadata = generateMetadata()

    expect(metadata.metadataBase).toBeInstanceOf(URL)
    expect(metadata.metadataBase?.toString()).toBe('http://localhost:3000/')
  })

  it('should not include title or description', () => {
    const metadata = generateMetadata()

    expect(metadata.title).toBeUndefined()
    expect(metadata.description).toBeUndefined()
  })
})
