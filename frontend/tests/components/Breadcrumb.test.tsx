// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { render, screen } from '@testing-library/react'
import { Breadcrumb, type BreadcrumbItem } from '@/components/Breadcrumb'

describe('Breadcrumb', () => {
  const mockItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', isCurrentPage: true },
  ]

  it('should render breadcrumb navigation', () => {
    render(<Breadcrumb items={mockItems} />)

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
  })

  it('should render all breadcrumb items', () => {
    render(<Breadcrumb items={mockItems} />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('should render links for items with href', () => {
    render(<Breadcrumb items={mockItems} />)

    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toHaveAttribute('href', '/')

    const productsLink = screen.getByRole('link', { name: 'Products' })
    expect(productsLink).toHaveAttribute('href', '/products')
  })

  it('should render current page without link', () => {
    render(<Breadcrumb items={mockItems} />)

    const electronics = screen.getByText('Electronics')
    expect(electronics.tagName).toBe('SPAN')
    expect(electronics).toHaveAttribute('aria-current', 'page')
  })

  it('should add test ID to home link', () => {
    render(<Breadcrumb items={mockItems} />)

    expect(screen.getByTestId('breadcrumb-home')).toBeInTheDocument()
    expect(screen.getByTestId('breadcrumb-home')).toHaveAttribute('href', '/')
  })

  it('should apply custom className', () => {
    render(<Breadcrumb items={mockItems} className="custom-class" />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('custom-class')
  })

  it('should return null for empty items array', () => {
    const { container } = render(<Breadcrumb items={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('should handle single item', () => {
    const singleItem: BreadcrumbItem[] = [{ label: 'Home', href: '/' }]
    render(<Breadcrumb items={singleItem} />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryAllByRole('img')).toHaveLength(0) // No separator for single item
  })

  it('should render separators between items', () => {
    const { container } = render(<Breadcrumb items={mockItems} />)

    const separators = container.querySelectorAll('svg')
    // Should have n-1 separators for n items
    expect(separators).toHaveLength(mockItems.length - 1)
  })

  it('should handle item without href and not marked as current page', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Category' }, // No href, not current
    ]
    render(<Breadcrumb items={items} />)

    const category = screen.getByText('Category')
    expect(category.tagName).toBe('SPAN')
    // Last item gets aria-current="page" by default
    expect(category).toHaveAttribute('aria-current', 'page')
  })

  it('should style last item differently', () => {
    render(<Breadcrumb items={mockItems} />)

    const electronics = screen.getByText('Electronics')
    expect(electronics).toHaveClass('font-medium')
  })

  it('should handle RTL separator rotation', () => {
    const { container } = render(<Breadcrumb items={mockItems} />)

    const separators = container.querySelectorAll('svg')
    separators.forEach(separator => {
      expect(separator).toHaveClass('rtl:rotate-180')
    })
  })

  it('should render items with both href and isCurrentPage as spans', () => {
    const items: BreadcrumbItem[] = [{ label: 'Home', href: '/', isCurrentPage: true }]
    render(<Breadcrumb items={items} />)

    const home = screen.getByText('Home')
    expect(home.tagName).toBe('SPAN')
  })
})
