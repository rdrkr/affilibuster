// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for SearchMenu component
 */

import { act, fireEvent, render, screen } from '@testing-library/react'

import { SearchMenu, type SearchMenuProps } from '@/components/menus/SearchMenu'
import { IconPositionEnum } from '@/lib/generated/types.gen'

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
  CMSText: function MockCMSText({ text }: { text?: string }) {
    return <span data-testid="mock-text">{text}</span>
  },
  resolveIcon: (icon: string | undefined) => (icon ? { value: icon, type: 'material' } : null),
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

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render search button with aria-label', () => {
    render(<SearchMenu data={mockData} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    expect(button).toBeInTheDocument()
  })

  it('should render search text when closed', () => {
    render(<SearchMenu data={mockData} />)
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('should open search on click', () => {
    render(<SearchMenu data={mockData} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(button)
    expect(button.className).toContain('ring-1')
  })

  it('should open search on Enter key', () => {
    render(<SearchMenu data={mockData} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(button.className).toContain('ring-1')
  })

  it('should open search on Space key', () => {
    render(<SearchMenu data={mockData} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.keyDown(button, { key: ' ' })
    expect(button.className).toContain('ring-1')
  })

  it('should open search on mouse enter', () => {
    const { container } = render(<SearchMenu data={mockData} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(400)
    })
    // After mouse enter, it should be open
    expect(searchContainer.className).toContain('w-[200px]')
  })

  it('should show input when search is open', () => {
    render(<SearchMenu data={mockData} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(button)
    const input = screen.getByPlaceholderText('Search products...')
    expect(input).toBeInTheDocument()
  })

  it('should update search query on input change', () => {
    render(<SearchMenu data={mockData} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(button)
    const input = screen.getByPlaceholderText('Search products...')
    fireEvent.change(input, { target: { value: 'test query' } })
    expect(input).toHaveValue('test query')
  })

  it('should show recent searches when dropdown is open and no query', () => {
    const { container } = render(<SearchMenu data={mockData} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(400)
    })
    expect(screen.getByText('Recent Searches')).toBeInTheDocument()
  })

  it('should show trending searches when dropdown is open', () => {
    const { container } = render(<SearchMenu data={mockData} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(400)
    })
    expect(screen.getByText('Now Trending')).toBeInTheDocument()
  })

  it('should show close button when search is open', () => {
    render(<SearchMenu data={mockData} />)
    const searchButton = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(searchButton)
    const closeButton = screen.getByRole('button', { name: 'Close search' })
    expect(closeButton).toBeInTheDocument()
  })

  it('should close search when close button is clicked', () => {
    render(<SearchMenu data={mockData} />)
    const searchButton = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(searchButton)
    const closeButton = screen.getByRole('button', { name: 'Close search' })
    fireEvent.click(closeButton)
    act(() => {
      jest.advanceTimersByTime(400)
    })
    // After close, width should shrink
    const container = screen.getByRole('button', { name: 'Open search' }).closest('div[class*="relative"]')
    expect(container?.className).toContain('w-10')
  })

  it('should show search results when query is entered', () => {
    render(<SearchMenu data={mockData} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(button)
    const input = screen.getByPlaceholderText('Search products...')
    fireEvent.change(input, { target: { value: 'bamboo' } })
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('should show view all results link with query', () => {
    render(<SearchMenu data={mockData} />)
    const button = screen.getByRole('button', { name: 'Open search' })
    fireEvent.click(button)
    const input = screen.getByPlaceholderText('Search products...')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(screen.getByText('View all results for')).toBeInTheDocument()
  })

  it('should set search query when recent search is clicked', () => {
    const { container } = render(<SearchMenu data={mockData} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(400)
    })
    const recentButton = screen.getByText('Bamboo Toothbrush')
    fireEvent.click(recentButton)
    const input = screen.getByPlaceholderText('Search products...')
    expect(input).toHaveValue('Bamboo Toothbrush')
  })

  it('should set search query when trending search is clicked', () => {
    const { container } = render(<SearchMenu data={mockData} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(400)
    })
    const trendingButton = screen.getByText('Solar Chargers')
    fireEvent.click(trendingButton)
    const input = screen.getByPlaceholderText('Search products...')
    expect(input).toHaveValue('Solar Chargers')
  })

  it('should close search on mouse leave when no query', () => {
    const { container } = render(<SearchMenu data={mockData} />)
    const searchContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(400)
    })
    expect(searchContainer.className).toContain('w-[200px]')
    // Mouse leave
    fireEvent.mouseLeave(searchContainer)
    act(() => {
      jest.advanceTimersByTime(400)
    })
    // Should close
    expect(searchContainer.className).toContain('w-10')
  })

  it('should not close search on mouse leave when there is a query', () => {
    const { container } = render(<SearchMenu data={mockData} />)
    const searchContainer = container.firstChild as HTMLElement
    // Open search
    fireEvent.click(screen.getByRole('button', { name: 'Open search' }))
    // Enter a query
    const input = screen.getByPlaceholderText('Search products...')
    fireEvent.change(input, { target: { value: 'test' } })
    // Mouse leave - should NOT close because query exists
    fireEvent.mouseLeave(searchContainer)
    act(() => {
      jest.advanceTimersByTime(400)
    })
    // Should still be open
    expect(searchContainer.className).toContain('w-[200px]')
  })

  it('should close search when clicking outside', () => {
    const { container } = render(
      <div>
        <SearchMenu data={mockData} />
        <button data-testid="outside-element">Outside</button>
      </div>
    )
    const searchContainer = container.querySelector('div[class*="relative"]')!
    // Open search
    fireEvent.mouseEnter(searchContainer)
    act(() => {
      jest.advanceTimersByTime(400)
    })
    expect(searchContainer.className).toContain('w-[200px]')
    // Click outside
    const outsideElement = screen.getByTestId('outside-element')
    fireEvent.mouseDown(outsideElement)
    // Should close
    expect(searchContainer.className).toContain('w-10')
  })

  it('should handle input blur when not hovering', () => {
    const { container } = render(<SearchMenu data={mockData} />)
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
      jest.advanceTimersByTime(400) // Second timeout
    })
    // After blur timeouts, should close
    expect(searchContainer.className).toContain('w-10')
  })
})
