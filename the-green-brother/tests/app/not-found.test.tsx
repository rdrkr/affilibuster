// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the root not-found page component.
 */

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

// Mock content module
jest.mock('@/lib/content', () => ({
  getError404: jest.fn(),
}))

// Mock languages module
jest.mock('@/lib/languages/api', () => ({
  getLanguages: jest.fn(),
}))

// Mock Icon and TextBlock components
jest.mock('@/components/elements', () => ({
  Icon: jest.fn(({ icon, size, className }: { icon: string; size?: string; className?: string }) => (
    <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
      {icon}
    </span>
  )),
  TextBlock: jest.fn(
    ({ data, headerLevel, direction }: { data: unknown; headerLevel?: number; direction?: string }) => (
      <div
        data-testid="mock-textblock"
        data-level={headerLevel}
        data-direction={direction}
        data-content={JSON.stringify(data)}
      />
    )
  ),
}))

import RootNotFound from '@/app/not-found'
import { Icon, TextBlock } from '@/components/elements'
import { getError404 } from '@/lib/content'
import { DirectionEnum, IconPositionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'
import { headers } from 'next/headers'

const mockGetError404 = getError404 as jest.MockedFunction<typeof getError404>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>
const mockHeaders = headers as jest.MockedFunction<typeof headers>
const mockIcon = Icon as unknown as jest.Mock
const mockTextBlock = TextBlock as unknown as jest.Mock

describe('RootNotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockHeaders.mockResolvedValue(new Headers() as unknown as Awaited<ReturnType<typeof headers>>)
    mockGetLanguages.mockResolvedValue([{ code: LanguageCode.EN, direction: DirectionEnum.LTR }] as unknown as Awaited<
      ReturnType<typeof getLanguages>
    >)
  })

  it('should render CMS content with Icon + TextBlock pattern when available', async () => {
    const mockContent = {
      header: {
        alignment: 'center',
        promoteHeaderIcon: false,
        header: {
          text: 'Page not found',
          icon: 'search',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Not found',
        },
      },
      content: 'Some markdown content',
    }
    mockGetError404.mockResolvedValue({ content: mockContent } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await RootNotFound()
    render(Component)

    expect(mockGetError404).toHaveBeenCalledWith(LanguageCode.EN)

    // Icon should be rendered from CMS header icon
    expect(mockIcon).toHaveBeenCalledWith(expect.objectContaining({ icon: 'search', size: '6xl' }), undefined)

    // TextBlock should be rendered with icon stripped from header
    const textBlockCall = mockTextBlock.mock.calls[0][0]
    expect(textBlockCall.data.__component).toBe('elements.text-block')
    expect(textBlockCall.data.header.header.text).toBe('Page not found')
    expect(textBlockCall.data.header.header).not.toHaveProperty('icon')
    expect(textBlockCall.headerLevel).toBe(2)
    expect(textBlockCall.direction).toBe(DirectionEnum.LTR)
  })

  it('should render a link to the English homepage by default', async () => {
    mockGetError404.mockResolvedValue({
      content: { header: { alignment: 'center', promoteHeaderIcon: false, header: { text: '', ariaDescription: '' } } },
    } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await RootNotFound()
    render(Component)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/en')
  })

  it('should render fallback search icon when CMS has no icon', async () => {
    const mockContent = {
      header: {
        alignment: 'center',
        promoteHeaderIcon: false,
        header: { text: 'Not found', ariaDescription: 'Not found' },
      },
    }
    mockGetError404.mockResolvedValue({ content: mockContent } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await RootNotFound()
    render(Component)

    // Should fall back to search icon
    expect(mockIcon).toHaveBeenCalledWith(expect.objectContaining({ icon: 'search', size: '6xl' }), undefined)
  })

  it('should render fallback search icon when error data is null', async () => {
    mockGetError404.mockResolvedValue(null)

    const Component = await RootNotFound()
    render(Component)

    // Should render fallback search icon
    expect(mockIcon).toHaveBeenCalledWith(expect.objectContaining({ icon: 'search', size: '6xl' }), undefined)
    // No TextBlock when no CMS data
    expect(mockTextBlock).not.toHaveBeenCalled()
  })

  it('should detect locale from x-url header', async () => {
    const headerMap = new Headers()
    headerMap.set('x-url', '/he/some-page')
    mockHeaders.mockResolvedValue(headerMap as unknown as Awaited<ReturnType<typeof headers>>)
    mockGetLanguages.mockResolvedValue([{ code: LanguageCode.HE, direction: DirectionEnum.RTL }] as unknown as Awaited<
      ReturnType<typeof getLanguages>
    >)
    mockGetError404.mockResolvedValue({
      content: { header: { alignment: 'center', promoteHeaderIcon: false, header: { text: '', ariaDescription: '' } } },
    } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await RootNotFound()
    render(Component)

    expect(mockGetError404).toHaveBeenCalledWith(LanguageCode.HE)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/he')
  })

  it('should detect locale from x-invoke-path header as fallback', async () => {
    const headerMap = new Headers()
    headerMap.set('x-invoke-path', '/it/blog')
    mockHeaders.mockResolvedValue(headerMap as unknown as Awaited<ReturnType<typeof headers>>)
    mockGetLanguages.mockResolvedValue([{ code: LanguageCode.IT, direction: DirectionEnum.LTR }] as unknown as Awaited<
      ReturnType<typeof getLanguages>
    >)
    mockGetError404.mockResolvedValue({
      content: { header: { alignment: 'center', promoteHeaderIcon: false, header: { text: '', ariaDescription: '' } } },
    } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await RootNotFound()
    render(Component)

    expect(mockGetError404).toHaveBeenCalledWith(LanguageCode.IT)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/it')
  })

  it('should default to EN when locale detection fails', async () => {
    mockHeaders.mockRejectedValue(new Error('Headers not available'))
    mockGetError404.mockResolvedValue({
      content: { header: { alignment: 'center', promoteHeaderIcon: false, header: { text: '', ariaDescription: '' } } },
    } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await RootNotFound()
    render(Component)

    expect(mockGetError404).toHaveBeenCalledWith(LanguageCode.EN)
  })

  it('should default to EN when URL has invalid locale code', async () => {
    const headerMap = new Headers()
    headerMap.set('x-url', '/zz/page')
    mockHeaders.mockResolvedValue(headerMap as unknown as Awaited<ReturnType<typeof headers>>)
    mockGetError404.mockResolvedValue({
      content: { header: { alignment: 'center', promoteHeaderIcon: false, header: { text: '', ariaDescription: '' } } },
    } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await RootNotFound()
    render(Component)

    expect(mockGetError404).toHaveBeenCalledWith(LanguageCode.EN)
  })

  it('should use RTL direction for Hebrew locale', async () => {
    const headerMap = new Headers()
    headerMap.set('x-url', '/he/page')
    mockHeaders.mockResolvedValue(headerMap as unknown as Awaited<ReturnType<typeof headers>>)
    mockGetLanguages.mockResolvedValue([{ code: LanguageCode.HE, direction: DirectionEnum.RTL }] as unknown as Awaited<
      ReturnType<typeof getLanguages>
    >)
    const mockContent = {
      header: {
        alignment: 'center',
        promoteHeaderIcon: false,
        header: { text: 'Not found', icon: 'search', ariaDescription: 'Not found' },
      },
    }
    mockGetError404.mockResolvedValue({ content: mockContent } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await RootNotFound()
    render(Component)

    expect(mockTextBlock).toHaveBeenCalledWith(expect.objectContaining({ direction: DirectionEnum.RTL }), undefined)
  })

  it('should render TextBlock without header override when content has no nested header', async () => {
    const mockContent = {
      header: {
        alignment: 'center',
        promoteHeaderIcon: false,
        // No nested `header` property
      },
      content: 'Some content',
    }
    mockGetError404.mockResolvedValue({ content: mockContent } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await RootNotFound()
    render(Component)

    expect(mockIcon).toHaveBeenCalledWith(expect.objectContaining({ icon: 'search', size: '6xl' }), undefined)
    expect(mockTextBlock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          __component: 'elements.text-block',
          content: 'Some content',
        }),
      }),
      undefined
    )
  })

  it('should default to LTR when language direction is not available', async () => {
    mockGetLanguages.mockResolvedValue([] as unknown as Awaited<ReturnType<typeof getLanguages>>)
    const mockContent = {
      header: {
        alignment: 'center',
        promoteHeaderIcon: false,
        header: { text: 'Not found', icon: 'search', ariaDescription: 'Not found' },
      },
    }
    mockGetError404.mockResolvedValue({ content: mockContent } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await RootNotFound()
    render(Component)

    expect(mockTextBlock).toHaveBeenCalledWith(expect.objectContaining({ direction: DirectionEnum.LTR }), undefined)
  })

  it('should export noindex metadata', async () => {
    const { metadata } = await import('@/app/not-found')

    expect(metadata.robots).toEqual({ index: false, follow: false })
    expect(metadata.title).toBe('404')
  })
})
