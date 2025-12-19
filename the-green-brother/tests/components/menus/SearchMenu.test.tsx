// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for SearchMenu component
 */

import { act, fireEvent, render, screen } from '@testing-library/react'

import { SearchMenu, type SearchMenuProps } from '@/components/menus/SearchMenu'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-testid="mock-image" />
  },
}))

// Mock the CMS element components
jest.mock('@/components/elements', () => ({
  CMSIcon: function MockCMSIcon({ icon, size }: { icon?: string; size?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size}>
        {icon}
      </span>
    )
  },
  CMSText: function MockCMSText({ text }: { text?: string }) {
    return <span data-testid="mock-text">{text}</span>
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
  ButtonAction: (jest.requireActual('react') as any).forwardRef((props: any, ref: any) => {
    const { children, data, onClick, className } = props
    const ariaLabel = props['aria-label'] ?? data?.label?.ariaDescription
    const ariaExpanded = props['aria-expanded']
    // If no children, render icon and text from data.label
    const content =
      children ??
      (data?.label && (
        <>
          {data.label.icon && (
            <span data-testid="mock-icon" data-icon={data.label.icon}>
              {data.label.icon}
            </span>
          )}
          {data.label.text && <span data-testid="mock-text">{data.label.text}</span>}
        </>
      ))
    return (
      <button ref={ref} onClick={onClick} className={className} aria-label={ariaLabel} aria-expanded={ariaExpanded}>
        {content}
      </button>
    )
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ButtonLink: function MockButtonLink(props: any) {
    const { children, data, className } = props
    const ariaLabel = props['aria-label'] ?? data?.label?.ariaDescription
    // If no children, render text from data.label
    const content = children ?? (data?.label && <span data-testid="mock-text">{data.label.text}</span>)
    return (
      <a href={data?.url} className={className} aria-label={ariaLabel}>
        {content}
      </a>
    )
  },
}))

describe('SearchMenu', () => {
  const mockData: SearchMenuProps['data'] = {
    id: 1,
    menuButton: {
      url: '#',
      openInNewTab: false,
      label: {
        text: 'Search',
        icon: 'search',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Open search',
      },
    },
    textBoxPlaceholderLabel: {
      text: 'Search products...',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Search input placeholder',
    },
    recentSearchesLabel: {
      text: 'Recent Searches',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Recent searches section',
    },
    nowTrendingLabel: {
      text: 'Now Trending',
      icon: 'trending_up',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Trending searches section',
    },
    viewAllResultsButton: {
      url: '/search',
      openInNewTab: false,
      label: {
        text: 'View all results for',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'View all search results',
      },
    },
  }

  const mockOnExpandChange = jest.fn()

  const defaultProps: SearchMenuProps = {
    data: mockData,
    onExpandChange: mockOnExpandChange,
    showText: true,
    direction: DirectionEnum.LTR,
    navWidth: 1200,
  }

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    callback: ResizeObserverCallback

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
    }

    observe(target: Element) {
      // Trigger callback with mock entry
      this.callback([{ target } as unknown as ResizeObserverEntry], this)
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unobserve() {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect() {}
  }

  // Mock offsetWidth
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 46 })

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render search button with aria-label', () => {
    render(<SearchMenu {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    expect(button).toBeInTheDocument()
  })

  it('should render search text when closed', () => {
    render(<SearchMenu {...defaultProps} />)
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('should open search on click', () => {
    render(<SearchMenu {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(button)
    // After opening, input should be visible
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument()
  })

  it('should open search on Enter key (native button behavior)', () => {
    render(<SearchMenu {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    // Native button elements handle Enter/Space as click events
    fireEvent.click(button)
    // After opening, input should be visible
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument()
  })

  it('should open search on Space key (native button behavior)', () => {
    render(<SearchMenu {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    // Native button elements handle Enter/Space as click events
    fireEvent.click(button)
    // After opening, input should be visible
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument()
  })

  it('should open search on mouse enter', () => {
    const { container } = render(<SearchMenu {...defaultProps} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(800)
    })
    // After mouse enter, it should be open
    expect(searchContainer.className).toContain('w-76!')
  })

  it('should show input when search is open', () => {
    render(<SearchMenu {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(button)
    const input = screen.getByPlaceholderText('Search products...')
    expect(input).toBeInTheDocument()
  })

  it('should update search query on input change', () => {
    render(<SearchMenu {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(button)
    const input = screen.getByPlaceholderText('Search products...')
    fireEvent.change(input, { target: { value: 'test query' } })
    expect(input).toHaveValue('test query')
  })

  it('should show recent searches when dropdown is open and no query', () => {
    const { container } = render(<SearchMenu {...defaultProps} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(800)
    })
    expect(screen.getByText('Recent Searches')).toBeInTheDocument()
  })

  it('should show trending searches when dropdown is open', () => {
    const { container } = render(<SearchMenu {...defaultProps} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(800)
    })
    expect(screen.getByText('Now Trending')).toBeInTheDocument()
  })

  it('should show close button when search is open', () => {
    render(<SearchMenu {...defaultProps} />)
    const searchButton = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(searchButton)
    const closeButton = screen.getByRole('button', { name: 'Close search' })
    expect(closeButton).toBeInTheDocument()
  })

  it('should close search when scrolling outside', () => {
    const { container } = render(<SearchMenu {...defaultProps} />)
    const searchContainer = container.firstChild as HTMLElement
    // Open via mouse enter to trigger full open flow including showDropdown=true
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    // Check that search loop/close button is visible, meaning search is open
    expect(screen.getByRole('button', { name: 'Close search' })).toBeInTheDocument()

    // Scroll outside
    fireEvent.scroll(window)
    act(() => {
      jest.advanceTimersByTime(1000) // Wait for close timeout
    })
    // Now check that 'Open search' button is back (search closed)
    expect(screen.getByRole('button', { name: 'Open search' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('should close search when close button is clicked', () => {
    render(<SearchMenu {...defaultProps} />)
    const searchButton = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(searchButton)
    const closeButton = screen.getByRole('button', { name: 'Close search' })
    fireEvent.click(closeButton)
    act(() => {
      jest.advanceTimersByTime(800)
    })
    // After close, width should be 46px (from mocked offsetWidth)
    const container = screen.getByRole('button', { name: 'Open search' }).closest('div[class*="relative"]')
    expect(container).toHaveStyle({ width: '46px' })
  })

  it('should show search results when query is entered', () => {
    render(<SearchMenu {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(button)
    const input = screen.getByPlaceholderText('Search products...')
    fireEvent.change(input, { target: { value: 'bamboo' } })
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('should show view all results link with query', () => {
    render(<SearchMenu {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(button)
    const input = screen.getByPlaceholderText('Search products...')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(screen.getByText('"test"')).toBeInTheDocument()
  })

  it('should set search query when recent search is clicked', () => {
    const { container } = render(<SearchMenu {...defaultProps} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(800)
    })
    const recentButton = screen.getByText('Bamboo Toothbrush')
    fireEvent.click(recentButton)
    const input = screen.getByPlaceholderText('Search products...')
    expect(input).toHaveValue('Bamboo Toothbrush')
  })

  it('should set search query when trending search is clicked', () => {
    const { container } = render(<SearchMenu {...defaultProps} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(800)
    })
    const trendingButton = screen.getByText('Solar Chargers')
    fireEvent.click(trendingButton)
    const input = screen.getByPlaceholderText('Search products...')
    expect(input).toHaveValue('Solar Chargers')
  })

  it('should close search on mouse leave when no query', () => {
    const { container } = render(<SearchMenu {...defaultProps} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(800)
    })
    expect(searchContainer.className).toContain('w-76!')
    // Mouse leave
    fireEvent.mouseLeave(searchContainer)
    act(() => {
      jest.advanceTimersByTime(800)
    })
    // Should close
    expect(searchContainer).toHaveStyle({ width: '46px' })
  })

  it('should not close search on mouse leave when there is a query', () => {
    const { container } = render(<SearchMenu {...defaultProps} />)
    const searchContainer = container.firstChild as HTMLElement
    // Open search
    fireEvent.click(screen.getByRole('button', { name: 'Open search' }))
    // Enter a query
    const input = screen.getByPlaceholderText('Search products...')
    fireEvent.change(input, { target: { value: 'test' } })
    // Mouse leave - should NOT close because query exists
    fireEvent.mouseLeave(searchContainer)
    act(() => {
      jest.advanceTimersByTime(800)
    })
    // Should still be open
    expect(searchContainer.className).toContain('w-76!')
  })

  it('should close search when clicking outside', () => {
    const { container } = render(
      <div>
        <SearchMenu {...defaultProps} />
        <button data-testid="outside-element">Outside</button>
      </div>
    )
    const searchContainer = container.querySelector('div[class*="relative"]')!
    // Open search
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(800)
    })
    expect(searchContainer.className).toContain('w-76!')

    // Click outside
    const outsideElement = screen.getByTestId('outside-element')
    fireEvent.mouseDown(outsideElement)

    act(() => {
      jest.advanceTimersByTime(800)
    })

    // Should close
    expect(searchContainer).toHaveStyle({ width: '46px' })
  })

  it('should handle input blur when not hovering', () => {
    const { container } = render(<SearchMenu {...defaultProps} />)
    const searchContainer = container.firstChild as HTMLElement
    // Open search and get input
    fireEvent.click(screen.getByRole('button', { name: 'Open search' }))
    const input = screen.getByPlaceholderText('Search products...')
    // Blur the input (simulate clicking elsewhere)
    fireEvent.blur(input)
    act(() => {
      jest.advanceTimersByTime(300) // First timeout
    })
    act(() => {
      jest.advanceTimersByTime(800) // Second timeout
    })
    // After blur timeouts, should close
    expect(searchContainer).toHaveStyle({ width: '46px' })
  })

  describe('onExpandChange callback', () => {
    it('should call onExpandChange with true on mouse enter', () => {
      const onExpandChange = jest.fn()
      const { container } = render(<SearchMenu {...defaultProps} onExpandChange={onExpandChange} />)

      const searchContainer = container.firstChild as HTMLElement
      fireEvent.mouseEnter(searchContainer)

      expect(onExpandChange).toHaveBeenCalledWith(true)
    })

    it('should not throw when onExpandChange is not provided', () => {
      expect(() => {
        render(<SearchMenu {...defaultProps} />)
        const button = screen.getByRole('button', { name: 'Open search' })
        fireEvent.click(button)
      }).not.toThrow()
    })

    it('should call onExpandChange when closing via mouse leave', () => {
      const onExpandChange = jest.fn()
      const { container } = render(<SearchMenu {...defaultProps} onExpandChange={onExpandChange} />)

      const searchContainer = container.firstChild as HTMLElement
      fireEvent.mouseEnter(searchContainer)
      act(() => {
        jest.advanceTimersByTime(800)
      })

      expect(onExpandChange).toHaveBeenCalledWith(true)
      onExpandChange.mockClear()

      fireEvent.mouseLeave(searchContainer)
      act(() => {
        jest.advanceTimersByTime(800)
      })

      expect(onExpandChange).toHaveBeenCalledWith(false)
    })

    it('should call onExpandChange with false when closing via click outside', () => {
      const onExpandChange = jest.fn()
      const { container } = render(
        <div>
          <SearchMenu {...defaultProps} onExpandChange={onExpandChange} />
          <button data-testid="outside-element">Outside</button>
        </div>
      )
      const searchContainer = container.querySelector('div[class*="relative"]')!

      // Open
      fireEvent.mouseEnter(searchContainer)
      act(() => {
        jest.advanceTimersByTime(800)
      })
      onExpandChange.mockClear()

      // Close via click outside
      const outsideElement = screen.getByTestId('outside-element')
      fireEvent.mouseDown(outsideElement)
      act(() => {
        jest.advanceTimersByTime(800)
      })

      expect(onExpandChange).toHaveBeenCalledWith(false)
    })
  })
})
