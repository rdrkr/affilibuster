// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilter, type Category } from '@/components/CategoryFilter'

// Mock the Dropdown component
jest.mock('@/components/Dropdown', () => ({
  Dropdown: ({
    value,
    items,
    onChange,
    ariaLabel,
    'data-testid': testId,
  }: {
    value: string
    items: { value: string; label: string }[]
    onChange: (value: string) => void
    ariaLabel: string
    'data-testid'?: string
  }) => (
    <div data-testid={testId}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={e => {
          onChange(e.target.value)
        }}
      >
        {items.map(item => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  ),
}))

describe('CategoryFilter', () => {
  const mockCategories: Category[] = [
    { id: 'electronics', name: 'Electronics' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'sports', name: 'Sports & Outdoors' },
  ]

  const mockOnCategoryChange = jest.fn()

  beforeEach(() => {
    mockOnCategoryChange.mockClear()
  })

  it('should render category filter', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
        allCategoriesLabel="All Categories"
      />
    )

    expect(screen.getByTestId('category-filter')).toBeInTheDocument()
  })

  it('should render all categories', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
        allCategoriesLabel="All Categories"
      />
    )

    expect(screen.getByText('All Categories')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByText('Home & Garden')).toBeInTheDocument()
    expect(screen.getByText('Sports & Outdoors')).toBeInTheDocument()
  })

  it('should call onCategoryChange with null when "All Categories" is selected', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="electronics"
        onCategoryChange={mockOnCategoryChange}
        allCategoriesLabel="All Categories"
      />
    )

    const select = screen.getByLabelText('Filter by category')
    fireEvent.change(select, { target: { value: '' } })
    expect(mockOnCategoryChange).toHaveBeenCalledWith(null)
  })

  it('should call onCategoryChange with category ID when category is selected', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
        allCategoriesLabel="All Categories"
      />
    )

    const select = screen.getByLabelText('Filter by category')
    fireEvent.change(select, { target: { value: 'electronics' } })
    expect(mockOnCategoryChange).toHaveBeenCalledWith('electronics')
  })

  it('should show selected category', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="electronics"
        onCategoryChange={mockOnCategoryChange}
        allCategoriesLabel="All Categories"
      />
    )

    const select = screen.getByLabelText('Filter by category') as HTMLSelectElement
    expect(select.value).toBe('electronics')
  })

  it('should show "All Categories" when no category is selected', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
        allCategoriesLabel="All Categories"
      />
    )

    const select = screen.getByLabelText('Filter by category') as HTMLSelectElement
    expect(select.value).toBe('')
  })

  it('should handle empty categories array', () => {
    render(
      <CategoryFilter
        categories={[]}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
        allCategoriesLabel="All Categories"
      />
    )

    expect(screen.getByTestId('category-filter')).toBeInTheDocument()
    expect(screen.getByText('All Categories')).toBeInTheDocument()
  })

  it('should use custom class name', () => {
    const { container } = render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
        allCategoriesLabel="All Categories"
        className="custom-class"
      />
    )

    const wrapper = container.querySelector('.custom-class')
    expect(wrapper).toBeInTheDocument()
  })

  it('should create items with correct structure', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
        allCategoriesLabel="All Categories"
      />
    )

    // Should have "All Categories" + 3 category options
    const select = screen.getByLabelText('Filter by category')
    const options = select.querySelectorAll('option')
    expect(options).toHaveLength(4)
  })
})
