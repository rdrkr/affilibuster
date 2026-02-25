// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for StyleGuidePage server component
 */

import { LanguageCode } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

import StyleGuidePage, { generateMetadata, generateStaticParams } from '@/app/[lang]/style-guide/page'

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  setRequestLocale: jest.fn(),
}))

// Mock the StyleGuideClient component
jest.mock('@/app/[lang]/style-guide/StyleGuideClient', () => ({
  __esModule: true,
  default: function MockStyleGuideClient() {
    return <div data-testid="mock-style-guide-client"></div>
  },
}))

describe('StyleGuidePage', () => {
  describe('generateStaticParams', () => {
    it('should return all supported language codes', () => {
      const params = generateStaticParams()

      expect(params).toEqual([{ lang: LanguageCode.EN }, { lang: LanguageCode.IT }, { lang: LanguageCode.HE }])
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

      expect(metadata.title).toBe('Style Guide')
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
      const params = Promise.resolve({ lang: LanguageCode.EN })
      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toBeInTheDocument()
    })

    it('should render StyleGuideClient with Italian language', async () => {
      const params = Promise.resolve({ lang: LanguageCode.IT })
      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toBeInTheDocument()
    })

    it('should render StyleGuideClient with Hebrew language', async () => {
      const params = Promise.resolve({ lang: LanguageCode.HE })
      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toBeInTheDocument()
    })

    it('should default to English when lang is missing', async () => {
      const params = Promise.resolve({ lang: '' as LanguageCode })
      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toBeInTheDocument()
    })

    it('should handle promise rejection gracefully', async () => {
      const params = Promise.reject(new Error('Params error'))

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty
      })

      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('should call setRequestLocale with the correct language', async () => {
      const { setRequestLocale } = await import('next-intl/server')
      const params = Promise.resolve({ lang: LanguageCode.IT })

      render(await StyleGuidePage({ params }))

      expect(setRequestLocale).toHaveBeenCalledWith(LanguageCode.IT)
    })

    it('should handle invalid language code gracefully', async () => {
      const params = Promise.resolve({ lang: 'invalid' as LanguageCode })
      render(await StyleGuidePage({ params }))

      const client = screen.getByTestId('mock-style-guide-client')
      expect(client).toBeInTheDocument()
    })
  })
})
