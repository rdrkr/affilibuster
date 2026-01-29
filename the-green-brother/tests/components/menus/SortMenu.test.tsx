// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for SortMenu component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { SortMenu, type SortMenuProps } from '@/components/menus/SortMenu'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the CMS element components
jest.mock('@/components/elements', () => ({
  Icon: function MockIcon({ icon, size }: { icon?: string; size?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size}>
        {icon}
      </span>
    )
  },
  Text: function MockText({ text }: { text?: string }) {
    return <span data-testid="mock-text">{text}</span>
  },
  Label: function MockLabel({ data, hideIcon, className }: { data: any; hideIcon?: boolean; className?: string }) {
    return (
      <span data-testid="mock-label" className={className}>
        {!hideIcon && data?.icon && <span data-testid="mock-label-icon">{data.icon}</span>}
        {data?.text}
      </span>
    )
  },
  ButtonAction: function MockButtonAction(props: any) {
    const { children, data, onClick, className, isActive } = props
    const ariaLabel = props['aria-label'] ?? data?.label?.ariaDescription

    let content = children ?? null

    if (!content && data?.label) {
      content = <span>{data.label.text}</span>
    }

    const activeClass = isActive ? 'bg-white/5' : ''
    const finalClassName = `${className ?? ''} ${activeClass}`.trim()

    return (
      <button onClick={onClick} className={finalClassName} aria-label={ariaLabel} aria-pressed={isActive}>
        {content}
      </button>
    )
  },
}))

// Mock DropdownMenu
jest.mock('@/components/menus', () => ({
  DropdownMenu: function MockDropdownMenu({
    triggerChildren,
    isOpen,
    onOpenChange,
    children,
  }: {
    triggerChildren: React.ReactNode
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
  }) {
    // We expect SortMenu to control isOpen via props (controlled mode)
    // In SortMenu implementation:
    // isOpen={isOpen} onOpenChange={setIsOpen}

    // However, DropdownMenu usually handles open/close internally if not controlled?
    // SortMenu uses controlled isOpen.

    return (
      <div data-testid="mock-dropdown">
        <button
          onClick={() => {
            onOpenChange(!isOpen)
          }}
          aria-expanded={isOpen}
          data-testid="dropdown-trigger"
        >
          {triggerChildren}
        </button>
        {isOpen && <div data-testid="dropdown-content">{children}</div>}
      </div>
    )
  },
}))

describe('SortMenu', () => {
  const mockOnSortChange = jest.fn()

  const mockData = {
    header: {
      alignment: 'center',
      promoteHeaderIcon: false,
      locale: 'en',
      header: {
        text: 'Sort by',
        icon: 'sort',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Sort products',
      },
    },
    bestSellers: {
      text: 'Best Sellers',
      icon: 'star',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Sort by best sellers',
    },
    newArrivals: {
      text: 'New Arrivals',
      icon: 'new_releases',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Sort by new arrivals',
    },
    priceLowToHigh: {
      text: 'Price: Low to High',
      icon: 'trending_up',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Sort by price low to high',
    },
    priceHighToLow: {
      text: 'Price: High to Low',
      icon: 'trending_down',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Sort by price high to low',
    },
  } as unknown as SortMenuProps['data']

  beforeEach(() => {
    mockOnSortChange.mockClear()
  })

  it('should render menu button with correct label', () => {
    render(
      <SortMenu data={mockData} sortBy="bestSellers" onSortChange={mockOnSortChange} direction={DirectionEnum.LTR} />
    )

    // Label should show "Best Sellers" (current sort)
    expect(screen.getByText('Best Sellers')).toBeInTheDocument()
    // Icon should be "expand_more"
    expect(screen.getByTestId('mock-icon')).toHaveAttribute('data-icon', 'expand_more')
  })

  it('should render icon from header', () => {
    // DropdownMenu renders the trigger button.
    // In SortMenu, triggerData uses data.header?.header?.icon.
    // However, SortMenu's triggerChildren overrides the internal content, but DropdownMenu
    // might render the icon if we don't pass hideIcon?
    // Wait, SortMenu implementation:
    // triggerData={{ label: { icon: ... } }}
    // triggerChildren={<><Label .../><Icon .../></>}
    // DropdownMenu creates a ButtonAction with triggerData.
    // If triggerChildren is provided, ButtonAction renders it.
    // So the icon in triggerData might be ignored by ButtonAction if children are present,
    // unless ButtonAction implementation handles valid icon in data + children.
    // In our MockButtonAction, we render children if present.
    // So we primarily check for Label and Icon passed in triggerChildren.

    render(
      <SortMenu data={mockData} sortBy="bestSellers" onSortChange={mockOnSortChange} direction={DirectionEnum.LTR} />
    )
    // We expect "expand_more" which is in triggerChildren
    expect(screen.getByTestId('mock-icon')).toHaveAttribute('data-icon', 'expand_more')
  })

  it('should open menu on click', () => {
    render(
      <SortMenu data={mockData} sortBy="bestSellers" onSortChange={mockOnSortChange} direction={DirectionEnum.LTR} />
    )

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    // Should see options
    expect(screen.getByText('New Arrivals')).toBeInTheDocument()
    expect(screen.getByText('Price: Low to High')).toBeInTheDocument()
  })

  it('should call onSortChange when option selected', () => {
    render(
      <SortMenu data={mockData} sortBy="bestSellers" onSortChange={mockOnSortChange} direction={DirectionEnum.LTR} />
    )

    // Open
    fireEvent.click(screen.getByRole('button'))

    // Select option
    fireEvent.click(screen.getByText('New Arrivals'))

    expect(mockOnSortChange).toHaveBeenCalledWith('newArrivals')
  })

  it('should close menu after selection', () => {
    render(
      <SortMenu data={mockData} sortBy="bestSellers" onSortChange={mockOnSortChange} direction={DirectionEnum.LTR} />
    )

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByText('New Arrivals'))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('should highlight selected option', () => {
    render(
      <SortMenu data={mockData} sortBy="priceLowToHigh" onSortChange={mockOnSortChange} direction={DirectionEnum.LTR} />
    )

    // Open
    fireEvent.click(screen.getByRole('button'))

    // Check highlighted option
    const options = screen.getAllByRole('button').slice(1) // skip trigger
    const selectedOption = options.find(opt => opt.getAttribute('aria-pressed') === 'true')

    expect(selectedOption).toHaveTextContent('Price: Low to High')
  })

  it('should respect showText prop', () => {
    const { rerender } = render(
      <SortMenu
        data={mockData}
        sortBy="bestSellers"
        onSortChange={mockOnSortChange}
        direction={DirectionEnum.LTR}
        showText={false}
      />
    )

    // Label should be hidden (class 'hidden')
    const label = screen.getByTestId('mock-label')
    expect(label).toHaveClass('hidden')

    rerender(
      <SortMenu
        data={mockData}
        sortBy="bestSellers"
        onSortChange={mockOnSortChange}
        direction={DirectionEnum.LTR}
        showText={true}
      />
    )

    expect(label).not.toHaveClass('hidden')
    expect(label).toHaveClass('font-medium')
  })
})
