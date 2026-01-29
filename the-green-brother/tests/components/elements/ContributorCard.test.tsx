// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { DirectionEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const { ContributorCard } = jest.requireActual('@/components/elements/ContributorCard')

// Mock Card component
jest.mock('@/components/elements/Card', () => ({
  Card: jest.fn(
    ({
      size,
      className,
      imageShape,
      imageOverlay,
      header,
      content,
      footer,
      // Destructure props that shouldn't be passed to DOM
      asLink: _asLink,
      image: _image,
      direction: _direction,
      layout, // Capture layout
      href: _href,
      noAnimation: _noAnimation,
      ...props
    }) => (
      <div
        data-testid="mock-card"
        data-size={size}
        data-layout={layout} // Render layout
        data-image-shape={imageShape}
        className={className}
        {...props}
      >
        <div data-testid="card-overlay">{imageOverlay}</div>
        <div data-testid="card-header">{header}</div>
        <div data-testid="card-content">{content}</div>
        <div data-testid="card-footer">{footer}</div>
      </div>
    )
  ),
}))

describe('ContributorCard', () => {
  const mockMember = {
    documentId: 'member-1',
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    slug: 'john-doe',
    roles: [
      {
        id: 1,
        documentId: 'role-1',
        name: 'Developer',
        roleId: 'developer',
        publishedAt: '2024-01-01',
      },
    ] as any[],
    bio: 'Test Bio',
    email: 'test@example.com',
    publishedAt: '2024-01-01',
  }

  const defaultProps = {
    member: mockMember,
    direction: DirectionEnum.LTR,
  }

  it('should render generic Card with default size="md"', () => {
    render(<ContributorCard {...defaultProps} />)
    const card = screen.getByTestId('mock-card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('data-size', 'md')
    expect(card).toHaveAttribute('data-layout', 'ttb') // Default
  })

  it('should accept custom layout prop', () => {
    render(<ContributorCard {...defaultProps} layout="ltr" />)
    const card = screen.getByTestId('mock-card')
    expect(card).toHaveAttribute('data-layout', 'ltr')
  })

  it('should apply profile-specific styling classes', () => {
    render(<ContributorCard {...defaultProps} />)
    const card = screen.getByTestId('mock-card')

    // Check container styling
    expect(card).not.toHaveClass('h-fit!') // Default implementation doesn't use h-fit!

    // Check image shape prop
    expect(card).toHaveAttribute('data-image-shape', 'circle')

    // Width/Height are now handled by Card internally via style prop
    const wrapperClass = card.getAttribute('data-image-wrapper-class')
    expect(wrapperClass).toBeFalsy()
  })

  it('should pass correct image shape to Card', () => {
    render(<ContributorCard {...defaultProps} />)
    const card = screen.getByTestId('mock-card')
    // Check image shape prop
    expect(card).toHaveAttribute('data-image-shape', 'circle')
  })

  it('should pass different size prop to Card', () => {
    const { rerender } = render(<ContributorCard {...defaultProps} size="xs" />)
    const cardXs = screen.getByTestId('mock-card')
    expect(cardXs).toHaveAttribute('data-size', 'xs')

    rerender(<ContributorCard {...defaultProps} size="sm" />)
    const cardSm = screen.getByTestId('mock-card')
    expect(cardSm).toHaveAttribute('data-size', 'sm')

    rerender(<ContributorCard {...defaultProps} size="lg" />)
    const cardLg = screen.getByTestId('mock-card')
    expect(cardLg).toHaveAttribute('data-size', 'lg')
  })

  it('should allow overriding className', () => {
    render(<ContributorCard {...defaultProps} className="mt-8" />)
    const card = screen.getByTestId('mock-card')
    expect(card).toHaveClass('mt-8')
    // expect(card).toHaveClass('h-fit!') // Removed as per current implementation
  })
  it('should render initials when profile picture is missing', () => {
    const memberWithoutPic = { ...mockMember, profilePicture: null as any }
    render(<ContributorCard {...defaultProps} member={memberWithoutPic} />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should render roles correctly', () => {
    const memberWithRoles = {
      ...mockMember,
      roles: [
        { id: 1, name: 'Dev', roleId: 'dev' },
        { id: 2, name: 'Designer', roleId: 'des' },
      ],
    }
    render(<ContributorCard {...defaultProps} member={memberWithRoles as any} />)

    expect(screen.getByText('Dev, Designer')).toBeInTheDocument()
  })

  it('should render bio', () => {
    render(<ContributorCard {...defaultProps} />)
    expect(screen.getByText('Test Bio')).toBeInTheDocument()
  })

  it('should hide bio when missing', () => {
    const memberNoBio = { ...mockMember, bio: null }
    render(<ContributorCard {...defaultProps} member={memberNoBio as any} />)
    const content = screen.getByTestId('card-content')
    expect(content).toBeEmptyDOMElement()
  })

  it('should render all social links', () => {
    const memberAllSocials = {
      ...mockMember,
      twitter: 'tw',
      linkedin: 'li',
      github: 'gh',
      instagram: 'ig',
    }
    render(<ContributorCard {...defaultProps} member={memberAllSocials as any} />)

    expect(screen.getAllByRole('link', { name: /John Doe on X/i })[0]).toHaveAttribute('href', 'https://x.com/tw')
    expect(screen.getAllByRole('link', { name: /John Doe on LinkedIn/i })[0]).toHaveAttribute(
      'href',
      'https://linkedin.com/in/li'
    )
    expect(screen.getAllByRole('link', { name: /John Doe on GitHub/i })[0]).toHaveAttribute(
      'href',
      'https://github.com/gh'
    )
    expect(screen.getAllByRole('link', { name: /John Doe on Instagram/i })[0]).toHaveAttribute(
      'href',
      'https://instagram.com/ig'
    )
  })

  it('should embed header content into content slot when size="xs"', () => {
    render(<ContributorCard {...defaultProps} size="xs" />)

    // In ContributorCard implementation for xs size:
    // header={isXs ? undefined : headerContent} - header slot is empty
    // content={isXs ? headerContent : bioContent} - content slot gets headerContent
    const headerContainer = screen.getByTestId('card-header')
    expect(headerContainer).toBeEmptyDOMElement() // Header slot is undefined for xs

    // Content slot should contain the header content (name) for xs size
    const content = screen.getByTestId('card-content')
    expect(content).not.toBeEmptyDOMElement()
    expect(content).toHaveTextContent('John Doe')
    // Bio is NOT shown for xs size - only the name header is in content
    expect(content).not.toHaveTextContent('Test Bio')
  })
})
