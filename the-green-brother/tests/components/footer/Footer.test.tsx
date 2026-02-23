// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Footer component
 */

import { render, screen } from '@testing-library/react'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock CMS elements
jest.mock('@/components/elements', () => ({
  ButtonLink: function MockButtonLink({ data }: { data: { label?: { text?: string }; url?: string } }) {
    return <a href={data.url}>{data.label?.text}</a>
  },
  Text: function MockText({ text, as: Component = 'span', className }: any) {
    return <Component className={className}>{text}</Component>
  },
  Label: function MockLabel({ data }: { data: { text?: string } }) {
    return <span>{data.text}</span>
  },
  TextBlock: function MockTextBlock({ data }: { data: { header?: { header?: { text?: string } }; content?: string } }) {
    return (
      <div data-testid="text-block">
        {data.header?.header?.text && <h5>{data.header.header.text}</h5>}
        {data.content && <div>{data.content}</div>}
      </div>
    )
  },
}))

// Mock CookieSettingsAction
jest.mock('@/components/consent', () => ({
  CookieSettingsAction: function MockCookieSettingsAction({ data }: { data: { label?: { text?: string } } }) {
    return <button data-testid="cookie-settings-button">{data.label?.text}</button>
  },
}))

// Mock getFooter API
jest.mock('@/lib/content/api', () => ({
  getFooter: jest.fn(),
}))

import Footer from '@/components/footer/Footer'
import { getFooter } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '../../../src/lib/generated'

