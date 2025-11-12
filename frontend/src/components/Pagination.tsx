// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Pagination Component
 * Provides page navigation controls for paginated lists
 */

'use client'

import { Button } from './Button'

export interface PaginationProps {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number
  /**
   * Total number of pages
   */
  totalPages: number
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Pagination component for navigating through multiple pages of content.
 *
 * @param props - Pagination component props
 * @returns Rendered pagination controls
 */
export function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page: number) => {
    onPageChange(page)
  }

  // Generate page numbers to display (show max 5 pages)
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show current page and surrounding pages
      let start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxVisible - 1)

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className={`flex items-center justify-center space-x-2 ${className}`} aria-label="Pagination">
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Previous page"
        data-testid="pagination-prev"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      {/* Page Numbers */}
      {pageNumbers.map(page => (
        <Button
          key={page}
          variant={page === currentPage ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => {
            handlePageClick(page)
          }}
          aria-label={`Page ${String(page)}`}
          aria-current={page === currentPage ? 'page' : undefined}
          data-testid={`pagination-page-${String(page)}`}
        >
          {page}
        </Button>
      ))}

      {/* Next Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        data-testid="pagination-next"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </nav>
  )
}
