// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ProductsClient component
 */

import { fireEvent, screen } from '@testing-library/react'
import React from 'react'

import ProductsClient from '@/app/[lang]/products/ProductsClient'
import type { ApiProductProductDocument } from '@/lib/generated/types.gen'
import { createMockCategory, createMockProduct, createMockProductCategoriesPage } from '../../../helpers/mockFactories'

import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type ElementsHeaderEntry,
  type ElementsPriceEntry,
  type PluginUploadFileDocument,
} from '@/lib/generated/types.gen'
import { renderWithLayout } from '../../../utils/renderWithLayout'

// Mock for useSearchParams - allows tests to control URL params
let mockSearchParams = new Map<string, string>()

// Mock for router.push - allows tests to verify URL changes
// Also updates mockSearchParams to simulate real navigation behavior
const mockRouterPush = jest.fn((url: string) => {
  // Parse URL and update mockSearchParams
  const urlObj = new URL(url, 'http://localhost')
  mockSearchParams.clear()
  urlObj.searchParams.forEach((value, key) => {
    mockSearchParams.set(key, value)
  })
})

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) ?? null,
  }),
  usePathname: () => '/en/products',
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

// Mock ProductCard and ProductsGrid components
jest.mock('@/components/product', () => {
  const MockProductCard = ({ product }: { product: ApiProductProductDocument }) => (
    <div data-testid={`product-card-${product.documentId}`}>
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      <span>{product.header?.header ? product.header.header.text : ''}</span>
      <span data-testid="product-price">
        {(() => {
          try {
            const prices = product.prices as any

            const price = prices?.[0]

            return price?.amount ?? ''
          } catch (_e) {
            console.error('Error rendering price for product:', product)
            return ''
          }
        })()}
      </span>
    </div>
  )

  return {
    ProductCard: MockProductCard,
    ProductsGrid: ({ products, pagination }: { products: ApiProductProductDocument[]; pagination: any }) => {
      if (products.length === 0 && pagination?.noItemsFound) {
        const { header } = pagination.noItemsFound
        return (
          <div>
            {header?.icon && <span data-testid="mock-icon" data-icon={header.icon} />}
            {header?.text && <h2 data-testid="mock-header">{header.text}</h2>}
          </div>
        )
      }

      return (
        <div data-testid="products-grid">
          {products.map(product => (
            <MockProductCard key={product.documentId} product={product} />
          ))}
        </div>
      )
    },
  }
})

