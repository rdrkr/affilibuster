// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for root layout
 *
 * Note: RootLayout returns <html> element which cannot be rendered in test DOM.
 * We test the component structure programmatically without actual DOM rendering.
 */

import RootLayout, { metadata } from '@/app/layout'
import * as React from 'react'

// Mock next-intl
jest.mock('next-intl', () => ({
  NextIntlClientProvider: jest.fn(({ children }: { children: React.ReactNode }): React.ReactNode => children),
  useLocale: jest.fn((): string => 'en'),
}))

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getMessages: jest.fn(() => Promise.resolve({})),
}))

// Mock Next.js headers() function
jest.mock('next/headers', () => ({
  headers: jest.fn(() =>
    Promise.resolve({
      get: jest.fn((key: string) => {
        // Mock headers - simulate /en route
        if (key === 'x-invoke-path') return '/en'
        if (key === 'referer') return 'http://localhost:3000/en'
        if (key === 'x-language') return 'en'
        if (key === 'x-text-direction') return 'ltr'
        return null
      }),
    })
  ),
}))

describe('RootLayout', () => {
  it('should have correct metadata', () => {
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('404 - Page Not Found')
    expect(metadata.description).toBe('The page you are looking for could not be found.')
  })

  it('should return html element', async () => {
    const children = <div data-testid="test-child">Test Content</div>
    const layout = await RootLayout({ children })

    expect(React.isValidElement(layout)).toBe(true)
    if (React.isValidElement(layout)) {
      expect(layout.type).toBe('html')
    }
  })

  it('should use suppressHydrationWarning on html element', async () => {
    const children = <div>Test</div>
    const layout = await RootLayout({ children })

    expect(React.isValidElement(layout)).toBe(true)
    if (React.isValidElement(layout)) {
      const props = layout.props as { suppressHydrationWarning?: boolean; children?: React.ReactNode }
      expect(props.suppressHydrationWarning).toBe(true)
    }
  })

  it('should set lang and dir attributes on html element', async () => {
    const children = <div>Test</div>
    const layout = await RootLayout({ children })

    expect(React.isValidElement(layout)).toBe(true)
    if (React.isValidElement(layout)) {
      const props = layout.props as { lang?: string; dir?: string }
      expect(props.lang).toBeDefined()
      expect(props.dir).toBeDefined()
      // Mock is set to return /en, so should be 'en' and 'ltr'
      expect(props.lang).toBe('en')
      expect(props.dir).toBe('ltr')
    }
  })

  it('should wrap children in body element with AuthProvider', async () => {
    const children = <div data-testid="test-child">Test Content</div>
    const layout = await RootLayout({ children })

    expect(React.isValidElement(layout)).toBe(true)
    if (React.isValidElement(layout)) {
      // html element should have body as child
      const props = layout.props as { children?: React.ReactNode }
      const body = React.Children.toArray(props.children).find(
        (child): child is React.ReactElement => React.isValidElement(child) && child.type === 'body'
      )

      expect(body).toBeTruthy()
      if (React.isValidElement(body)) {
        expect(body.type).toBe('body')
        const bodyProps = body.props as { children?: React.ReactNode }
        // body should contain AuthProvider wrapping our test children
        expect(React.isValidElement(bodyProps.children)).toBe(true)
        if (React.isValidElement(bodyProps.children)) {
          // AuthProvider should wrap the children
          const authProviderProps = bodyProps.children.props as { children?: React.ReactNode }
          const authProviderChildren = React.Children.toArray(authProviderProps.children)
          expect(authProviderChildren.length).toBe(2)
          expect(authProviderChildren[0]).toMatchObject({
            type: (children as React.ReactElement).type,
            props: (children as React.ReactElement).props,
          })
          expect(React.isValidElement(authProviderChildren[1])).toBe(true)
          if (React.isValidElement(authProviderChildren[1])) {
            const elementType = authProviderChildren[1].type
            if (typeof elementType === 'function') {
              expect(elementType.name).toBe('LanguagePrompt')
            }
          }
        }
      }
    }
  })

  it('should pass through multiple children via AuthProvider', async () => {
    const child1 = <div data-testid="child1">Child 1</div>
    const child2 = <div data-testid="child2">Child 2</div>
    const children = (
      <>
        {child1}
        {child2}
      </>
    )

    const layout = await RootLayout({ children })

    expect(React.isValidElement(layout)).toBe(true)
    if (React.isValidElement(layout)) {
      const props = layout.props as { children?: React.ReactNode }
      const body = React.Children.toArray(props.children).find(
        (child): child is React.ReactElement => React.isValidElement(child) && child.type === 'body'
      )

      expect(React.isValidElement(body)).toBe(true)
      if (React.isValidElement(body)) {
        const bodyProps = body.props as { children?: React.ReactNode }
        // Verify children are passed through AuthProvider
        expect(React.isValidElement(bodyProps.children)).toBe(true)
        if (React.isValidElement(bodyProps.children)) {
          // AuthProvider should wrap the children
          const authProviderProps = bodyProps.children.props as { children?: React.ReactNode }
          const authProviderChildren = React.Children.toArray(authProviderProps.children)
          expect(authProviderChildren.length).toBe(2)
          expect(authProviderChildren[0]).toMatchObject({
            type: (children as React.ReactElement).type,
            props: (children as React.ReactElement).props,
          })
          expect(React.isValidElement(authProviderChildren[1])).toBe(true)
          if (React.isValidElement(authProviderChildren[1])) {
            const elementType = authProviderChildren[1].type
            if (typeof elementType === 'function') {
              expect(elementType.name).toBe('LanguagePrompt')
            }
          }
        }
      }
    }
  })
})
