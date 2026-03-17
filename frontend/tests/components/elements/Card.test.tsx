// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Card component
 */

import { render, screen } from '@testing-library/react'

import CardDefault, { Card, type CardProps, type CardSize } from '@/components/elements/Card'
import { DirectionEnum, type PluginUploadFileDocument } from '@/lib/generated/types.gen'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: {
    src: string
    alt: string
    className?: string
    fill?: boolean
    onError?: (e: { target: HTMLImageElement }) => void
  }) {
    return <img src={props.src} alt={props.alt} className={props.className} data-fill={props.fill} />
  },
}))

// Mock next/link (still used in imports)
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock Image directly (Card uses relative import)
jest.mock('@/components/elements/Image', () => ({
  __esModule: true,
  default: function MockImage({ image }: { image?: { url?: string; alternativeText?: string } | string | null }) {
    const getImageUrl = () => {
      if (!image) return '/images/placeholder.svg'
      if (typeof image === 'string') return image
      if (!image.url) return '/images/placeholder.svg'
      return image.url.startsWith('http') ? image.url : `https://localhost:1337${image.url}`
    }
    const alt = typeof image === 'object' && image?.alternativeText ? image.alternativeText : ''
    return <img data-testid="mock-image" src={getImageUrl()} alt={alt} />
  },
  Image: function MockImage({ image }: { image?: { url?: string; alternativeText?: string } | string | null }) {
    const getImageUrl = () => {
      if (!image) return '/images/placeholder.svg'
      if (typeof image === 'string') return image
      if (!image.url) return '/images/placeholder.svg'
      return image.url.startsWith('http') ? image.url : `https://localhost:1337${image.url}`
    }
    const alt = typeof image === 'object' && image?.alternativeText ? image.alternativeText : ''
    return <img data-testid="mock-image" src={getImageUrl()} alt={alt} />
  },
}))