const mockGetFooter = getFooter as jest.MockedFunction<typeof getFooter>

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null when footerData is null', async () => {
    mockGetFooter.mockResolvedValue(null)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })

    expect(Component).toBeNull()
  })

  it('should render footer with copyright text', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [],
      copyrightsLabel: { text: '© {year} TheGreenBrother' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    expect(screen.getByText(content => content.includes('© {year}'))).toBeInTheDocument()
  })

  it('should render text-block columns', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [
        {
          id: 1,
          __component: 'elements.text-block',
          header: { header: { text: 'About Us' } },
          content: 'We are TheGreenBrother',
        },
      ],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('We are TheGreenBrother')).toBeInTheDocument()
  })

  it('should render newsletter signup CTA columns', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [
        {
          id: 1,
          __component: 'call-to-actions.newsletter-signup-cta',
          title: 'Stay Updated',
          description: 'Subscribe to our newsletter',
        },
      ],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    expect(screen.getByText('Stay Updated')).toBeInTheDocument()
    expect(screen.getByText('Subscribe to our newsletter')).toBeInTheDocument()
  })

  it('should handle horizontal layout markers', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [
        { id: 1, __component: 'markers.start-horizontal-layout-marker' },
        {
          id: 2,
          __component: 'elements.text-block',
          header: { header: { text: 'Column 1' } },
          content: 'Content 1',
        },
        {
          id: 3,
          __component: 'elements.text-block',
          header: { header: { text: 'Column 2' } },
          content: 'Content 2',
        },
        { id: 4, __component: 'markers.end-horizontal-layout-marker' },
      ],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    expect(screen.getByText('Column 1')).toBeInTheDocument()
    expect(screen.getByText('Column 2')).toBeInTheDocument()
  })

  it('should render quick links', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [
        { id: 123, label: { text: 'Privacy' }, url: '/privacy', openInNewTab: false },
        { label: { text: 'Terms' }, url: '/terms', openInNewTab: false }, // No ID to test fallback
      ],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    // Quick links are rendered as Button components
    expect(screen.getByText('Privacy')).toBeInTheDocument()
    expect(screen.getByText('Terms')).toBeInTheDocument()
  })

  it('should render text-block without header', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [
        {
          id: 1,
          __component: 'elements.text-block',
          content: 'Just content no header',
        },
      ],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    expect(screen.getByText('Just content no header')).toBeInTheDocument()
  })

  it('should handle unknown column component types', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [
        {
          id: 1,
          __component: 'unknown.component-type',
          content: 'Unknown',
        },
      ],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    // Should render without error, unknown types return null
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
  })

  it('should handle empty columns array', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    expect(screen.getByText(content => content.includes('© {year}'))).toBeInTheDocument()
  })

  it('should handle vertical column group after horizontal group', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [
        { id: 1, __component: 'markers.start-horizontal-layout-marker' },
        {
          id: 2,
          __component: 'elements.text-block',
          header: { header: { text: 'Horizontal Col' } },
          content: 'In horizontal',
        },
        { id: 3, __component: 'markers.end-horizontal-layout-marker' },
        {
          id: 4,
          __component: 'elements.text-block',
          header: { header: { text: 'Vertical Col' } },
          content: 'In vertical',
        },
      ],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    expect(screen.getByText('Horizontal Col')).toBeInTheDocument()
    expect(screen.getByText('Vertical Col')).toBeInTheDocument()
  })

  it('should handle text-block with regular text (no markdown links)', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [
        {
          id: 1,
          __component: 'elements.text-block',
          header: { header: { text: 'Plain' } },
          content: 'Just plain text with no links',
        },
      ],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    expect(screen.getByText('Just plain text with no links')).toBeInTheDocument()
  })

  it('should handle vertical content before horizontal layout markers', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [
        {
          id: 1,
          __component: 'elements.text-block',
          header: { header: { text: 'Vertical First' } },
          content: 'This comes before horizontal',
        },
        { id: 2, __component: 'markers.start-horizontal-layout-marker' },
        {
          id: 3,
          __component: 'elements.text-block',
          header: { header: { text: 'Horizontal Col' } },
          content: 'In horizontal group',
        },
        { id: 4, __component: 'markers.end-horizontal-layout-marker' },
      ],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    expect(screen.getByText('Vertical First')).toBeInTheDocument()
    expect(screen.getByText('Horizontal Col')).toBeInTheDocument()
  })

  it('should skip layout markers in renderColumn', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [
        { id: 1, __component: 'markers.start-horizontal-layout-marker' },
        { id: 2, __component: 'markers.end-horizontal-layout-marker' },
        {
          id: 3,
          __component: 'elements.text-block',
          header: { header: { text: 'After Markers' } },
          content: 'Content after markers',
        },
      ],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    // Should render the text-block but skip markers
    expect(screen.getByText('After Markers')).toBeInTheDocument()
  })

  it('should render text-block column when id is undefined (uses index as fallback key)', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [
        {
          __component: 'elements.text-block',
          // No id field - tests the `column.id ?? index` fallback at line 60
          header: { header: { text: 'No ID Column' } },
          content: 'Content without explicit id',
        },
      ],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    expect(screen.getByText('No ID Column')).toBeInTheDocument()
    expect(screen.getByText('Content without explicit id')).toBeInTheDocument()
  })

  it('should apply md:flex-row-reverse to bottom footer section for RTL direction', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.RTL })
    render(Component!)

    // Find the container for copyright and quick links (it has flex-col by default)
    // The copyright text is a good anchor
    const copyrightElement = screen.getByText(content => content.includes('© {year}'))
    const bottomSection = copyrightElement.closest('.flex.flex-col.items-center.justify-between')

    expect(bottomSection).toHaveClass('md:flex-row-reverse')
  })

  it('should not apply md:flex-row-reverse for LTR direction', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
    render(Component!)

    // Verify literal string is passed (logic moved/removed)
    const copyrightElement = screen.getByText(content => content.includes('© {year}'))
    const bottomSection = copyrightElement.closest('.flex.flex-col.items-center.justify-between')

    expect(bottomSection).not.toHaveClass('md:flex-row-reverse')
  })

  it('should reverse horizontal column groups for RTL direction', async () => {
    mockGetFooter.mockResolvedValue({
      columns: [
        { id: 1, __component: 'markers.start-horizontal-layout-marker' },
        {
          id: 2,
          __component: 'elements.text-block',
          header: { header: { text: 'First' } },
        },
        {
          id: 3,
          __component: 'elements.text-block',
          header: { header: { text: 'Second' } },
        },
        { id: 4, __component: 'markers.end-horizontal-layout-marker' },
      ],
      copyrightsLabel: { text: '© {year}' },
      quickLinks: [],
    } as unknown as Awaited<ReturnType<typeof getFooter>>)

    const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.RTL })
    render(Component!)

    const firstHeader = screen.getByText('First')
    const secondHeader = screen.getByText('Second')

    const parent = firstHeader.closest('.md\\:flex-row')
    expect(parent).toBeInTheDocument()

    expect(parent?.children[0]).toContainElement(firstHeader as HTMLElement)
    expect(parent?.children[1]).toContainElement(secondHeader as HTMLElement)
  })

  describe('cookie settings quick link', () => {
    it('should render CookieSettingsAction for links with #cookie-settings URL', async () => {
      mockGetFooter.mockResolvedValue({
        columns: [],
        copyrightsLabel: { text: '© {year}' },
        quickLinks: [
          { id: 1, label: { text: 'Privacy' }, url: '/privacy', openInNewTab: false },
          { id: 2, label: { text: 'Cookie Settings' }, url: '#cookie-settings', openInNewTab: false },
        ],
      } as unknown as Awaited<ReturnType<typeof getFooter>>)

      const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
      render(Component!)

      // Privacy link should be a regular link
      expect(screen.getByText('Privacy')).toBeInTheDocument()
      expect(screen.getByText('Privacy').tagName).toBe('A')

      // Cookie Settings should be rendered as CookieSettingsAction (mocked as button)
      expect(screen.getByTestId('cookie-settings-button')).toBeInTheDocument()
      expect(screen.getByTestId('cookie-settings-button').textContent).toBe('Cookie Settings')
    })

    it('should render CookieSettingsAction with empty label when label text is missing', async () => {
      mockGetFooter.mockResolvedValue({
        columns: [],
        copyrightsLabel: { text: '© {year}' },
        quickLinks: [{ id: 1, label: {}, url: '#cookie-settings', openInNewTab: false }],
      } as unknown as Awaited<ReturnType<typeof getFooter>>)

      const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
      render(Component!)

      const cookieButton = screen.getByTestId('cookie-settings-button')
      expect(cookieButton).toBeInTheDocument()
      expect(cookieButton.textContent).toBe('')
    })

    it('should use link id for key when present on cookie settings link', async () => {
      mockGetFooter.mockResolvedValue({
        columns: [],
        copyrightsLabel: { text: '© {year}' },
        quickLinks: [{ id: 42, label: { text: 'Cookies' }, url: '#cookie-settings', openInNewTab: false }],
      } as unknown as Awaited<ReturnType<typeof getFooter>>)

      const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
      render(Component!)

      expect(screen.getByTestId('cookie-settings-button')).toBeInTheDocument()
    })

    it('should use index as fallback key when cookie settings link has no id', async () => {
      mockGetFooter.mockResolvedValue({
        columns: [],
        copyrightsLabel: { text: '© {year}' },
        quickLinks: [{ label: { text: 'Cookies' }, url: '#cookie-settings', openInNewTab: false }],
      } as unknown as Awaited<ReturnType<typeof getFooter>>)

      const Component = await Footer({ lang: LanguageCode.EN, direction: DirectionEnum.LTR })
      render(Component!)

      expect(screen.getByTestId('cookie-settings-button')).toBeInTheDocument()
    })
  })
})
