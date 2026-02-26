// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the custom 404 Not Found page server component.
 */

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getLocale: jest.fn().mockResolvedValue('en'),
}))

// Mock content module
jest.mock('@/lib/content', () => ({
  getError404: jest.fn(),
}))

// Mock languages module
jest.mock('@/lib/languages/api', () => ({
  getLanguages: jest.fn(),
}))

// Mock TextBlock component
jest.mock('@/components/elements', () => ({
  TextBlock: jest.fn(({ data }: { data: unknown }) => (
    <div data-testid="text-block" data-content={JSON.stringify(data)} />
  )),
}))

import NotFoundPage from '@/app/[lang]/not-found'
import { TextBlock } from '@/components/elements'
import { getError404 } from '@/lib/content'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'
import { getLocale } from 'next-intl/server'

const mockGetError404 = getError404 as jest.MockedFunction<typeof getError404>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>
const mockGetLocale = getLocale as jest.MockedFunction<typeof getLocale>
const mockTextBlock = TextBlock as unknown as jest.Mock

describe('NotFoundPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetLocale.mockResolvedValue('en')
    mockGetLanguages.mockResolvedValue([{ code: LanguageCode.EN, direction: DirectionEnum.LTR }] as unknown as Awaited<
      ReturnType<typeof getLanguages>
    >)
  })

  it('should render CMS error content when available', async () => {
    const mockContent = { header: { text: 'Page not found' } }
    mockGetError404.mockResolvedValue({ content: mockContent } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await NotFoundPage()
    render(Component)

    expect(mockGetError404).toHaveBeenCalledWith(LanguageCode.EN)
    expect(mockTextBlock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining(mockContent) }),
      undefined
    )
  })

  it('should render homepage link with current locale', async () => {
    mockGetError404.mockResolvedValue({ content: { header: {} } } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await NotFoundPage()
    render(Component)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/en')
  })

  it('should not render TextBlock when error data is null', async () => {
    mockGetError404.mockResolvedValue(null)

    const Component = await NotFoundPage()
    render(Component)

    expect(mockTextBlock).not.toHaveBeenCalled()
  })

  it('should use correct locale for Italian', async () => {
    mockGetLocale.mockResolvedValue('it')
    mockGetError404.mockResolvedValue({ content: { header: {} } } as unknown as Awaited<ReturnType<typeof getError404>>)
    mockGetLanguages.mockResolvedValue([{ code: LanguageCode.IT, direction: DirectionEnum.LTR }] as unknown as Awaited<
      ReturnType<typeof getLanguages>
    >)

    const Component = await NotFoundPage()
    render(Component)

    expect(mockGetError404).toHaveBeenCalledWith(LanguageCode.IT)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/it')
  })

  it('should default to LTR when language is not found', async () => {
    mockGetLanguages.mockResolvedValue([] as unknown as Awaited<ReturnType<typeof getLanguages>>)
    mockGetError404.mockResolvedValue({ content: { header: {} } } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await NotFoundPage()
    render(Component)

    expect(mockTextBlock).toHaveBeenCalledWith(expect.objectContaining({ direction: DirectionEnum.LTR }), undefined)
  })

  it('should export noindex metadata', async () => {
    const { metadata } = await import('@/app/[lang]/not-found')

    expect(metadata.robots).toEqual({ index: false, follow: false })
    expect(metadata.title).toBe('404')
  })
})
