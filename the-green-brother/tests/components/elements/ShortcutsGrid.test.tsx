// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { render, screen } from '@testing-library/react'

import { ShortcutsGrid } from '@/components/elements/ShortcutsGrid'
import { AlignmentEnum, DirectionEnum, IconPositionEnum, type ElementsButtonEntry } from '@/lib/generated/types.gen'

// Mock the CMS element components
jest.mock('@/components/elements/Icon', () => ({
  Icon: function MockIcon({
    icon,
    size,
    className,
    promoted,
  }: {
    icon?: string
    size?: string
    className?: string
    promoted?: boolean
  }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} data-promoted={promoted} className={className}>
        {icon}
      </span>
    )
  },
}))

jest.mock('@/components/elements/Text', () => ({
  Text: function MockText({ text }: { text?: string }) {
    return <>{text}</>
  },
}))

jest.mock('@/components/elements/Header', () => ({
  Header: function MockHeader({
    data,
    level = 2,
  }: {
    data: { header?: { text?: string; ariaDescription?: string }; subheader?: { text?: string } }
    level?: number
  }) {
    const Tag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    return (
      <div data-testid="mock-header">
        <Tag>{data.header?.text}</Tag>
        {data.subheader?.text && <p>{data.subheader.text}</p>}
      </div>
    )
  },
}))

describe('ShortcutsGrid', () => {
  const mockHeader = {
    alignment: AlignmentEnum.CENTER,
    promoteHeaderIcon: false,
    header: {
      text: 'Test Header',
      ariaDescription: 'Test Section',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      icon: 'apps',
    },
    subheader: {
      text: 'Test Subheader',
      ariaDescription: 'Subheader description',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
    },
  }

  const mockItems: ElementsButtonEntry[] = [
    {
      id: 1,
      url: '/home',
      openInNewTab: false,
      label: {
        text: 'Home',
        icon: 'home',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Go Home',
      },
    },
    {
      id: 2,
      url: '/settings',
      openInNewTab: false,
      label: {
        text: 'Settings',
        icon: 'settings',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Open Settings',
      },
    },
  ]

  it('should render section with header when provided', () => {
    render(<ShortcutsGrid direction={DirectionEnum.LTR} items={mockItems} header={mockHeader} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Test Header' })).toBeInTheDocument()
    expect(screen.getByText('Test Subheader')).toBeInTheDocument()
  })

  it('should render items as links when url provided', () => {
    render(<ShortcutsGrid direction={DirectionEnum.LTR} items={mockItems} />)

    const homeLink = screen.getByRole('link', { name: 'Go Home' })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/home')
  })

  it('should render items as static content when no url provided', () => {
    const itemsWithStatic = [
      ...mockItems,
      {
        id: 3,
        url: '',
        openInNewTab: false,
        label: {
          text: 'Static',
          icon: 'info',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Static item',
        },
      },
    ]
    render(<ShortcutsGrid direction={DirectionEnum.LTR} items={itemsWithStatic} />)

    // Check for text content "Static"
    expect(screen.getByText('Static')).toBeInTheDocument()
    // Ensure it is NOT a link
    expect(screen.queryByRole('link', { name: 'Static item' })).not.toBeInTheDocument()
  })

  it('should render icons correctly', () => {
    render(<ShortcutsGrid direction={DirectionEnum.LTR} items={mockItems} />)

    const icons = screen.getAllByTestId('mock-icon')
    // Items have 2 icons.
    const homeIcon = icons.find(i => i.getAttribute('data-icon') === 'home')
    const settingsIcon = icons.find(i => i.getAttribute('data-icon') === 'settings')

    expect(homeIcon).toBeInTheDocument()
    expect(settingsIcon).toBeInTheDocument()
  })

  it('should not render anything when items empty', () => {
    const { container } = render(<ShortcutsGrid direction={DirectionEnum.LTR} items={[]} header={mockHeader} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should render correct aria-label on section', () => {
    render(<ShortcutsGrid direction={DirectionEnum.LTR} items={mockItems} header={mockHeader} />)

    const section = screen.getByRole('region', { name: 'Test Section' })
    expect(section).toBeInTheDocument()
  })

  it('should promote icons when noAnimation is true', () => {
    render(<ShortcutsGrid direction={DirectionEnum.LTR} items={mockItems} noAnimation={true} />)

    // Check home icon
    const icons = screen.getAllByTestId('mock-icon')
    const homeIcon = icons.find(i => i.getAttribute('data-icon') === 'home')
    expect(homeIcon).toHaveAttribute('data-promoted', 'true')
  })

  it('should apply correct width class based on buttonSize', () => {
    // Default size is 'md' which maps to 'w-28'
    const { rerender } = render(<ShortcutsGrid direction={DirectionEnum.LTR} items={mockItems} />)
    const homeLink = screen.getByRole('link', { name: 'Go Home' })
    expect(homeLink).toHaveClass('w-28')

    // Test with 'lg' size which maps to 'w-32'
    rerender(<ShortcutsGrid direction={DirectionEnum.LTR} items={mockItems} buttonSize="lg" />)
    const homeLinkLg = screen.getByRole('link', { name: 'Go Home' })
    expect(homeLinkLg).toHaveClass('w-32')
  })
})
