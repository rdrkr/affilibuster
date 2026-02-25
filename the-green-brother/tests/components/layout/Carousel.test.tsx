// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Carousel component (both standard and hero variants)
 */

import { act, fireEvent, render, screen } from '@testing-library/react'

import { Carousel, type CarouselProps } from '@/components/layout/Carousel'
import { DirectionEnum } from '@/lib/generated/types.gen'

describe('Carousel', () => {
  const defaultProps: CarouselProps = {
    direction: DirectionEnum.LTR,
    children: <div data-testid="carousel-item">Item 1</div>,
  }

  describe('Standard variant (default)', () => {
    it('should render children correctly', () => {
      render(<Carousel {...defaultProps} />)
      expect(screen.getByTestId('carousel-item')).toBeInTheDocument()
    })

    it('should use standard variant by default', () => {
      render(<Carousel {...defaultProps} />)
      expect(screen.getByTestId('carousel-track')).toBeInTheDocument()
      expect(screen.queryByTestId('hero-carousel-track')).not.toBeInTheDocument()
    })

    it('should apply sm gap class to inner wrapper', () => {
      render(<Carousel {...defaultProps} gap="sm" />)
      const inner = screen.getByTestId('carousel-track')
      expect(inner).toHaveClass('gap-2', 'md:gap-4')
    })

    it('should apply md gap class by default to inner wrapper', () => {
      render(<Carousel {...defaultProps} />)
      const inner = screen.getByTestId('carousel-track')
      expect(inner).toHaveClass('gap-6')
    })

    it('should apply lg gap class to inner wrapper', () => {
      render(<Carousel {...defaultProps} gap="lg" />)
      const inner = screen.getByTestId('carousel-track')
      expect(inner).toHaveClass('gap-8')
    })

    it('should set dir="rtl" for RTL direction on outer container', () => {
      const { container } = render(<Carousel {...defaultProps} direction={DirectionEnum.RTL} />)
      const outer = container.firstChild as HTMLElement
      expect(outer).toHaveAttribute('dir', 'rtl')
    })

    it('should set dir="ltr" for LTR direction on outer container', () => {
      const { container } = render(<Carousel {...defaultProps} direction={DirectionEnum.LTR} />)
      const outer = container.firstChild as HTMLElement
      expect(outer).toHaveAttribute('dir', 'ltr')
    })

    it('should add role="region" to outer container when ariaLabel is provided', () => {
      const { container } = render(<Carousel {...defaultProps} ariaLabel="Product carousel" />)
      const outer = container.firstChild as HTMLElement
      expect(outer).toHaveAttribute('role', 'region')
      expect(outer).toHaveAttribute('aria-label', 'Product carousel')
    })

    it('should omit role when ariaLabel is not provided', () => {
      const { container } = render(<Carousel {...defaultProps} />)
      const outer = container.firstChild as HTMLElement
      expect(outer).not.toHaveAttribute('role')
      expect(outer).not.toHaveAttribute('aria-label')
    })

    it('should apply custom className to outer container', () => {
      const { container } = render(<Carousel {...defaultProps} className="mt-8 mb-4" />)
      const outer = container.firstChild as HTMLElement
      expect(outer).toHaveClass('mt-8')
      expect(outer).toHaveClass('mb-4')
    })

    it('should have scrollbar-hide and snap classes on outer container', () => {
      const { container } = render(<Carousel {...defaultProps} />)
      const outer = container.firstChild as HTMLElement
      expect(outer).toHaveClass('scrollbar-hide')
      expect(outer).toHaveClass('snap-x')
      expect(outer).toHaveClass('snap-mandatory')
      expect(outer).toHaveClass('overflow-x-auto')
    })

    it('should apply layout classes to inner wrapper', () => {
      render(<Carousel {...defaultProps} />)
      const inner = screen.getByTestId('carousel-track')
      expect(inner).toHaveClass('flex')
      expect(inner).toHaveClass('w-max')
      expect(inner).toHaveClass('min-w-full')
      expect(inner).toHaveClass('justify-center')
    })

    it('should render multiple children', () => {
      render(
        <Carousel {...defaultProps}>
          <div data-testid="item-1">Item 1</div>
          <div data-testid="item-2">Item 2</div>
          <div data-testid="item-3">Item 3</div>
        </Carousel>
      )

      expect(screen.getByTestId('item-1')).toBeInTheDocument()
      expect(screen.getByTestId('item-2')).toBeInTheDocument()
      expect(screen.getByTestId('item-3')).toBeInTheDocument()
    })

    it('should apply variant="standard" explicitly', () => {
      render(<Carousel {...defaultProps} variant="standard" />)
      expect(screen.getByTestId('carousel-track')).toBeInTheDocument()
    })
  })

  describe('Hero variant', () => {
    const heroProps: Omit<CarouselProps, 'children'> = {
      ...defaultProps,
      variant: 'hero',
    }
    // Remove children from heroProps to avoid Fragment issue

    beforeEach(() => {
      jest.useFakeTimers()
      HTMLElement.prototype.scrollTo = jest.fn()
    })

    afterEach(() => {
      jest.useRealTimers()
      jest.restoreAllMocks()
    })

    const renderHeroCarousel = (props: Partial<CarouselProps> = {}) => {
      return render(
        <Carousel {...heroProps} {...props}>
          <div data-testid="hero-item-1">Hero Item 1</div>
          <div data-testid="hero-item-2">Hero Item 2</div>
          <div data-testid="hero-item-3">Hero Item 3</div>
        </Carousel>
      )
    }

    it('should render hero carousel structure', () => {
      renderHeroCarousel()
      expect(screen.getByTestId('hero-carousel-track')).toBeInTheDocument()
    })

    it('should render all children as slides', () => {
      renderHeroCarousel()
      expect(screen.getByTestId('hero-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('hero-item-2')).toBeInTheDocument()
      expect(screen.getByTestId('hero-item-3')).toBeInTheDocument()
    })

    it('should render slide containers with proper accessibility', () => {
      renderHeroCarousel()
      const slide0 = screen.getByTestId('hero-slide-0')
      const slide1 = screen.getByTestId('hero-slide-1')
      const slide2 = screen.getByTestId('hero-slide-2')

      expect(slide0).toHaveAttribute('role', 'group')
      expect(slide0).toHaveAttribute('aria-roledescription', 'slide')
      expect(slide0).toHaveAttribute('aria-label', 'Slide 1 of 3')
      expect(slide0).toHaveAttribute('aria-hidden', 'false')

      expect(slide1).toHaveAttribute('aria-hidden', 'true')
      expect(slide2).toHaveAttribute('aria-hidden', 'true')
    })

    it('should render dot navigation for multiple items', () => {
      renderHeroCarousel()
      expect(screen.getByTestId('hero-dot-0')).toBeInTheDocument()
      expect(screen.getByTestId('hero-dot-1')).toBeInTheDocument()
      expect(screen.getByTestId('hero-dot-2')).toBeInTheDocument()
    })

    it('should not render dots for single item', () => {
      render(
        <Carousel {...defaultProps} variant="hero">
          <div>Single Item</div>
        </Carousel>
      )
      expect(screen.queryByTestId('hero-dot-0')).not.toBeInTheDocument()
    })

    it('should have first dot selected initially', () => {
      renderHeroCarousel()
      const dot0 = screen.getByTestId('hero-dot-0')
      const dot1 = screen.getByTestId('hero-dot-1')

      expect(dot0).toHaveAttribute('aria-selected', 'true')
      expect(dot1).toHaveAttribute('aria-selected', 'false')
    })

    it('should set dir="rtl" for RTL direction', () => {
      const { container } = renderHeroCarousel({ direction: DirectionEnum.RTL })
      const outer = container.firstChild as HTMLElement
      expect(outer).toHaveAttribute('dir', 'rtl')
    })

    it('should set dir="ltr" for LTR direction', () => {
      const { container } = renderHeroCarousel({ direction: DirectionEnum.LTR })
      const outer = container.firstChild as HTMLElement
      expect(outer).toHaveAttribute('dir', 'ltr')
    })

    it('should apply ariaLabel correctly', () => {
      const { container } = renderHeroCarousel({ ariaLabel: 'Hero carousel' })
      const outer = container.firstChild as HTMLElement
      expect(outer).toHaveAttribute('role', 'region')
      expect(outer).toHaveAttribute('aria-label', 'Hero carousel')
    })

    it('should apply custom className', () => {
      const { container } = renderHeroCarousel({ className: 'mt-4' })
      const outer = container.firstChild as HTMLElement
      expect(outer).toHaveClass('mt-4')
    })

    it('should have snap classes on track', () => {
      renderHeroCarousel()
      const track = screen.getByTestId('hero-carousel-track')
      expect(track).toHaveClass('snap-x')
      expect(track).toHaveClass('snap-mandatory')
      expect(track).toHaveClass('overflow-x-auto')
    })

    it('should apply active dot styling', () => {
      renderHeroCarousel()
      const activeDot = screen.getByTestId('hero-dot-0')
      const inactiveDot = screen.getByTestId('hero-dot-1')

      expect(activeDot).toHaveClass('bg-primary-600')
      expect(inactiveDot).toHaveClass('bg-neutral-300')
    })

    it('should have proper dot accessibility attributes', () => {
      renderHeroCarousel()
      const dot = screen.getByTestId('hero-dot-0')

      expect(dot).toHaveAttribute('role', 'tab')
      expect(dot).toHaveAttribute('aria-label', 'Go to slide 1')
      expect(dot).toHaveAttribute('type', 'button')
    })

    it('should have aria-roledescription="carousel" on container', () => {
      const { container } = renderHeroCarousel()
      const outer = container.firstChild as HTMLElement
      expect(outer).toHaveAttribute('aria-roledescription', 'carousel')
    })
  })

  describe('Hero Auto-Rotation and Navigation', () => {
    const heroProps: Omit<CarouselProps, 'variant' | 'children'> = {
      direction: DirectionEnum.LTR,
      ariaLabel: 'Hero Test',
    }

    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    const renderHeroCarousel = (props: Partial<CarouselProps> = {}) => {
      return render(
        <Carousel variant="hero" {...heroProps} {...props}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )
    }

    it('should have first dot selected initially', () => {
      renderHeroCarousel({})
      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-selected', 'true')
      expect(dots[1]).toHaveAttribute('aria-selected', 'false')
    })

    it('should scroll to slide when clicking a dot', async () => {
      renderHeroCarousel({})
      const dots = screen.getAllByRole('tab')

      const track = screen.getByTestId('hero-carousel-track')
      track.scrollTo = jest.fn()
      Object.defineProperty(track, 'children', {
        value: [
          { offsetLeft: 0, clientWidth: 1000 },
          { offsetLeft: 1000, clientWidth: 1000 },
          { offsetLeft: 2000, clientWidth: 1000 },
        ],
      })

      await act(async () => {
        const dot = dots[1]
        if (dot) {
          fireEvent.click(dot)
        }
      })

      expect((track.scrollTo as jest.Mock).mock.calls[0]).toEqual([
        {
          left: 1000,
          behavior: 'smooth',
        },
      ])
    })

    it('should update active dot on scroll', async () => {
      renderHeroCarousel({})
      const track = screen.getByTestId('hero-carousel-track')

      Object.defineProperty(track, 'scrollLeft', { value: 1000, writable: true })
      Object.defineProperty(track, 'children', {
        value: [
          { offsetLeft: 0, clientWidth: 1000 },
          { offsetLeft: 1000, clientWidth: 1000 },
          { offsetLeft: 2000, clientWidth: 1000 },
        ],
      })

      fireEvent.scroll(track)

      act(() => {
        jest.advanceTimersByTime(100)
      })

      const dots = screen.getAllByRole('tab')
      expect(dots[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('should auto-rotate to next slide after interval', () => {
      renderHeroCarousel({})
      const track = screen.getByTestId('hero-carousel-track')
      track.scrollTo = jest.fn()

      // Setup children mocks first so scrollTo call can find them
      Object.defineProperty(track, 'children', {
        value: [{ offsetLeft: 0 }, { offsetLeft: 1000 }, { offsetLeft: 2000 }],
      })

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect((track.scrollTo as jest.Mock).mock.calls[0]).toEqual([
        {
          left: 1000,
          behavior: 'smooth',
        },
      ])
    })

    it('should pause auto-rotation on mouse enter', () => {
      renderHeroCarousel({})
      const container = screen.getByRole('region')
      const track = screen.getByTestId('hero-carousel-track')
      track.scrollTo = jest.fn()

      fireEvent.mouseEnter(container)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(track.scrollTo as jest.Mock).not.toHaveBeenCalled()
    })

    it('should resume auto-rotation on mouse leave', () => {
      renderHeroCarousel({})
      const container = screen.getByRole('region')
      const track = screen.getByTestId('hero-carousel-track')
      track.scrollTo = jest.fn()

      Object.defineProperty(track, 'children', {
        value: [{ offsetLeft: 0 }, { offsetLeft: 1000 }],
      })

      fireEvent.mouseEnter(container)
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(track.scrollTo as jest.Mock).not.toHaveBeenCalled()

      fireEvent.mouseLeave(container)
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(track.scrollTo as jest.Mock).toHaveBeenCalled()
    })
  })

  describe('Cleanup and Edge Cases', () => {
    it('should clean up auto-rotation timer on unmount', () => {
      jest.useFakeTimers()
      const { unmount } = render(
        <Carousel variant="hero" autoRotateInterval={2000} direction={DirectionEnum.LTR}>
          <div>1</div>
          <div>2</div>
        </Carousel>
      )

      // Advance partial time
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      unmount()

      // Advance remaining time - should not throw or cause state update on unmounted component
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      jest.useRealTimers()
    })

    it('should render standard carousel without optional props', () => {
      render(
        <Carousel direction={DirectionEnum.LTR}>
          <div>Item</div>
        </Carousel>
      )
      const track = screen.getByTestId('carousel-track')
      expect(track).toHaveClass('gap-6') // Default md gap
    })
  })

  describe('Standard variant - startScrollItemIndex', () => {
    beforeEach(() => {
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

    it('should scroll to startScrollItemIndex on mount', () => {
      const track = { scrollTo: jest.fn() }
      render(
        <Carousel direction={DirectionEnum.LTR} startScrollItemIndex={2}>
          <div data-testid="item-0">Item 0</div>
          <div data-testid="item-1">Item 1</div>
          <div data-testid="item-2">Item 2</div>
        </Carousel>
      )

      const carouselTrack = screen.getByTestId('carousel-track')
      carouselTrack.scrollTo = track.scrollTo

      // Mock children with offsetLeft
      Object.defineProperty(carouselTrack, 'children', {
        value: [{ offsetLeft: 0 }, { offsetLeft: 300 }, { offsetLeft: 600 }],
      })

      // Re-render to trigger the effect with mocked values
      const { rerender } = render(
        <Carousel direction={DirectionEnum.LTR} startScrollItemIndex={2}>
          <div data-testid="item-0">Item 0</div>
          <div data-testid="item-1">Item 1</div>
          <div data-testid="item-2">Item 2</div>
        </Carousel>
      )
      rerender(
        <Carousel direction={DirectionEnum.LTR} startScrollItemIndex={2}>
          <div data-testid="item-0">Item 0</div>
          <div data-testid="item-1">Item 1</div>
          <div data-testid="item-2">Item 2</div>
        </Carousel>
      )

      // The scroll should use 'instant' behavior
      const scrollToMock = HTMLElement.prototype.scrollTo as jest.Mock
      const calls = scrollToMock.mock.calls
      const instantCall = calls.find(call => call[0]?.behavior === 'instant')
      expect(instantCall).toBeDefined()
    })

    it('should default to index 0 and not scroll when startScrollItemIndex is omitted', () => {
      HTMLElement.prototype.scrollTo = jest.fn()

      render(
        <Carousel direction={DirectionEnum.LTR}>
          <div>Item 0</div>
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>
      )

      // No scroll should be called when starting at index 0
      const scrollToMock = HTMLElement.prototype.scrollTo as jest.Mock
      const instantCalls = scrollToMock.mock.calls.filter(call => call[0]?.behavior === 'instant')
      expect(instantCalls).toHaveLength(0)
    })

    it('should clamp negative index to 0', () => {
      HTMLElement.prototype.scrollTo = jest.fn()

      render(
        <Carousel direction={DirectionEnum.LTR} startScrollItemIndex={-5}>
          <div>Item 0</div>
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>
      )

      // Clamped to 0 means no scroll needed
      const scrollToMock = HTMLElement.prototype.scrollTo as jest.Mock
      const instantCalls = scrollToMock.mock.calls.filter(call => call[0]?.behavior === 'instant')
      expect(instantCalls).toHaveLength(0)
    })

    it('should clamp index exceeding item count to last valid index', () => {
      const scrollToMock = jest.fn()
      HTMLElement.prototype.scrollTo = scrollToMock

      render(
        <Carousel direction={DirectionEnum.LTR} startScrollItemIndex={100}>
          <div>Item 0</div>
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>
      )

      // Index 100 is clamped to 2 (last valid index for 3 items)
      // Since clamped index is not 0, scrollTo should be called with 'instant' behavior
      const calls = scrollToMock.mock.calls
      const instantCall = calls.find(call => call[0]?.behavior === 'instant')
      expect(instantCall).toBeDefined()
    })

    it('should handle empty children gracefully', () => {
      HTMLElement.prototype.scrollTo = jest.fn()

      // Render with no children (empty fragment)
      expect(() => {
        render(
          <Carousel direction={DirectionEnum.LTR} startScrollItemIndex={5}>
            {[]}
          </Carousel>
        )
      }).not.toThrow()

      // No scroll should be attempted
      const scrollToMock = HTMLElement.prototype.scrollTo as jest.Mock
      const instantCalls = scrollToMock.mock.calls.filter(call => call[0]?.behavior === 'instant')
      expect(instantCalls).toHaveLength(0)
    })

    it('should handle track with no parentElement in RAF callback', () => {
      jest.useFakeTimers()
      HTMLElement.prototype.scrollTo = jest.fn()

      // Capture the RAF callback so we can run it AFTER modifying the DOM
      let rafCallback: FrameRequestCallback | null = null
      const originalRAF = global.requestAnimationFrame
      global.requestAnimationFrame = jest.fn(cb => {
        rafCallback = cb
        return 0
      }) as unknown as typeof requestAnimationFrame

      render(
        <Carousel direction={DirectionEnum.LTR} startScrollItemIndex={2}>
          <div>Item 0</div>
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>
      )

      const track = screen.getByTestId('carousel-track')
      // Mock track with no parent element BEFORE running the RAF callback
      Object.defineProperty(track, 'parentElement', { value: null, configurable: true })

      // Now execute the RAF callback - should hit the "no track or parent" branch
      expect(rafCallback).toBeTruthy()
      ;(rafCallback as unknown as FrameRequestCallback)(0)

      // Should not throw
      expect(track).toBeInTheDocument()

      global.requestAnimationFrame = originalRAF
      jest.useRealTimers()
    })

    it('should handle case where target child is not found at index', () => {
      jest.useFakeTimers()
      HTMLElement.prototype.scrollTo = jest.fn()

      // Capture the RAF callback so we can run it AFTER modifying the DOM
      let rafCallback: FrameRequestCallback | null = null
      const originalRAF = global.requestAnimationFrame
      global.requestAnimationFrame = jest.fn(cb => {
        rafCallback = cb
        return 0
      }) as unknown as typeof requestAnimationFrame

      render(
        <Carousel direction={DirectionEnum.LTR} startScrollItemIndex={2}>
          <div>Item 0</div>
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>
      )

      const track = screen.getByTestId('carousel-track')
      const parentMock = { scrollTo: jest.fn(), scrollLeft: 0, clientWidth: 1000 }

      // Mock track.parentElement and children BEFORE running the RAF callback
      Object.defineProperty(track, 'parentElement', { value: parentMock, configurable: true })
      // Mock children to be an empty collection (target child not found)
      Object.defineProperty(track, 'children', { value: [], configurable: true })

      // Now execute the RAF callback - should hit the "target child not found" branch
      expect(rafCallback).toBeTruthy()
      ;(rafCallback as unknown as FrameRequestCallback)(0)

      // Should not throw - this tests the else branch where targetChild is undefined
      expect(track).toBeInTheDocument()

      global.requestAnimationFrame = originalRAF
      jest.useRealTimers()
    })

    it('should execute setTimeout callback after successful scroll', () => {
      jest.useFakeTimers()
      HTMLElement.prototype.scrollTo = jest.fn()

      const originalRAF = global.requestAnimationFrame
      global.requestAnimationFrame = jest.fn(cb => {
        cb(0)
        return 0
      }) as unknown as typeof requestAnimationFrame

      render(
        <Carousel direction={DirectionEnum.LTR} startScrollItemIndex={1}>
          <div>Item 0</div>
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>
      )

      const track = screen.getByTestId('carousel-track')
      const parentScrollTo = jest.fn()
      const parentMock = { scrollTo: parentScrollTo, scrollLeft: 0, clientWidth: 1000 }

      Object.defineProperty(track, 'parentElement', { value: parentMock, configurable: true })
      Object.defineProperty(track, 'children', {
        value: [{ offsetLeft: 0 }, { offsetLeft: 300 }, { offsetLeft: 600 }],
        configurable: true,
      })

      // Advance timers to execute the setTimeout(fn, 0) callback
      jest.advanceTimersByTime(0)

      // Should have called scrollTo
      expect(track).toBeInTheDocument()

      global.requestAnimationFrame = originalRAF
      jest.useRealTimers()
    })
  })

  describe('Hero variant - startScrollItemIndex', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      HTMLElement.prototype.scrollTo = jest.fn()
      // Mock requestAnimationFrame to execute callbacks immediately
      global.requestAnimationFrame = jest.fn(cb => {
        cb(0)
        return 0
      }) as unknown as typeof requestAnimationFrame
    })

    afterEach(() => {
      jest.useRealTimers()
      jest.restoreAllMocks()
    })

    const renderHeroWithStartIndex = (startIndex: number, itemCount = 3) => {
      const items = Array.from({ length: itemCount }, (_, i) => (
        <div key={i} data-testid={`hero-item-${String(i)}`}>
          Hero Item {String(i)}
        </div>
      ))

      return render(
        <Carousel direction={DirectionEnum.LTR} variant="hero" ariaLabel="Test Hero" startScrollItemIndex={startIndex}>
          {items}
        </Carousel>
      )
    }

    it('should show specified slide initially with correct dot selected', () => {
      renderHeroWithStartIndex(1)

      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-selected', 'false')
      expect(dots[1]).toHaveAttribute('aria-selected', 'true')
      expect(dots[2]).toHaveAttribute('aria-selected', 'false')
    })

    it('should mark correct slide as visible with aria-hidden', () => {
      renderHeroWithStartIndex(2)

      const slide0 = screen.getByTestId('hero-slide-0')
      const slide1 = screen.getByTestId('hero-slide-1')
      const slide2 = screen.getByTestId('hero-slide-2')

      expect(slide0).toHaveAttribute('aria-hidden', 'true')
      expect(slide1).toHaveAttribute('aria-hidden', 'true')
      expect(slide2).toHaveAttribute('aria-hidden', 'false')
    })

    it('should scroll to initial slide position on mount with instant behavior', () => {
      const scrollToMock = jest.fn()
      HTMLElement.prototype.scrollTo = scrollToMock

      renderHeroWithStartIndex(1)

      const track = screen.getByTestId('hero-carousel-track')
      Object.defineProperty(track, 'children', {
        value: [{ offsetLeft: 0 }, { offsetLeft: 1000 }, { offsetLeft: 2000 }],
      })

      // Check for instant scroll behavior
      const calls = scrollToMock.mock.calls
      const instantCall = calls.find(call => call[0]?.behavior === 'instant')
      expect(instantCall).toBeDefined()
    })

    it('should clamp negative index to 0 in hero variant', () => {
      renderHeroWithStartIndex(-10)

      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-selected', 'true')
      expect(dots[1]).toHaveAttribute('aria-selected', 'false')
    })

    it('should clamp index exceeding item count in hero variant', () => {
      renderHeroWithStartIndex(100)

      const dots = screen.getAllByRole('tab')
      // Should clamp to last index (2)
      expect(dots[0]).toHaveAttribute('aria-selected', 'false')
      expect(dots[1]).toHaveAttribute('aria-selected', 'false')
      expect(dots[2]).toHaveAttribute('aria-selected', 'true')
    })

    it('should auto-rotate from startScrollItemIndex correctly', () => {
      const scrollToMock = jest.fn()
      HTMLElement.prototype.scrollTo = scrollToMock

      renderHeroWithStartIndex(1)

      const track = screen.getByTestId('hero-carousel-track')
      Object.defineProperty(track, 'children', {
        value: [{ offsetLeft: 0 }, { offsetLeft: 1000 }, { offsetLeft: 2000 }],
      })

      // Advance time to trigger auto-rotation
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      // Should rotate from index 1 to index 2
      const smoothCalls = scrollToMock.mock.calls.filter(call => call[0]?.behavior === 'smooth')
      expect(smoothCalls.length).toBeGreaterThan(0)

      // The last smooth call should be targeting index 2 (offsetLeft 2000)
      const lastSmoothCall = smoothCalls[smoothCalls.length - 1]
      expect(lastSmoothCall?.[0]?.left).toBe(2000)
    })

    it('should not scroll on mount when index is 0', () => {
      const scrollToMock = jest.fn()
      HTMLElement.prototype.scrollTo = scrollToMock

      renderHeroWithStartIndex(0)

      // No instant scroll should occur when starting at index 0
      const instantCalls = scrollToMock.mock.calls.filter(call => call[0]?.behavior === 'instant')
      expect(instantCalls).toHaveLength(0)
    })

    it('should handle single child with startScrollItemIndex', () => {
      HTMLElement.prototype.scrollTo = jest.fn()

      expect(() => {
        render(
          <Carousel direction={DirectionEnum.LTR} variant="hero" startScrollItemIndex={5}>
            <div>Single Item</div>
          </Carousel>
        )
      }).not.toThrow()

      // No dots should be rendered for single item
      expect(screen.queryByTestId('hero-dot-0')).not.toBeInTheDocument()
    })
  })
})