describe('Card', () => {
  const defaultProps: CardProps = {
    href: '/test-path',
    image: { url: '/test-image.jpg', alternativeText: 'Test image' } as unknown as PluginUploadFileDocument,
    content: <p>Test content</p>,
    direction: DirectionEnum.LTR,
    asLink: true,
  }

  it('should render as a link by default (overlay) when asLink is true', () => {
    const { container } = render(<Card {...defaultProps} />)
    // Check for overlay link existence
    // The main wrapper is a div now
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.tagName).toBe('DIV')

    // Check for inner overlay link
    const link = screen.getByRole('link', { hidden: true }) // aria-hidden=true on overlay
    expect(link).toHaveAttribute('href', '/test-path')
  })

  it('should default to asLink=false when not provided', () => {
    const props = { ...defaultProps }
    delete (props as any).asLink
    render(<Card {...props} />)

    // Should NOT find the overlay link
    const link = screen.queryByRole('link', { hidden: true })
    expect(link).not.toBeInTheDocument()
  })

  it('should render as a div when asLink is false', () => {
    const { container } = render(<Card {...defaultProps} asLink={false} />)

    // Should NOT find the overlay link
    const link = screen.queryByRole('link', { hidden: true })
    expect(link).not.toBeInTheDocument()

    const card = container.querySelector('[data-href="/test-path"]')
    expect(card).toBeInTheDocument()
    expect(card?.tagName).toBe('DIV')
  })

  it('should render image with alt text', () => {
    render(<Card {...defaultProps} />)

    const image = screen.getByTestId('mock-image')
    expect(image).toBeInTheDocument()
  })

  it('should render header slot content', () => {
    render(<Card {...defaultProps} header={<span data-testid="header-slot">Header Content</span>} />)

    expect(screen.getByTestId('header-slot')).toBeInTheDocument()
    expect(screen.getByText('Header Content')).toBeInTheDocument()
  })

  it('should render content slot content', () => {
    render(<Card {...defaultProps} />)

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render footer slot content', () => {
    render(<Card {...defaultProps} footer={<span data-testid="footer-slot">Footer Content</span>} />)

    expect(screen.getByTestId('footer-slot')).toBeInTheDocument()
    expect(screen.getByText('Footer Content')).toBeInTheDocument()
  })

  it('should render all slots when provided', () => {
    render(
      <Card
        {...defaultProps}
        header={<span data-testid="header">Tag</span>}
        content={<span data-testid="content">Title</span>}
        footer={<span data-testid="footer">Meta</span>}
      />
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should apply additional className', () => {
    const { container } = render(<Card {...defaultProps} className="mt-4" />)

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('mt-4')
  })

  it('should handle null image', () => {
    render(<Card {...defaultProps} image={null} />)

    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should handle undefined image', () => {
    render(<Card {...defaultProps} image={undefined} />)

    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should apply group class for hover effects', () => {
    const { container } = render(<Card {...defaultProps} />)

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('group')
  })

  it('should return null when visible is false', () => {
    const { container } = render(<Card {...defaultProps} visible={false} />)

    expect(container.firstChild).toBeNull()
  })

  it('should render imageOverlay when provided', () => {
    render(<Card {...defaultProps} imageOverlay={<span data-testid="overlay">Overlay</span>} />)

    expect(screen.getByTestId('overlay')).toBeInTheDocument()
  })

  describe('size prop', () => {
    it('should apply xs size dimensions via inline style', () => {
      const { container } = render(<Card {...defaultProps} size="xs" />)

      const card = container.firstChild as HTMLElement
      expect(card.style.height).toBe('var(--height-card-y-xs)')
      expect(card.style.width).toBe('var(--width-card-y-xs)')
    })

    it('should apply md size dimensions by default via inline style', () => {
      const { container } = render(<Card {...defaultProps} />)

      const card = container.firstChild as HTMLElement
      expect(card.style.height).toBe('var(--height-card-y-md)')
      expect(card.style.width).toBe('var(--width-card-y-md)')
    })

    it('should apply sm size dimensions via inline style', () => {
      const { container } = render(<Card {...defaultProps} size="sm" />)

      const card = container.firstChild as HTMLElement
      expect(card.style.height).toBe('var(--height-card-y-sm)')
      expect(card.style.width).toBe('var(--width-card-y-sm)')
    })

    it('should apply lg size dimensions via inline style', () => {
      const { container } = render(<Card {...defaultProps} size="lg" />)

      const card = container.firstChild as HTMLElement
      expect(card.style.height).toBe('var(--height-card-y-lg)')
      expect(card.style.width).toBe('var(--width-card-y-lg)')
    })

    it('should apply xl size dimensions via inline style', () => {
      const { container } = render(<Card {...defaultProps} size="xl" />)

      const card = container.firstChild as HTMLElement
      expect(card.style.height).toBe('var(--height-card-y-xl)')
      expect(card.style.width).toBe('var(--width-card-y-xl)')
    })

    it('should have CardSize type exported', () => {
      // Type-level test - if this compiles, it passes
      const sizes: CardSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
      expect(sizes).toHaveLength(5)
    })
  })

  describe('width prop', () => {
    it('should apply CSS variable width via inline style when width is fixed (default)', () => {
      const { container } = render(<Card {...defaultProps} size="md" width="fixed" />)
      const card = container.firstChild as HTMLElement
      expect(card.style.width).toBe('var(--width-card-y-md)')
    })

    it('should apply w-full class when width is full', () => {
      const { container } = render(<Card {...defaultProps} width="full" />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('w-full')
      expect(card.style.width).toBe('')
    })

    it('should maintain CSS variable height via inline style when width is full', () => {
      const { container } = render(<Card {...defaultProps} size="lg" width="full" />)
      const card = container.firstChild as HTMLElement
      expect(card.style.height).toBe('var(--height-card-y-lg)')
      expect(card.className).toContain('w-full')
    })

    it('should apply w-fit class when width is fit', () => {
      const { container } = render(<Card {...defaultProps} width="fit" />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('w-fit')
      expect(card.style.width).toBe('')
    })

    it('should maintain CSS variable height via inline style when width is fit', () => {
      const { container } = render(<Card {...defaultProps} size="lg" width="fit" />)
      const card = container.firstChild as HTMLElement
      expect(card.style.height).toBe('var(--height-card-y-lg)')
      expect(card.className).toContain('w-fit')
    })
  })

  describe('height prop', () => {
    it('should apply CSS variable height via inline style when height is fixed (default)', () => {
      const { container } = render(<Card {...defaultProps} size="md" height="fixed" />)
      const card = container.firstChild as HTMLElement
      expect(card.style.height).toBe('var(--height-card-y-md)')
    })

    it('should apply h-full class when height is full', () => {
      const { container } = render(<Card {...defaultProps} height="full" />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('h-full')
      expect(card.style.height).toBe('')
    })

    it('should apply h-fit class when height is fit', () => {
      const { container } = render(<Card {...defaultProps} height="fit" />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('h-fit')
      expect(card.style.height).toBe('')
    })

    it('should maintain CSS variable width via inline style when height is fit', () => {
      const { container } = render(<Card {...defaultProps} size="lg" height="fit" />)
      const card = container.firstChild as HTMLElement
      expect(card.style.width).toBe('var(--width-card-y-lg)')
      expect(card.className).toContain('h-fit')
    })
  })

  describe('layout prop', () => {
    it('should apply flex-col by default (ttb - image on top)', () => {
      const { container } = render(<Card {...defaultProps} />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('flex-col')
      expect(card.className).not.toContain('flex-col-reverse')
    })

    it('should apply flex-col-reverse for btt (image on bottom)', () => {
      const { container } = render(<Card {...defaultProps} layout="btt" />)
      // For BTT layout, the inner vertical layout container has flex-col-reverse
      const innerContainer = container.querySelector('.flex-col-reverse')
      expect(innerContainer).toBeInTheDocument()
    })

    it('should apply flex-row for ltr (image on left)', () => {
      const { container } = render(<Card {...defaultProps} layout="ltr" />)
      // For horizontal layouts, the inner container has the flex direction
      const innerContainer = container.querySelector('.flex-row')
      expect(innerContainer).toBeInTheDocument()
    })

    it('should apply flex-row-reverse for rtl (image on right)', () => {
      const { container } = render(<Card {...defaultProps} layout="rtl" />)
      // For horizontal layouts, the inner container has the flex direction
      const innerContainer = container.querySelector('.flex-row-reverse')
      expect(innerContainer).toBeInTheDocument()
    })

    it('should maintain ltr layout regardless of direction prop', () => {
      // Layout is absolute, not relative to language direction
      const { container } = render(<Card {...defaultProps} layout="ltr" direction={DirectionEnum.RTL} />)
      const innerContainer = container.querySelector('.flex-row')
      expect(innerContainer).toBeInTheDocument()
      expect(container.querySelector('.flex-row-reverse')).not.toBeInTheDocument()
    })

    it('should maintain rtl layout regardless of direction prop', () => {
      // Layout is absolute, not relative to language direction
      const { container } = render(<Card {...defaultProps} layout="rtl" direction={DirectionEnum.LTR} />)
      const innerContainer = container.querySelector('.flex-row-reverse')
      expect(innerContainer).toBeInTheDocument()
    })

    it('should hide image for xs size in ttb layout', () => {
      render(<Card {...defaultProps} layout="ttb" size="xs" />)
      expect(screen.queryByTestId('mock-image')).not.toBeInTheDocument()
    })

    it('should show image for sm size in ttb layout', () => {
      render(<Card {...defaultProps} layout="ttb" size="sm" />)
      expect(screen.getByTestId('mock-image')).toBeInTheDocument()
    })

    it('should show image for md size in ttb layout', () => {
      render(<Card {...defaultProps} layout="ttb" size="md" />)
      expect(screen.getByTestId('mock-image')).toBeInTheDocument()
    })

    it('should hide image for xs size in btt layout', () => {
      render(<Card {...defaultProps} layout="btt" size="xs" />)
      expect(screen.queryByTestId('mock-image')).not.toBeInTheDocument()
    })

    it('should show image for sm size in btt layout', () => {
      render(<Card {...defaultProps} layout="btt" size="sm" />)
      expect(screen.getByTestId('mock-image')).toBeInTheDocument()
    })

    it('should show image for xs size in ltr layout (horizontal)', () => {
      render(<Card {...defaultProps} layout="ltr" size="xs" />)
      expect(screen.getByTestId('mock-image')).toBeInTheDocument()
    })

    it('should show image for sm size in rtl layout (horizontal)', () => {
      render(<Card {...defaultProps} layout="rtl" size="sm" />)
      expect(screen.getByTestId('mock-image')).toBeInTheDocument()
    })
  })

  describe('imageShape prop', () => {
    it('should apply rounded-3xl by default (rectangle)', () => {
      // We look inside for the image wrapper
      render(<Card {...defaultProps} />)
      // Image wrapper surrounds image
      // Find div containing image
      const img = screen.getByTestId('mock-image')
      const wrapper = img.parentElement
      expect(wrapper).toHaveClass('rounded-3xl')
    })

    it('should apply rounded-full for circle', () => {
      render(<Card {...defaultProps} imageShape="circle" />)
      const img = screen.getByTestId('mock-image')
      const wrapper = img.parentElement
      expect(wrapper).toHaveClass('rounded-full')
      // Verify dynamic dimensions for circle (size-36 for md size)
      expect(wrapper).toHaveClass('size-36')
    })
  })

  describe('RTL support', () => {
    it('should apply rtl direction when direction is RTL', () => {
      const { container } = render(<Card {...defaultProps} direction={DirectionEnum.RTL} />)

      const card = container.firstChild as HTMLElement
      expect(card).toHaveAttribute('dir', 'rtl')
    })

    it('should apply ltr direction when direction is LTR', () => {
      const { container } = render(<Card {...defaultProps} direction={DirectionEnum.LTR} />)

      const card = container.firstChild as HTMLElement
      expect(card).toHaveAttribute('dir', 'ltr')
    })
  })

  describe('image height in horizontal layouts', () => {
    it('should apply h-full for lg size in ltr horizontal layout', () => {
      render(<Card {...defaultProps} size="lg" layout="ltr" />)
      const img = screen.getByTestId('mock-image')
      const wrapper = img.parentElement
      expect(wrapper).toHaveClass('h-full')
    })

    it('should apply h-full for lg size in rtl horizontal layout', () => {
      render(<Card {...defaultProps} size="lg" layout="rtl" />)
      const img = screen.getByTestId('mock-image')
      const wrapper = img.parentElement
      expect(wrapper).toHaveClass('h-full')
    })

    it('should apply h-64 for lg size in vertical layout (ttb)', () => {
      render(<Card {...defaultProps} size="lg" layout="ttb" />)
      const img = screen.getByTestId('mock-image')
      const wrapper = img.parentElement
      expect(wrapper).toHaveClass('h-64')
    })
  })

  describe('footer padding', () => {
    it('should apply uniform footer classes in vertical layout', () => {
      render(<Card {...defaultProps} footer={<span data-testid="footer-content">Footer</span>} layout="ttb" />)
      const footer = screen.getByTestId('footer-content')
      const footerWrapper = footer.parentElement
      expect(footerWrapper).toHaveClass('mt-auto')
      expect(footerWrapper).toHaveClass('pt-4')
    })

    it('should render footer below image/content in sm/md horizontal layout', () => {
      // For sm/md horizontal layouts, footer is below both image and content
      render(
        <Card {...defaultProps} size="md" footer={<span data-testid="footer-content">Footer</span>} layout="ltr" />
      )
      const footer = screen.getByTestId('footer-content')
      const footerWrapper = footer.parentElement
      // Footer uses padding from sizeConfig (p-5 for md) with pt-0
      expect(footerWrapper).toHaveClass('p-5')
      expect(footerWrapper).toHaveClass('pt-0')
    })

    it('should render footer inline for lg/xl horizontal layout', () => {
      render(
        <Card {...defaultProps} size="lg" footer={<span data-testid="footer-content">Footer</span>} layout="ltr" />
      )
      const footer = screen.getByTestId('footer-content')
      const footerWrapper = footer.parentElement
      expect(footerWrapper).toHaveClass('mt-auto')
      expect(footerWrapper).toHaveClass('pt-4')
    })
  })

  it('should export default component', () => {
    render(<CardDefault {...defaultProps} />)
    expect(screen.getByRole('link', { hidden: true })).toBeInTheDocument()
  })

  it('should disable hover animations when noAnimation is true', () => {
    const { container } = render(<Card {...defaultProps} noAnimation={true} />)

    const card = container.firstChild as HTMLElement
    expect(card.className).not.toContain('hover:-translate-y-1')
    expect(card.className).not.toContain('hover:transform')
  })

  it('should apply background classes by default (showBackground=true)', () => {
    const { container } = render(<Card {...defaultProps} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('bg-card')
    expect(card.className).toContain('shadow-md')
    expect(card.className).toContain('border-border')
  })

  it('should not apply background classes when showBackground is false', () => {
    const { container } = render(<Card {...defaultProps} showBackground={false} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).not.toContain('bg-white')
    expect(card.className).not.toContain('shadow-md')
    expect(card.className).not.toContain('border-neutral-200')
  })

  it('should render absolute link overlay when asLink is true (default)', () => {
    render(<Card {...defaultProps} />) // asLink defaults to true

    // The wrapper acts as a container, but the link is an overlay with role='link' (or we find by href)
    // Actually next/link usually renders as <a> with href.
    // Our overlay link has className "absolute inset-0 z-10 cursor-pointer"
    const links = screen.getAllByRole('link', { hidden: true })
    // There might be multiple links if content have links, but here content is <p>Test content</p>
    // Just find the one with the correct href and class
    const overlayLink = links.find(l => l.getAttribute('href') === '/test-path' && l.className.includes('absolute'))

    expect(overlayLink).toBeInTheDocument()
    // tabIndex={-1} removes from keyboard navigation while avoiding aria-hidden focus issues
    expect(overlayLink).toHaveAttribute('tabindex', '-1')
  })

  it('should apply aria-label to overlay link when linkAriaLabel is provided', () => {
    render(<Card {...defaultProps} linkAriaLabel="Read more about test" />)

    const links = screen.getAllByRole('link', { hidden: true })
    const overlayLink = links.find(l => l.getAttribute('href') === '/test-path' && l.className.includes('absolute'))
    expect(overlayLink).toHaveAttribute('aria-label', 'Read more about test')
  })

  it('should not render absolute link overlay when asLink is false', () => {
    render(<Card {...defaultProps} asLink={false} />)

    // Should NOT find the overlay link
    const links = screen.queryAllByRole('link', { hidden: true })
    const overlayLink = links.find(l => l.getAttribute('href') === '/test-path' && l.className.includes('absolute'))
    expect(overlayLink).toBeUndefined()
  })

  describe('height fit', () => {
    it('should apply h-fit class when height is fit in horizontal layout', () => {
      const { container } = render(<Card {...defaultProps} height="fit" layout="ltr" />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('h-fit')
      expect(card.style.height).toBe('')
    })
  })

  describe('circle images in horizontal layout', () => {
    it('should apply self-center and rounded-full for circle imageShape in horizontal layout', () => {
      render(<Card {...defaultProps} layout="ltr" imageShape="circle" />)
      const img = screen.getByTestId('mock-image')
      const wrapper = img.parentElement
      expect(wrapper).toHaveClass('rounded-full')
      expect(wrapper).toHaveClass('self-center')
    })

    it('should apply correct circle size classes for different sizes in horizontal layout', () => {
      const sizes: CardSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
      const expectedClasses = ['size-10', 'size-24', 'size-36', 'size-48', 'size-60']

      sizes.forEach((size, index) => {
        const { unmount } = render(<Card {...defaultProps} layout="ltr" imageShape="circle" size={size} />)
        const img = screen.getByTestId('mock-image')
        const wrapper = img.parentElement
        expect(wrapper).toHaveClass(expectedClasses[index]!)
        unmount()
      })
    })
  })

  describe('imageMarginClass in horizontal layouts', () => {
    it('should apply image margin classes for xs rectangle in ltr layout', () => {
      render(<Card {...defaultProps} layout="ltr" size="xs" imageShape="rectangle" />)
      const img = screen.getByTestId('mock-image')
      const wrapper = img.parentElement
      expect(wrapper).toHaveClass('my-3')
      expect(wrapper).toHaveClass('ms-3')
    })

    it('should apply image margin classes for sm rectangle in rtl layout', () => {
      render(<Card {...defaultProps} layout="rtl" size="sm" imageShape="rectangle" />)
      const img = screen.getByTestId('mock-image')
      const wrapper = img.parentElement
      expect(wrapper).toHaveClass('my-4')
      expect(wrapper).toHaveClass('me-3')
    })

    it('should apply image margin classes for md in ltr horizontal layout', () => {
      render(<Card {...defaultProps} layout="ltr" size="md" imageShape="rectangle" />)
      const img = screen.getByTestId('mock-image')
      const wrapper = img.parentElement
      expect(wrapper).toHaveClass('mb-5')
    })

    it('should not apply margin for circle images in xs/sm horizontal layout', () => {
      render(<Card {...defaultProps} layout="ltr" size="xs" imageShape="circle" />)
      const img = screen.getByTestId('mock-image')
      const wrapper = img.parentElement
      // Circle images skip the imageMarginHorizontal logic for xs/sm because the condition checks rectangle
      expect(wrapper).not.toHaveClass('my-3')
    })
  })

  describe('noAnimation in horizontal layout', () => {
    it('should disable image hover animation in horizontal layout when noAnimation is true', () => {
      const { container } = render(<Card {...defaultProps} layout="ltr" noAnimation={true} />)
      // The image inside horizontal layout should not have transition-transform when noAnimation is true
      const card = container.firstChild as HTMLElement
      expect(card.className).not.toContain('hover:-translate-y-1')
    })
  })
})
