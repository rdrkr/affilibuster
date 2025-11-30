// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for StyleGuidePage server component
 */

import { CodeEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

import StyleGuidePage, { generateMetadata, generateStaticParams } from '@/app/[lang]/style-guide/page'
import { DirectionEnum } from '@/lib/generated/types.gen'

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  setRequestLocale: jest.fn(),
}))

// Mock the StyleGuideClient component
jest.mock('@/app/[lang]/style-guide/StyleGuideClient', () => ({
  __esModule: true,
  default: function MockStyleGuideClient({ lang }: { lang: CodeEnum }) {
    return <div data-testid="mock-style-guide-client" data-lang={lang}></div>
  },
}))

// Mock getLanguages
jest.mock('@/lib/languages/api', () => ({
  getLanguages: jest.fn().mockResolvedValue([
    { code: CodeEnum.EN, direction: DirectionEnum.LTR },
    { code: CodeEnum.IT, direction: DirectionEnum.LTR },
    { code: CodeEnum.HE, direction: DirectionEnum.RTL },
  ]),
}))

describe('StyleGuidePage', () => {
  describe('generateStaticParams', () => {
    it('should return all supported language codes', () => {
      const params = generateStaticParams()

      expect(params).toEqual([{ lang: CodeEnum.EN }, { lang: CodeEnum.IT }, { lang: CodeEnum.HE }])
    })

    it('should return array with correct structure', () => {
      const params = generateStaticParams()

      expect(Array.isArray(params)).toBe(true)
      expect(params.length).toBe(3)
      params.forEach(param => {
        expect(param).toHaveProperty('lang')
        expect(typeof param.lang).toBe('string')
      })
    })
  })

  describe('generateMetadata', () => {
    it('should return metadata with correct title', () => {
      const metadata = generateMetadata()

      expect(metadata.title).toBe('Style Guide - TheGreenBrother')
    })

    it('should return metadata with correct description', () => {
      const metadata = generateMetadata()

      expect(metadata.description).toBe('Design system reference for TheGreenBrother')
    })

    it('should set robots to noindex and nofollow', () => {
      const metadata = generateMetadata()

      expect(metadata.robots).toEqual({
        index: false,
        follow: false,
      })
    })
  })

  describe('StyleGuidePage component', () => {
    it('should render StyleGuideClient with English language', async () => {
      const params = Promise.resolve({ lang: CodeEnum.EN })
      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toBeInTheDocument()
      expect(client).toHaveAttribute('data-lang', CodeEnum.EN)
    })

    it('should render StyleGuideClient with Italian language', async () => {
      const params = Promise.resolve({ lang: CodeEnum.IT })
      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toBeInTheDocument()
      expect(client).toHaveAttribute('data-lang', CodeEnum.IT)
    })

    it('should render StyleGuideClient with Hebrew language', async () => {
      const params = Promise.resolve({ lang: CodeEnum.HE })
      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toBeInTheDocument()
      expect(client).toHaveAttribute('data-lang', CodeEnum.HE)
    })

    it('should default to English when lang is missing', async () => {
      const params = Promise.resolve({ lang: '' as CodeEnum })
      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toHaveAttribute('data-lang', CodeEnum.EN)
    })

    it('should handle promise rejection gracefully', async () => {
      const params = Promise.reject(new Error('Params error'))

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty
      })

      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toHaveAttribute('data-lang', CodeEnum.EN) // Should default to CodeEnum.EN

      consoleSpy.mockRestore()
    })

    it('should call setRequestLocale with the correct language', async () => {
      const { setRequestLocale } = await import('next-intl/server')
      const params = Promise.resolve({ lang: CodeEnum.IT })

      render(await StyleGuidePage({ params }))

      expect(setRequestLocale).toHaveBeenCalledWith(CodeEnum.IT)
    })

    it('should handle invalid language code gracefully', async () => {
      const params = Promise.resolve({ lang: 'invalid' as CodeEnum })
      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toHaveAttribute('data-lang', CodeEnum.EN) // Should fall back to default
    })
  })
})
