// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { render, screen } from '@testing-library/react'

import { DropdownMenu } from '@/components/menus/DropdownMenu'
import { DirectionEnum } from '@/lib/generated/types.gen'

describe('DropdownMenu', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      render(
        <DropdownMenu>
          <div>Test Content</div>
        </DropdownMenu>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render with default props', () => {
      const { container } = render(
        <DropdownMenu>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('absolute', 'top-full', 'z-50', 'pt-6')
      expect(dropdown).toHaveClass('invisible', 'opacity-0')
      expect(dropdown).toHaveClass('left-0')
    })

    it('should apply custom className to container', () => {
      const { container } = render(
        <DropdownMenu className="mt-4">
          <div>Content</div>
        </DropdownMenu>
      )

      expect(container.firstChild).toHaveClass('mt-4')
    })

    it('should apply custom contentClassName to inner wrapper', () => {
      const { container } = render(
        <DropdownMenu contentClassName="p-6">
          <div>Content</div>
        </DropdownMenu>
      )

      const innerWrapper = container.querySelector('.p-6')
      expect(innerWrapper).toBeInTheDocument()
    })
  })

  describe('Visibility', () => {
    it('should be invisible by default', () => {
      const { container } = render(
        <DropdownMenu>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('invisible', 'opacity-0')
    })

    it('should be visible when isVisible is true', () => {
      const { container } = render(
        <DropdownMenu isVisible={true}>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('visible', 'opacity-100')
    })

    it('should be invisible when isVisible is false', () => {
      const { container } = render(
        <DropdownMenu isVisible={false}>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('invisible', 'opacity-0')
    })
  })

  describe('Alignment', () => {
    it('should align left by default in LTR', () => {
      const { container } = render(
        <DropdownMenu direction={DirectionEnum.LTR}>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('left-0')
      expect(dropdown).not.toHaveClass('right-0')
    })

    it('should align right when align is right', () => {
      const { container } = render(
        <DropdownMenu align="right">
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('right-0')
    })

    it('should align left when explicitly set', () => {
      const { container } = render(
        <DropdownMenu align="left">
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('left-0')
      expect(dropdown).not.toHaveClass('right-0')
    })
  })

  describe('RTL Support', () => {
    it('should swap alignment in RTL mode with left align', () => {
      const { container } = render(
        <DropdownMenu align="left" direction={DirectionEnum.RTL}>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('right-0')
      expect(dropdown).not.toHaveClass('left-0')
    })

    it('should keep right alignment in RTL mode', () => {
      const { container } = render(
        <DropdownMenu align="right" direction={DirectionEnum.RTL}>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('right-0')
    })

    it('should use left alignment in LTR mode by default', () => {
      const { container } = render(
        <DropdownMenu direction={DirectionEnum.LTR}>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('left-0')
      expect(dropdown).not.toHaveClass('right-0')
    })
  })

  describe('Width', () => {
    it('should apply custom width style when provided', () => {
      const { container } = render(
        <DropdownMenu width="500px">
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveStyle({ width: '500px' })
    })

    it('should not apply width style when not provided', () => {
      const { container } = render(
        <DropdownMenu>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown.style.width).toBe('')
    })

    it('should handle responsive width classes', () => {
      const { container } = render(
        <DropdownMenu width="calc(100vw - 2rem)">
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveStyle({ width: 'calc(100vw - 2rem)' })
    })
  })

  describe('Styling', () => {
    it('should have consistent dropdown styling', () => {
      const { container } = render(
        <DropdownMenu>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('absolute', 'top-full', 'z-50', 'pt-6')
      expect(dropdown).toHaveClass('transition-all', 'duration-300')
    })

    it('should have consistent content wrapper styling', () => {
      render(
        <DropdownMenu>
          <div data-testid="test-content">Content</div>
        </DropdownMenu>
      )

      // The content wrapper is the parent of the test content
      const testContent = screen.getByTestId('test-content')
      const contentWrapper = testContent.parentElement!
      expect(contentWrapper).toHaveClass('overflow-hidden', 'rounded-xl')
      expect(contentWrapper).toHaveClass('border', 'border-white/10')
      expect(contentWrapper).toHaveClass('bg-surface-dark', 'shadow-xl')
    })
  })

  describe('Combined Props', () => {
    it('should work with all props combined', () => {
      const { container } = render(
        <DropdownMenu
          isVisible={true}
          align="right"
          width="300px"
          direction={DirectionEnum.RTL}
          className="mb-4"
          contentClassName="p-8"
        >
          <div>Test Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('visible', 'opacity-100')
      expect(dropdown).toHaveClass('right-0')
      expect(dropdown).toHaveClass('mb-4')
      expect(dropdown).toHaveStyle({ width: '300px' })

      const contentWrapper = container.querySelector('.p-8')
      expect(contentWrapper).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should handle visibility toggle correctly', () => {
      const { container, rerender } = render(
        <DropdownMenu isVisible={false}>
          <div>Content</div>
        </DropdownMenu>
      )

      expect(container.firstChild).toHaveClass('invisible', 'opacity-0')

      rerender(
        <DropdownMenu isVisible={true}>
          <div>Content</div>
        </DropdownMenu>
      )

      expect(container.firstChild).toHaveClass('visible', 'opacity-100')
    })
  })

  describe('Complex Content', () => {
    it('should render complex nested content', () => {
      render(
        <DropdownMenu>
          <div>
            <h4>Heading</h4>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </DropdownMenu>
      )

      expect(screen.getByText('Heading')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('should render multiple child elements', () => {
      render(
        <DropdownMenu>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </DropdownMenu>
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
      expect(screen.getByText('Third')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<DropdownMenu>{null}</DropdownMenu>)

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toBeInTheDocument()
    })

    it('should handle undefined direction gracefully', () => {
      const { container } = render(
        <DropdownMenu>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('left-0')
    })

    it('should handle empty width string', () => {
      const { container } = render(
        <DropdownMenu width="">
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveStyle({ width: '' })
    })

    it('should handle left alignment in LTR explicitly', () => {
      const { container } = render(
        <DropdownMenu align="left" direction={DirectionEnum.LTR}>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('left-0')
      expect(dropdown).not.toHaveClass('right-0')
    })

    it('should handle right alignment in LTR', () => {
      const { container } = render(
        <DropdownMenu align="right" direction={DirectionEnum.LTR}>
          <div>Content</div>
        </DropdownMenu>
      )

      const dropdown = container.firstChild as HTMLElement
      expect(dropdown).toHaveClass('right-0')
    })
  })
})
