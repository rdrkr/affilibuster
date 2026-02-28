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

import NotFoundPage from '@/app/[lang]/not-found'
import { Icon, TextBlock } from '@/components/elements'
import { getError404 } from '@/lib/content'
import { DirectionEnum, IconPositionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'
import { getLocale } from 'next-intl/server'

const mockGetError404 = getError404 as jest.MockedFunction<typeof getError404>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>
const mockGetLocale = getLocale as jest.MockedFunction<typeof getLocale>
const mockIcon = Icon as unknown as jest.Mock
const mockTextBlock = TextBlock as unknown as jest.Mock

describe('NotFoundPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetLocale.mockResolvedValue('en')
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

    const Component = await NotFoundPage()
    render(Component)

    expect(mockGetError404).toHaveBeenCalledWith(LanguageCode.EN)

    // Icon should be rendered separately with 6xl size
    expect(mockIcon).toHaveBeenCalledWith(expect.objectContaining({ icon: 'search', size: '6xl' }), undefined)

    // TextBlock should be rendered with icon stripped from header
    const textBlockCall = mockTextBlock.mock.calls[0][0]
    expect(textBlockCall.data.__component).toBe('elements.text-block')
    expect(textBlockCall.data.header.header.text).toBe('Page not found')
    expect(textBlockCall.data.header.header).not.toHaveProperty('icon')
    expect(textBlockCall.data.content).toBe('Some markdown content')
    expect(textBlockCall.headerLevel).toBe(2)
    expect(textBlockCall.direction).toBe(DirectionEnum.LTR)
  })

  it('should render homepage link with current locale', async () => {
    mockGetError404.mockResolvedValue({
      content: { header: { alignment: 'center', promoteHeaderIcon: false, header: { text: '', ariaDescription: '' } } },
    } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await NotFoundPage()
    render(Component)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/en')
  })

  it('should not render Icon or TextBlock when error data is null', async () => {
    mockGetError404.mockResolvedValue(null)

    const Component = await NotFoundPage()
    render(Component)

    expect(mockIcon).not.toHaveBeenCalled()
    expect(mockTextBlock).not.toHaveBeenCalled()
  })

  it('should not render Icon when header has no icon', async () => {
    const mockContent = {
      header: {
        alignment: 'center',
        promoteHeaderIcon: false,
        header: { text: 'Not found', ariaDescription: 'Not found' },
      },
    }
    mockGetError404.mockResolvedValue({ content: mockContent } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await NotFoundPage()
    render(Component)

    expect(mockIcon).not.toHaveBeenCalled()
    expect(mockTextBlock).toHaveBeenCalled()
  })

  it('should use correct locale for Italian', async () => {
    mockGetLocale.mockResolvedValue('it')
    mockGetError404.mockResolvedValue({
      content: { header: { alignment: 'center', promoteHeaderIcon: false, header: { text: '', ariaDescription: '' } } },
    } as unknown as Awaited<ReturnType<typeof getError404>>)
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
    mockGetError404.mockResolvedValue({
      content: { header: { alignment: 'center', promoteHeaderIcon: false, header: { text: '', ariaDescription: '' } } },
    } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await NotFoundPage()
    render(Component)

    expect(mockTextBlock).toHaveBeenCalledWith(expect.objectContaining({ direction: DirectionEnum.LTR }), undefined)
  })

  it('should render TextBlock without icon when content has no header icon', async () => {
    mockGetError404.mockResolvedValue({ content: {} } as unknown as Awaited<ReturnType<typeof getError404>>)

    const Component = await NotFoundPage()
    render(Component)

    expect(mockIcon).not.toHaveBeenCalled()
    // TextBlock still renders with the content object (just no header)
    expect(mockTextBlock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ __component: 'elements.text-block' }),
      }),
      undefined
    )
  })

  it('should export noindex metadata', async () => {
    const { metadata } = await import('@/app/[lang]/not-found')

    expect(metadata.robots).toEqual({ index: false, follow: false })
    expect(metadata.title).toBe('404')
  })
})
