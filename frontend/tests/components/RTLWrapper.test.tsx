// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for RTLWrapper component
 */

import { render } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { RTLWrapper } from '@/components/RTLWrapper'
import { LanguageCode } from '@/lib/types'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

describe('RTLWrapper', () => {
  beforeEach(() => {
    // Reset document properties
    document.documentElement.dir = ''
    document.documentElement.lang = ''
    jest.clearAllMocks()
  })

  describe('LTR (English) paths', () => {
    it('should set ltr direction for root path', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/')

      render(
        <RTLWrapper>
          <div>Test content</div>
        </RTLWrapper>
      )

      expect(document.documentElement.dir).toBe('ltr')
      expect(document.documentElement.lang).toBe(LanguageCode.EN)
    })

    it('should set ltr direction for /en path', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en/about')

      render(
        <RTLWrapper>
          <div>Test content</div>
        </RTLWrapper>
      )

      expect(document.documentElement.dir).toBe('ltr')
      expect(document.documentElement.lang).toBe(LanguageCode.EN)
    })

    it('should set ltr direction for /it path', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/it/products')

      render(
        <RTLWrapper>
          <div>Test content</div>
        </RTLWrapper>
      )

      expect(document.documentElement.dir).toBe('ltr')
      expect(document.documentElement.lang).toBe(LanguageCode.EN)
    })

    it('should render children with ltr wrapper', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en/about')

      const { container } = render(
        <RTLWrapper>
          <div data-testid="child">Test content</div>
        </RTLWrapper>
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.getAttribute('dir')).toBe('ltr')
      expect(wrapper.className).toContain('ltr')
    })
  })

  describe('RTL (Hebrew) paths', () => {
    it('should set rtl direction for /he path', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/he/about')

      render(
        <RTLWrapper>
          <div>Test content</div>
        </RTLWrapper>
      )

      expect(document.documentElement.dir).toBe('rtl')
      expect(document.documentElement.lang).toBe(LanguageCode.HE)
    })

    it('should set rtl direction for /he path', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/he/products')

      render(
        <RTLWrapper>
          <div>Test content</div>
        </RTLWrapper>
      )

      expect(document.documentElement.dir).toBe('rtl')
      expect(document.documentElement.lang).toBe(LanguageCode.HE)
    })

    it('should render children with rtl wrapper', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/he/about')

      const { container } = render(
        <RTLWrapper>
          <div data-testid="child">תוכן בדיקה</div>
        </RTLWrapper>
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.getAttribute('dir')).toBe('rtl')
      expect(wrapper.className).toContain('rtl')
    })
  })

  describe('children rendering', () => {
    it('should render text children', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en')

      const { getByText } = render(<RTLWrapper>Hello World</RTLWrapper>)

      expect(getByText('Hello World')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en')

      const { getByText } = render(
        <RTLWrapper>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </RTLWrapper>
      )

      expect(getByText('Child 1')).toBeInTheDocument()
      expect(getByText('Child 2')).toBeInTheDocument()
      expect(getByText('Child 3')).toBeInTheDocument()
    })

    it('should render nested components', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/he')

      const { getByTestId } = render(
        <RTLWrapper>
          <div data-testid="parent">
            <div data-testid="child">Nested content</div>
          </div>
        </RTLWrapper>
      )

      expect(getByTestId('parent')).toBeInTheDocument()
      expect(getByTestId('child')).toBeInTheDocument()
    })
  })

  describe('direction switching', () => {
    it('should update direction when path changes from ltr to rtl', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/en/about')

      const { rerender } = render(
        <RTLWrapper>
          <div>Content</div>
        </RTLWrapper>
      )

      expect(document.documentElement.dir).toBe('ltr')
      ;(usePathname as jest.Mock).mockReturnValue('/he/about')

      rerender(
        <RTLWrapper>
          <div>Content</div>
        </RTLWrapper>
      )

      expect(document.documentElement.dir).toBe('rtl')
    })

    it('should update direction when path changes from rtl to ltr', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/he/products')

      const { rerender } = render(
        <RTLWrapper>
          <div>Content</div>
        </RTLWrapper>
      )

      expect(document.documentElement.dir).toBe('rtl')
      ;(usePathname as jest.Mock).mockReturnValue('/en/products')

      rerender(
        <RTLWrapper>
          <div>Content</div>
        </RTLWrapper>
      )

      expect(document.documentElement.dir).toBe('ltr')
    })
  })
})
