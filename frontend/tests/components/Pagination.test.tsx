// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from '@/components/Pagination'

describe('Pagination', () => {
  const mockOnPageChange = jest.fn()

  beforeEach(() => {
    mockOnPageChange.mockClear()
  })

  it('should render pagination component', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />)

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
  })

  it('should render page numbers', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should highlight current page', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)

    const currentButton = screen.getByText('3')
    expect(currentButton).toHaveClass('bg-primary-800')
    expect(currentButton).toHaveAttribute('aria-current', 'page')
  })

  it('should call onPageChange when page number is clicked', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />)

    fireEvent.click(screen.getByText('3'))
    expect(mockOnPageChange).toHaveBeenCalledWith(3)
  })

  it('should render Previous button', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)

    expect(screen.getByTestId('pagination-prev')).toBeInTheDocument()
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument()
  })

  it('should render Next button', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)

    expect(screen.getByTestId('pagination-next')).toBeInTheDocument()
    expect(screen.getByLabelText('Next page')).toBeInTheDocument()
  })

  it('should call onPageChange with previous page when Previous is clicked', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)

    fireEvent.click(screen.getByTestId('pagination-prev'))
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('should call onPageChange with next page when Next is clicked', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)

    fireEvent.click(screen.getByTestId('pagination-next'))
    expect(mockOnPageChange).toHaveBeenCalledWith(4)
  })

  it('should disable Previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />)

    const prevButton = screen.getByTestId('pagination-prev')
    expect(prevButton).toBeDisabled()
  })

  it('should disable Next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />)

    const nextButton = screen.getByTestId('pagination-next')
    expect(nextButton).toBeDisabled()
  })

  it('should not call onPageChange when Previous is clicked on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />)

    fireEvent.click(screen.getByTestId('pagination-prev'))
    expect(mockOnPageChange).not.toHaveBeenCalled()
  })

  it('should not call onPageChange when Next is clicked on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />)

    fireEvent.click(screen.getByTestId('pagination-next'))
    expect(mockOnPageChange).not.toHaveBeenCalled()
  })

  it('should call onPageChange even when current page is clicked', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)

    fireEvent.click(screen.getByText('3'))
    expect(mockOnPageChange).toHaveBeenCalledWith(3)
  })

  it('should render sliding window for large page counts', () => {
    render(<Pagination currentPage={5} totalPages={20} onPageChange={mockOnPageChange} />)

    // Component shows max 5 consecutive pages (sliding window)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('should show sliding window in large pagination', () => {
    render(<Pagination currentPage={10} totalPages={20} onPageChange={mockOnPageChange} />)

    // Component shows 5 consecutive pages around current page
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('should return null for single page', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />)

    // Component returns null when totalPages <= 1 (no pagination needed)
    expect(container.firstChild).toBeNull()
  })

  it('should return null for zero total pages', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={0} onPageChange={mockOnPageChange} />)

    // Component returns null when totalPages <= 1
    expect(container.firstChild).toBeNull()
  })

  it('should have correct test IDs for page buttons', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)

    expect(screen.getByTestId('pagination-page-1')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-page-2')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-page-3')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-page-4')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-page-5')).toBeInTheDocument()
  })

  it('should use Button component which supports dark mode', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />)

    // Pagination uses Button component which handles dark mode internally
    const button = screen.getByText('1')
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveClass('rounded-lg') // Button component styling
  })

  it('should render correct page range for middle pages', () => {
    render(<Pagination currentPage={10} totalPages={20} onPageChange={mockOnPageChange} />)

    // Should show pages around current page
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('should adjust page range when near the end', () => {
    render(<Pagination currentPage={7} totalPages={8} onPageChange={mockOnPageChange} />)

    // When near end with totalPages > maxVisible, should show last 5 pages
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })
})