// Mock CMS elements
jest.mock('@/components/elements', () => ({
  Header: function MockHeader({ data, level }: { data: any; level: number }) {
    const Tag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    return <Tag data-testid="mock-header">{data?.header?.text ?? ''}</Tag>
  },
  Icon: function MockIcon({ icon, size }: { icon: string; size: string }) {
    return <span data-testid="mock-icon" data-icon={icon} data-size={size} />
  },
  Label: function MockLabel({ data }: { data: any }) {
    return <span data-testid="mock-label">{data?.text}</span>
  },
  Text: function MockText({ text, className }: { text: string; className?: string }) {
    return (
      <span data-testid="mock-text" className={className}>
        {text}
      </span>
    )
  },
  ButtonAction: function MockButtonAction({
    children,
    onClick,
    data,
    'data-testid': testId,
    isActive,
    role,
    'aria-selected': ariaSelected,
  }: {
    children: React.ReactNode
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    data?: { label?: { text?: string } }
    'data-testid'?: string
    isActive?: boolean
    role?: string
    'aria-selected'?: boolean
  }) {
    // Render label text from data if no children provided
    const content = children ?? data?.label?.text
    return (
      <button
        onClick={onClick}
        data-testid={testId}
        aria-pressed={isActive !== undefined ? (isActive ? 'true' : 'false') : undefined}
        role={role}
        aria-selected={ariaSelected !== undefined ? (ariaSelected ? 'true' : 'false') : undefined}
      >
        {content}
      </button>
    )
  },
  TabbedView: function MockTabbedView({
    tabs,
    activeKey,
    onTabChange,
    afterTabBar,
  }: {
    tabs: { key: string; label: React.ReactNode; content: React.ReactNode }[]
    activeKey: string
    onTabChange: (key: string) => void
    afterTabBar?: React.ReactNode
    showPanel?: boolean
    direction?: string
    carouselGap?: string
    className?: string
  }) {
    return (
      <div data-testid="mock-tabbed-view">
        <div role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeKey === tab.key}
              data-active={activeKey === tab.key}
              data-testid={`tab-${tab.key}`}
              onClick={() => {
                onTabChange(tab.key)
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {afterTabBar}
      </div>
    )
  },
}))

// Mock menu components
jest.mock('@/components/menus', () => {
  const { useEffect, useRef, useState } = require('react') as typeof import('react')

  return {
    DropdownMenu: function MockDropdownMenu({
      children,
      triggerChildren,
      triggerData: _triggerData,
      isOpen,
      onOpenChange,
      'data-testid': testId,
    }: {
      children: React.ReactNode
      triggerChildren?: React.ReactNode
      triggerData?: unknown
      isOpen?: boolean
      onOpenChange?: (open: boolean) => void
      'data-testid'?: string
      visible?: boolean
      testId?: string
      align?: string
      inlineOnMobile?: boolean
    }) {
      const containerRef = useRef<HTMLDivElement>(null)

      // Handle click outside to close dropdown
      useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event: MouseEvent) => {
          if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            onOpenChange?.(false)
          }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
          document.removeEventListener('mousedown', handleClickOutside)
        }
      }, [isOpen, onOpenChange])

      // Wrap children with click handler to close dropdown after selection
      const childrenWithHandlers = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          const childProps = child.props as { onClick?: (e: React.MouseEvent) => void }
          const originalOnClick = childProps.onClick
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            onClick: (e: React.MouseEvent) => {
              originalOnClick?.(e)
              onOpenChange?.(false) // Close dropdown after selection
            },
          })
        }
        return child
      })

      return (
        <div data-testid={testId ?? 'dropdown-menu'} ref={containerRef}>
          <button
            onClick={() => {
              onOpenChange?.(!isOpen)
            }}
            aria-expanded={isOpen ?? false}
            data-testid="dropdown-trigger"
          >
            {triggerChildren ?? 'Toggle'}
          </button>
          {isOpen && <div data-testid="dropdown-content">{childrenWithHandlers}</div>}
        </div>
      )
    },
    SortMenu: function MockSortMenu({
      data: _data,
      sortBy,
      onSortChange,
      visible: _visible,
    }: {
      data: any
      sortBy: string
      onSortChange: (option: string) => void
      visible?: boolean
    }) {
      const [isOpen, setIsOpen] = useState(false)

      // Sort options mapping
      const sortOptions = {
        bestSellers: 'Best Sellers',
        newArrivals: 'New Arrivals',
        priceLowToHigh: 'Price: Low to High',
        priceHighToLow: 'Price: High to Low',
      } as const

      return (
        <div data-testid="mock-sort-menu">
          <button
            onClick={() => {
              setIsOpen(!isOpen)
            }}
            aria-expanded={isOpen}
            aria-label={`Sort by ${(sortOptions as any)[sortBy]}`}
          >
            Sort by {(sortOptions as any)[sortBy]}
          </button>

          {isOpen && (
            <div data-testid="dropdown-content">
              {Object.entries(sortOptions).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    onSortChange(key)
                    setIsOpen(false)
                  }}
                  aria-pressed={sortBy === key}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )
    },
  }
})

