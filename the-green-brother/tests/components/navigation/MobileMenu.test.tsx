// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for MobileMenu component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { MobileMenu, type MobileMenuProps } from '@/components/navigation/MobileMenu'
import { IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the CMS element components
jest.mock('@/components/elements', () => ({
  CMSIcon: function MockCMSIcon({ icon, size }: { icon?: string; size?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size}>
        {icon}
      </span>
    )
  },
  CMSText: function MockCMSText({ text }: { text?: string }) {
    return <span data-testid="mock-text">{text}</span>
  },
}))

describe('MobileMenu', () => {
  const mockOnToggle = jest.fn()

  const mockData: MobileMenuProps['data'] = {
    id: 1,
    openButton: {
      url: '#',
      openInNewTab: false,
      label: {
        text: 'Open',
        icon: 'menu',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Open menu',
      },
    },
    closeButton: {
      url: '#',
      openInNewTab: false,
      label: {
        text: 'Close',
        icon: 'close',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Close menu',
      },
    },
  }

  const mockNavLinks: MobileMenuProps['navLinks'] = [
    { href: '/', text: 'Home', isActive: true },
    { href: '/about', text: 'About', isActive: false },
    { href: '/contact', text: 'Contact', isActive: false },
  ]

  const mockLoginButton: MobileMenuProps['loginButton'] = {
    url: '/login',
    openInNewTab: false,
    label: {
      text: 'Login',
      icon: 'person',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Login',
    },
  }

  const defaultProps: MobileMenuProps = {
    data: mockData,
    isOpen: false,
    onToggle: mockOnToggle,
    navLinks: mockNavLinks,
    loginButton: mockLoginButton,
  }

  beforeEach(() => {
    mockOnToggle.mockClear()
  })

  it('should render toggle button', () => {
    render(<MobileMenu {...defaultProps} />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should show open icon when closed', () => {
    render(<MobileMenu {...defaultProps} isOpen={false} />)
    const icons = screen.getAllByTestId('mock-icon')
    // First icon is the toggle button icon
    expect(icons[0]).toHaveAttribute('data-icon', 'menu')
  })

  it('should show close icon when open', () => {
    render(<MobileMenu {...defaultProps} isOpen={true} />)
    const icons = screen.getAllByTestId('mock-icon')
    expect(icons[0]).toHaveAttribute('data-icon', 'close')
  })

  it('should have correct aria-label when closed', () => {
    render(<MobileMenu {...defaultProps} isOpen={false} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Open menu')
  })

  it('should have correct aria-label when open', () => {
    render(<MobileMenu {...defaultProps} isOpen={true} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Close menu')
  })

  it('should have aria-expanded false when closed', () => {
    render(<MobileMenu {...defaultProps} isOpen={false} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should have aria-expanded true when open', () => {
    render(<MobileMenu {...defaultProps} isOpen={true} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should call onToggle when button clicked', () => {
    render(<MobileMenu {...defaultProps} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('should render navigation links', () => {
    render(<MobileMenu {...defaultProps} isOpen={true} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4) // 3 nav links + 1 login
  })

  it('should render nav link texts', () => {
    render(<MobileMenu {...defaultProps} isOpen={true} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('should render login button', () => {
    render(<MobileMenu {...defaultProps} isOpen={true} />)
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('should apply active styling to active link', () => {
    render(<MobileMenu {...defaultProps} isOpen={true} />)
    const links = screen.getAllByRole('link')
    // Home is active
    expect(links[0]!.className).toContain('text-primary')
  })

  it('should apply inactive styling to inactive links', () => {
    render(<MobileMenu {...defaultProps} isOpen={true} />)
    const links = screen.getAllByRole('link')
    // About is not active
    expect(links[1]!.className).toContain('text-text-secondary-dark')
  })

  it('should call onToggle when nav link clicked', () => {
    render(<MobileMenu {...defaultProps} isOpen={true} />)
    const links = screen.getAllByRole('link')
    fireEvent.click(links[0]!)
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('should call onToggle when login button clicked', () => {
    render(<MobileMenu {...defaultProps} isOpen={true} />)
    const links = screen.getAllByRole('link')
    const loginLink = links[3]!
    fireEvent.click(loginLink)
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('should apply open styles when isOpen is true', () => {
    const { container } = render(<MobileMenu {...defaultProps} isOpen={true} />)
    const menuContent = container.querySelector('[class*="max-h-96"]')
    expect(menuContent).toBeInTheDocument()
  })

  it('should apply closed styles when isOpen is false', () => {
    const { container } = render(<MobileMenu {...defaultProps} isOpen={false} />)
    const menuContent = container.querySelector('[class*="max-h-0"]')
    expect(menuContent).toBeInTheDocument()
  })
})
