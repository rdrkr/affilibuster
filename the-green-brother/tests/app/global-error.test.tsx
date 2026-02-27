// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for the global error boundary component.
 *
 * Tests GlobalErrorContent (the inner UI) with testing-library/react for
 * interactive behavior. Tests the outer GlobalError wrapper with
 * renderToString since JSDOM cannot nest html/body inside a test container.
 */

import GlobalError, { GlobalErrorContent } from '@/app/global-error'
import { fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

describe('GlobalErrorContent', () => {
  const mockReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render retry button', () => {
    const error = new Error('Root error')

    render(<GlobalErrorContent error={error} reset={mockReset} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should call reset when retry button is clicked', () => {
    const error = new Error('Root error')

    render(<GlobalErrorContent error={error} reset={mockReset} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('should display error digest when available', () => {
    const error = Object.assign(new Error('Test error'), { digest: 'GLOBAL_ERR_123' })

    render(<GlobalErrorContent error={error} reset={mockReset} />)

    expect(screen.getByText('GLOBAL_ERR_123')).toBeInTheDocument()
  })

  it('should not render digest paragraph when digest is not available', () => {
    const error = new Error('No digest')

    const { container } = render(<GlobalErrorContent error={error} reset={mockReset} />)

    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(0)
  })
})

describe('GlobalError', () => {
  it('should render html element with lang attribute', () => {
    const error = new Error('Server error')
    const reset = jest.fn()

    const html = renderToString(<GlobalError error={error} reset={reset} />)

    expect(html).toContain('<html lang="en">')
    expect(html).toContain('<body>')
  })

  it('should render error digest inside html shell', () => {
    const error = Object.assign(new Error('Server error'), { digest: 'SHELL_123' })
    const reset = jest.fn()

    const html = renderToString(<GlobalError error={error} reset={reset} />)

    expect(html).toContain('SHELL_123')
  })
})