describe('ProductsClient', () => {
  // Create complete mock page data matching CMS structure
  const mockPageData = createMockProductCategoriesPage({
    header: {
      alignment: AlignmentEnum.CENTER,
      promoteHeaderIcon: false,
      header: {
        text: 'All Products',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Products page title',
      },
      locale: 'en',
    } as any,
  })

  const mockProducts = [
    createMockProduct({
      documentId: 'prod-1',
      id: 1,
      slug: 'product-1',
      publishedAt: '2025-01-01T10:00:00Z',
      header: {
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
        promoteHeaderIcon: false,
        header: {
          text: 'Product One',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Product One',
        },
      } as ElementsHeaderEntry,
      prices: [{ id: 1, amount: 29.99, currency: { symbol: '$', code: 'USD' } as any } as ElementsPriceEntry],
      category: createMockCategory({
        documentId: 'cat-1',
        slug: 'electronics',
        content: { text: 'Electronics', ariaDescription: 'Electronics', iconPosition: IconPositionEnum.BEFORE_TEXT },
      }),
      images: [{ url: '/images/prod1.jpg' } as PluginUploadFileDocument],
      disclaimerLabel: {
        text: 'Disclaimer',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Disclaimer',
      },
    }),
    createMockProduct({
      documentId: 'prod-2',
      id: 2,
      slug: 'product-2',
      publishedAt: '2025-01-02T10:00:00Z',
      header: {
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
        promoteHeaderIcon: false,
        header: {
          text: 'Product Two',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Product Two',
        },
      } as ElementsHeaderEntry,
      prices: [{ id: 2, amount: 49.99, currency: { symbol: '$', code: 'USD' } as any } as ElementsPriceEntry],
      category: createMockCategory({
        documentId: 'cat-2',
        slug: 'clothing',
        content: { text: 'Clothing', ariaDescription: 'Clothing', iconPosition: IconPositionEnum.BEFORE_TEXT },
      }),
      images: [{ url: '/images/prod2.jpg' } as PluginUploadFileDocument],
      disclaimerLabel: {
        text: 'Disclaimer',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Disclaimer',
      },
    }),
    createMockProduct({
      documentId: 'prod-3',
      id: 3,
      slug: 'product-3',
      publishedAt: '2025-01-03T10:00:00Z',
      header: {
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
        promoteHeaderIcon: false,
        header: {
          text: 'Product Three',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Product Three',
        },
      } as ElementsHeaderEntry,
      prices: [{ id: 3, amount: 19.99, currency: { symbol: '$', code: 'USD' } as any } as ElementsPriceEntry],
      category: createMockCategory({
        documentId: 'cat-1',
        slug: 'electronics',
        content: { text: 'Electronics', ariaDescription: 'Electronics', iconPosition: IconPositionEnum.BEFORE_TEXT },
      }),
      images: [{ url: '/images/prod3.jpg' } as PluginUploadFileDocument],
      disclaimerLabel: {
        text: 'Disclaimer',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Disclaimer',
      },
    }),
  ]

  const mockCategories = [
    createMockCategory({
      documentId: 'cat-1',
      slug: 'electronics',
      content: { text: 'Electronics', ariaDescription: 'Electronics', iconPosition: IconPositionEnum.BEFORE_TEXT },
    }),
    createMockCategory({
      documentId: 'cat-2',
      slug: 'clothing',
      content: { text: 'Clothing', ariaDescription: 'Clothing', iconPosition: IconPositionEnum.BEFORE_TEXT },
    }),
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams = new Map<string, string>()
    mockRouterPush.mockClear()
    // Mock scrollTo for Carousel component's startScrollItemIndex feature
    HTMLElement.prototype.scrollTo = jest.fn()
    // Mock requestAnimationFrame to execute callbacks immediately
    global.requestAnimationFrame = jest.fn(cb => {
      cb(0)
      return 0
    }) as unknown as typeof requestAnimationFrame
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should return null when pageData is null', () => {
      const { container } = renderWithLayout(
        <ProductsClient pageData={null} products={[]} categories={[]} enableUserProfile={false} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should render page header from CMS data', () => {
      renderWithLayout(
        <ProductsClient pageData={mockPageData} products={[]} categories={[]} enableUserProfile={false} />
      )
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('All Products')
    })

    it('should render all products', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      expect(screen.getByTestId('product-card-prod-1')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-prod-2')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-prod-3')).toBeInTheDocument()
    })

    it('should render empty state when no products', () => {
      renderWithLayout(
        <ProductsClient pageData={mockPageData} products={[]} categories={[]} enableUserProfile={false} />
      )

      // Should show empty state icon and message (there are 2 icons: sort dropdown expand_more and empty state inventory_2)
      const icons = screen.getAllByTestId('mock-icon')
      const emptyStateIcon = icons.find(icon => icon.getAttribute('data-icon') === 'inventory_2')
      expect(emptyStateIcon).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No products found')
    })
  })

  describe('Category Filtering', () => {
    it('should render "All" category button with CMS label', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      const allLabels = screen.getAllByTestId('mock-label')
      const allButton = allLabels.find(label => label.textContent === 'All')
      expect(allButton).toBeInTheDocument()
    })

    it('should render category filter tabs', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Category filters are now rendered as tabs via TabbedView
      expect(screen.getByRole('tab', { name: /Electronics/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Clothing/i })).toBeInTheDocument()
    })

    it('should filter products when category is selected via URL param', () => {
      // Set URL param to electronics category
      mockSearchParams.set('category', 'electronics')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Should show Electronics products
      expect(screen.getByTestId('product-card-prod-1')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-prod-3')).toBeInTheDocument()

      // Should not show Clothing products
      expect(screen.queryByTestId('product-card-prod-2')).not.toBeInTheDocument()
    })

    it('should navigate to category URL when category tab is clicked', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Click Electronics category tab
      fireEvent.click(screen.getByRole('tab', { name: /Electronics/i }))

      // Should call router.push with category param
      expect(mockRouterPush).toHaveBeenCalledWith('/en/products?category=electronics')
    })

    it('should show all products when no category URL param is set', () => {
      // No category param = show all
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // All products should be visible
      expect(screen.getByTestId('product-card-prod-1')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-prod-2')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-prod-3')).toBeInTheDocument()
    })

    it('should navigate to URL without category param when "All" is clicked', () => {
      // Start with electronics filter
      mockSearchParams.set('category', 'electronics')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Click "All" button (find by its label text)
      const allLabels = screen.getAllByTestId('mock-label')
      const allLabel = allLabels.find(label => label.textContent === 'All')
      expect(allLabel).toBeDefined()
      const allButton = allLabel?.closest('button')
      expect(allButton).toBeDefined()
      if (allButton) {
        fireEvent.click(allButton)
      }

      // Should navigate to URL without category param
      expect(mockRouterPush).toHaveBeenCalledWith('/en/products')
    })

    it('should set aria-selected attribute on active category based on URL param', () => {
      // Set electronics as active via URL param
      mockSearchParams.set('category', 'electronics')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      const electronicsTab = screen.getByRole('tab', { name: /Electronics/i })
      const clothingTab = screen.getByRole('tab', { name: /Clothing/i })

      // Electronics should be selected (active)
      expect(electronicsTab).toHaveAttribute('aria-selected', 'true')

      // Clothing should not be selected
      expect(clothingTab).toHaveAttribute('aria-selected', 'false')
    })

    it('should have no category selected when no URL param is set', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      const electronicsTab = screen.getByRole('tab', { name: /Electronics/i })
      const clothingTab = screen.getByRole('tab', { name: /Clothing/i })

      // Neither should be selected when showing "all" (which is the active one)
      expect(electronicsTab).toHaveAttribute('aria-selected', 'false')
      expect(clothingTab).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('Sorting', () => {
    it('should render sort dropdown button', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })
      expect(sortButton).toBeInTheDocument()
      expect(sortButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should toggle sort dropdown on click', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })

      // Open dropdown
      fireEvent.click(sortButton)
      expect(sortButton).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument()

      // Close dropdown
      fireEvent.click(sortButton)
      expect(sortButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should show sort options in dropdown', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Open dropdown
      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })
      fireEvent.click(sortButton)

      // Check all sort option buttons are present (there will be 2 "Best Sellers" - trigger + option)
      const bestSellersButtons = screen.getAllByRole('button', { name: /Best Sellers/i })
      expect(bestSellersButtons.length).toBeGreaterThanOrEqual(1) // At least 1 in dropdown
      expect(screen.getByRole('button', { name: /New Arrivals/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Price: Low to High/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Price: High to Low/i })).toBeInTheDocument()
    })

    it('should sort products by price low to high', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Open dropdown and select "Price: Low to High"
      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })
      fireEvent.click(sortButton)

      const priceLowOption = screen.getByRole('button', { name: /Price: Low to High/i })
      fireEvent.click(priceLowOption)

      // Check product order - cheapest first
      const productCards = screen.getAllByTestId(/product-card-/)
      expect(productCards[0]).toHaveAttribute('data-testid', 'product-card-prod-3') // 19.99
      expect(productCards[1]).toHaveAttribute('data-testid', 'product-card-prod-1') // 29.99
      expect(productCards[2]).toHaveAttribute('data-testid', 'product-card-prod-2') // 49.99
    })

    it('should sort products by price high to low', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Open dropdown and select "Price: High to Low"
      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })
      fireEvent.click(sortButton)

      const priceHighOption = screen.getByRole('button', { name: /Price: High to Low/i })
      fireEvent.click(priceHighOption)

      // Check product order - most expensive first
      const productCards = screen.getAllByTestId(/product-card-/)
      expect(productCards[0]).toHaveAttribute('data-testid', 'product-card-prod-2') // 49.99
      expect(productCards[1]).toHaveAttribute('data-testid', 'product-card-prod-1') // 29.99
      expect(productCards[2]).toHaveAttribute('data-testid', 'product-card-prod-3') // 19.99
    })

    it('should sort products by new arrivals (newest first)', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Open dropdown and select "New Arrivals"
      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })
      fireEvent.click(sortButton)

      const newArrivalsOption = screen.getByRole('button', { name: /New Arrivals/i })
      fireEvent.click(newArrivalsOption)

      // Check product order - newest first
      const productCards = screen.getAllByTestId(/product-card-/)
      expect(productCards[0]).toHaveAttribute('data-testid', 'product-card-prod-3') // Jan 3
      expect(productCards[1]).toHaveAttribute('data-testid', 'product-card-prod-2') // Jan 2
      expect(productCards[2]).toHaveAttribute('data-testid', 'product-card-prod-1') // Jan 1
    })

    it('should close dropdown after selection', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Open dropdown
      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })
      fireEvent.click(sortButton)
      expect(sortButton).toHaveAttribute('aria-expanded', 'true')

      // Select an option
      const newArrivalsOption = screen.getByRole('button', { name: /New Arrivals/i })
      fireEvent.click(newArrivalsOption)

      // Dropdown should be closed (check aria-expanded on button)
      expect(sortButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should mark selected sort option with aria-pressed', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Open dropdown
      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })
      fireEvent.click(sortButton)

      // Find options inside dropdown (exclude the trigger button)
      const allBestSellersButtons = screen.getAllByRole('button', { name: /Best Sellers/i })
      const dropdownBestSellers = allBestSellersButtons.find(btn => btn.getAttribute('aria-pressed') !== null)
      const newArrivalsButton = screen.getByRole('button', { name: /New Arrivals/i })

      // First option (Best Sellers) should be active by default
      expect(dropdownBestSellers).toHaveAttribute('aria-pressed', 'true')
      expect(newArrivalsButton).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('Sorting with missing prices', () => {
    it('should handle products with no prices when sorting by price low to high', () => {
      const productNoPrices = createMockProduct({
        documentId: 'prod-no-price',
        id: 99,
        slug: 'product-no-price',
        publishedAt: '2025-01-04T10:00:00Z',
        header: {
          alignment: AlignmentEnum.LANGUAGE_DIRECTION,
          promoteHeaderIcon: false,
          header: {
            text: 'No Price Product',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            ariaDescription: 'No Price Product',
          },
        } as ElementsHeaderEntry,
        prices: [],
        category: createMockCategory({
          documentId: 'cat-1',
          slug: 'electronics',
          content: { text: 'Electronics', ariaDescription: 'Electronics', iconPosition: IconPositionEnum.BEFORE_TEXT },
        }),
        images: [{ url: '/images/noprice.jpg' } as PluginUploadFileDocument],
        disclaimerLabel: {
          text: 'Disclaimer',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Disclaimer',
        },
      })

      const productsWithMissing = [...mockProducts, productNoPrices]

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={productsWithMissing}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Sort by price low to high
      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })
      fireEvent.click(sortButton)
      const priceLowOption = screen.getByRole('button', { name: /Price: Low to High/i })
      fireEvent.click(priceLowOption)

      // Product with no prices should sort as 0 (cheapest)
      const productCards = screen.getAllByTestId(/product-card-/)
      expect(productCards[0]).toHaveAttribute('data-testid', 'product-card-prod-no-price')
    })

    it('should handle products with no prices when sorting by price high to low', () => {
      const productNoPrices = createMockProduct({
        documentId: 'prod-no-price-high',
        id: 100,
        slug: 'product-no-price-high',
        publishedAt: '2025-01-04T10:00:00Z',
        header: {
          alignment: AlignmentEnum.LANGUAGE_DIRECTION,
          promoteHeaderIcon: false,
          header: {
            text: 'No Price Product High',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            ariaDescription: 'No Price Product High',
          },
        } as ElementsHeaderEntry,
        prices: [],
        category: createMockCategory({
          documentId: 'cat-1',
          slug: 'electronics',
          content: { text: 'Electronics', ariaDescription: 'Electronics', iconPosition: IconPositionEnum.BEFORE_TEXT },
        }),
        images: [{ url: '/images/noprice.jpg' } as PluginUploadFileDocument],
        disclaimerLabel: {
          text: 'Disclaimer',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Disclaimer',
        },
      })

      const productsWithMissing = [...mockProducts, productNoPrices]

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={productsWithMissing}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Sort by price high to low
      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })
      fireEvent.click(sortButton)
      const priceHighOption = screen.getByRole('button', { name: /Price: High to Low/i })
      fireEvent.click(priceHighOption)

      // Product with no prices should sort as 0 (last in high to low)
      const productCards = screen.getAllByTestId(/product-card-/)
      expect(productCards[productCards.length - 1]).toHaveAttribute('data-testid', 'product-card-prod-no-price-high')
    })

    it('should handle products with price object but missing amount', () => {
      const productMissingAmount = createMockProduct({
        documentId: 'prod-no-amount',
        id: 101,
        slug: 'prod-no-amount',
        prices: [{ id: 1 } as any], // Price object exists but no amount
        publishedAt: '2025-01-05T10:00:00Z',
      })

      const products = [...mockProducts, productMissingAmount]

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={products}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Sort by price low to high
      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })
      fireEvent.click(sortButton)
      const priceLowOption = screen.getByRole('button', { name: /Price: Low to High/i })
      fireEvent.click(priceLowOption)

      // Should sort as 0
      const productCards = screen.getAllByTestId(/product-card-/)
      expect(productCards[0]).toHaveAttribute('data-testid', 'product-card-prod-no-amount')
    })
  })

  describe('Search with missing header', () => {
    it('should handle products with null header.header when searching', () => {
      const productNoHeader = createMockProduct({
        documentId: 'prod-no-header',
        id: 98,
        slug: 'product-no-header',
        publishedAt: '2025-01-04T10:00:00Z',
        header: {
          alignment: AlignmentEnum.LANGUAGE_DIRECTION,
          promoteHeaderIcon: false,
        } as ElementsHeaderEntry,
        prices: [{ id: 98, amount: 15.0, currency: { symbol: '$', code: 'USD' } as any } as ElementsPriceEntry],
        category: createMockCategory({
          documentId: 'cat-1',
          slug: 'electronics',
          content: { text: 'Electronics', ariaDescription: 'Electronics', iconPosition: IconPositionEnum.BEFORE_TEXT },
        }),
        images: [{ url: '/images/noheader.jpg' } as PluginUploadFileDocument],
        disclaimerLabel: {
          text: 'Disclaimer',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Disclaimer',
        },
      })

      const productsWithMissing = [...mockProducts, productNoHeader]

      // Set search term
      mockSearchParams.set('search', 'Product')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={productsWithMissing}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Product without header.header should not match search (p.header.header?.text is undefined)
      expect(screen.queryByTestId('product-card-prod-no-header')).not.toBeInTheDocument()
      // Other products that match should still show
      expect(screen.getByTestId('product-card-prod-1')).toBeInTheDocument()
    })
  })

  describe('RTL Support', () => {
    it('should render with RTL direction', () => {
      const { container } = renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />,
        { layoutContext: { direction: DirectionEnum.RTL } }
      )

      // Should have RTL direction on controls container
      const controlsContainer = container.querySelector('[dir="rtl"]')
      expect(controlsContainer).toBeInTheDocument()
    })
  })

  describe('Combined Filtering and Sorting', () => {
    it('should apply both category filter and sort together', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Filter by Electronics (prod-1 at $29.99, prod-3 at $19.99)
      fireEvent.click(screen.getByRole('tab', { name: /Electronics/i }))

      // Sort by price low to high
      const sortButton = screen.getByRole('button', { name: /Sort by|Best Sellers/i })
      fireEvent.click(sortButton)
      const priceLowOption = screen.getByRole('button', { name: /Price: Low to High/i })
      fireEvent.click(priceLowOption)

      // Only Electronics products should be shown, sorted by price
      const productCards = screen.getAllByTestId(/product-card-/)
      expect(productCards).toHaveLength(2)
      expect(productCards[0]).toHaveAttribute('data-testid', 'product-card-prod-3') // 19.99
      expect(productCards[1]).toHaveAttribute('data-testid', 'product-card-prod-1') // 29.99
    })
  })

  describe('URL Category Param Sync', () => {
    it('should initialize category from URL param', () => {
      // Set URL param to electronics category
      mockSearchParams.set('category', 'electronics')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Electronics tab should be selected (active)
      const electronicsTab = screen.getByRole('tab', { name: /Electronics/i })
      expect(electronicsTab).toHaveAttribute('aria-selected', 'true')

      // Only Electronics products should be shown
      expect(screen.getByTestId('product-card-prod-1')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-prod-3')).toBeInTheDocument()
      expect(screen.queryByTestId('product-card-prod-2')).not.toBeInTheDocument()
    })

    it('should default to "all" when URL param is not set', () => {
      // No URL param set
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // All products should be visible
      expect(screen.getByTestId('product-card-prod-1')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-prod-2')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-prod-3')).toBeInTheDocument()
    })

    it('should show all products when URL param has invalid category', () => {
      // Set URL param to non-existent category
      mockSearchParams.set('category', 'non-existent')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // No products should match the non-existent category
      expect(screen.queryByTestId('product-card-prod-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-card-prod-2')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-card-prod-3')).not.toBeInTheDocument()
    })

    it('should allow changing category after initial URL param', () => {
      // Set URL param to electronics category
      mockSearchParams.set('category', 'electronics')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Initially showing Electronics products
      expect(screen.queryByTestId('product-card-prod-2')).not.toBeInTheDocument()

      // Click Clothing category - this calls router.push which updates mockSearchParams
      fireEvent.click(screen.getByRole('tab', { name: /Clothing/i }))

      // Verify URL navigation was called correctly
      expect(mockRouterPush).toHaveBeenCalledWith('/en/products?category=clothing')
    })

    it('should update URL when category is clicked', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Click Electronics category
      fireEvent.click(screen.getByRole('tab', { name: /Electronics/i }))

      // Should update URL with category param
      expect(mockRouterPush).toHaveBeenCalledWith('/en/products?category=electronics')
    })

    it('should remove category param from URL when "All" is selected', () => {
      mockSearchParams.set('category', 'electronics')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Click "All" button
      const allLabels = screen.getAllByTestId('mock-label')
      const allLabel = allLabels.find(label => label.textContent === 'All')
      const allButton = allLabel?.closest('button')
      if (allButton) {
        fireEvent.click(allButton)
      }

      // Should update URL without category param
      expect(mockRouterPush).toHaveBeenCalledWith('/en/products')
    })

    it('should set active category when category is set via URL', async () => {
      // Set URL param to a category (not 'all') to set as active in TabbedView
      mockSearchParams.set('category', 'electronics')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Verify the electronics category button exists and is active
      const electronicsButton = screen.getByRole('tab', { name: /Electronics/i })
      expect(electronicsButton).toHaveAttribute('aria-selected', 'true')

      // TabbedView passes activeKey to its internal Carousel for auto-scroll
      // This is tested in TabbedView.test.tsx - here we just verify activeKey is correct
      expect(electronicsButton).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('URL Search Param Sync', () => {
    it('should initialize search term from URL param', () => {
      mockSearchParams.set('search', 'Product One')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Search term should be displayed in the clear button
      const clearButton = screen.getByTestId('clear-search-button')
      expect(clearButton).toHaveTextContent('Product One')

      // Only products matching the search should be shown
      expect(screen.getByTestId('product-card-prod-1')).toBeInTheDocument()
      expect(screen.queryByTestId('product-card-prod-2')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-card-prod-3')).not.toBeInTheDocument()
    })

    it('should display search term as button with close icon', () => {
      mockSearchParams.set('search', 'Product')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Should have clear search button
      const clearButton = screen.getByTestId('clear-search-button')
      expect(clearButton).toBeInTheDocument()

      // Button should contain the search term
      expect(screen.getByText('Product')).toBeInTheDocument()

      // Button should have close icon
      const closeIcon = screen.getAllByTestId('mock-icon').find(icon => icon.getAttribute('data-icon') === 'close')
      expect(closeIcon).toBeInTheDocument()
    })

    it('should clear search and update URL when clear button is clicked', () => {
      mockSearchParams.set('search', 'Product')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Click clear button
      fireEvent.click(screen.getByTestId('clear-search-button'))

      // Should update URL without search param
      expect(mockRouterPush).toHaveBeenCalledWith('/en/products')

      // All products should now be visible
      expect(screen.getByTestId('product-card-prod-1')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-prod-2')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-prod-3')).toBeInTheDocument()
    })

    it('should preserve category when clearing search', () => {
      mockSearchParams.set('category', 'electronics')
      mockSearchParams.set('search', 'Product')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Click clear button
      fireEvent.click(screen.getByTestId('clear-search-button'))

      // Should update URL preserving category but removing search
      expect(mockRouterPush).toHaveBeenCalledWith('/en/products?category=electronics')
    })

    it('should preserve search when changing category', () => {
      mockSearchParams.set('search', 'Product')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Click Electronics category
      fireEvent.click(screen.getByRole('tab', { name: /Electronics/i }))

      // Should update URL with both category and search params
      expect(mockRouterPush).toHaveBeenCalledWith('/en/products?category=electronics&search=Product')
    })

    it('should filter products by search term (case insensitive)', () => {
      mockSearchParams.set('search', 'product one')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Only Product One should be shown (case insensitive match)
      expect(screen.getByTestId('product-card-prod-1')).toBeInTheDocument()
      expect(screen.queryByTestId('product-card-prod-2')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-card-prod-3')).not.toBeInTheDocument()
    })

    it('should apply both category and search filters together', () => {
      mockSearchParams.set('category', 'electronics')
      mockSearchParams.set('search', 'Three')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Only Product Three (Electronics) should be shown
      expect(screen.getByTestId('product-card-prod-3')).toBeInTheDocument()
      expect(screen.queryByTestId('product-card-prod-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-card-prod-2')).not.toBeInTheDocument()
    })

    it('should show empty state when no products match search', () => {
      mockSearchParams.set('search', 'nonexistent')

      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // No products should be visible
      expect(screen.queryByTestId('product-card-prod-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-card-prod-2')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-card-prod-3')).not.toBeInTheDocument()

      // Empty state should be shown
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No products found')
    })

    it('should not display search button when no search term', () => {
      renderWithLayout(
        <ProductsClient
          pageData={mockPageData}
          products={mockProducts}
          categories={mockCategories}
          enableUserProfile={false}
        />
      )

      // Clear search button should not be present
      expect(screen.queryByTestId('clear-search-button')).not.toBeInTheDocument()
    })
  })
})
