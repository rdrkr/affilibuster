// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/Hero'

describe('Hero Component', () => {
  describe('Basic Rendering', () => {
    it('should render with title', () => {
      render(<Hero title="Welcome to Affilibuster" />)
      expect(screen.getByText('Welcome to Affilibuster')).toBeInTheDocument()
    })

    it('should render with title and subtitle', () => {
      render(<Hero title="Test Title" subtitle="Test Subtitle" />)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    })

    it('should render without subtitle when not provided', () => {
      const { container } = render(<Hero title="Test Title" />)
      const subtitle = container.querySelector('p')
      expect(subtitle).not.toBeInTheDocument()
    })

    it('should render children when provided', () => {
      render(
        <Hero title="Test Title">
          <div data-testid="child-content">Child Content</div>
        </Hero>
      )
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('Child Content')).toBeInTheDocument()
    })
  })

  describe('Bold Text Highlighting', () => {
    it('should render bold text with **text** syntax', () => {
      const { container } = render(<Hero title="Welcome to **Affilibuster**" />)
      const highlightedText = container.querySelector('span.text-secondary-400')
      expect(highlightedText).toBeInTheDocument()
      expect(highlightedText).toHaveTextContent('Affilibuster')
    })

    it('should handle multiple bold sections', () => {
      const { container } = render(<Hero title="**First** and **Second** bold" />)
      const highlightedSpans = container.querySelectorAll('span.text-secondary-400')
      expect(highlightedSpans).toHaveLength(2)
      expect(highlightedSpans[0]).toHaveTextContent('First')
      expect(highlightedSpans[1]).toHaveTextContent('Second')
    })

    it('should render plain text when no bold markers', () => {
      const { container } = render(<Hero title="Plain Title" />)
      const highlightedSpans = container.querySelectorAll('span.text-secondary-400')
      expect(highlightedSpans).toHaveLength(0)
    })
  })

  describe('Size Variants', () => {
    it('should apply large size classes by default', () => {
      const { container } = render(<Hero title="Test" />)
      const heading = container.querySelector('h1')
      expect(heading).toHaveClass('text-5xl', 'md:text-6xl')
      const section = container.querySelector('section')
      expect(section).toHaveClass('py-20')
    })

    it('should apply small size classes', () => {
      const { container } = render(<Hero title="Test" size="small" />)
      const heading = container.querySelector('h1')
      expect(heading).toHaveClass('text-4xl', 'md:text-5xl')
      const section = container.querySelector('section')
      expect(section).toHaveClass('py-12')
    })

    it('should apply medium size classes', () => {
      const { container } = render(<Hero title="Test" size="medium" />)
      const heading = container.querySelector('h1')
      expect(heading).toHaveClass('text-5xl', 'md:text-6xl')
      const section = container.querySelector('section')
      expect(section).toHaveClass('py-16')
    })
  })

  describe('Styling', () => {
    it('should have gradient background', () => {
      const { container } = render(<Hero title="Test" />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('bg-gradient-to-br', 'from-primary-800', 'via-primary-700', 'to-primary-900')
    })

    it('should have white text', () => {
      const { container } = render(<Hero title="Test" />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('text-white')
    })

    it('should apply custom className', () => {
      const { container } = render(<Hero title="Test" className="custom-class" />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('custom-class')
    })

    it('should have container and centering classes', () => {
      const { container } = render(<Hero title="Test" />)
      const contentContainer = container.querySelector('.container')
      expect(contentContainer).toBeInTheDocument()
      expect(contentContainer).toHaveClass('mx-auto', 'px-4')
    })

    it('should have max-width and centered content', () => {
      const { container } = render(<Hero title="Test" />)
      const innerContainer = container.querySelector('.max-w-4xl')
      expect(innerContainer).toBeInTheDocument()
      expect(innerContainer).toHaveClass('mx-auto', 'text-center')
    })
  })

  describe('Accessibility', () => {
    it('should render h1 for title', () => {
      render(<Hero title="Test Title" />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Test Title')
    })

    it('should use semantic section element', () => {
      const { container } = render(<Hero title="Test" />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<Hero title="" />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('')
    })

    it('should handle title with only bold markers', () => {
      render(<Hero title="****" />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })

    it('should handle empty subtitle', () => {
      const { container } = render(<Hero title="Test" subtitle="" />)
      const paragraph = container.querySelector('p')
      expect(paragraph).not.toBeInTheDocument()
    })
  })

  describe('Complex Content', () => {
    it('should render complex children structure', () => {
      render(
        <Hero title="Test">
          <div>
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </div>
        </Hero>
      )
      expect(screen.getByText('First paragraph')).toBeInTheDocument()
      expect(screen.getByText('Second paragraph')).toBeInTheDocument()
    })

    it('should handle title with mixed bold and plain text', () => {
      const { container } = render(<Hero title="Welcome to **Affilibuster** - the best **platform**" />)
      expect(screen.getByText(/Welcome to/)).toBeInTheDocument()
      expect(screen.getByText(/the best/)).toBeInTheDocument()
      const highlightedSpans = container.querySelectorAll('span.text-secondary-400')
      expect(highlightedSpans).toHaveLength(2)
    })
  })
})
