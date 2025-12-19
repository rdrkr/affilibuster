// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for MobileNavigationGroup component
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { MobileNavigationGroup, type MobileNavigationGroupProps } from '@/components/navigation/MobileNavigationGroup'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the ButtonAction component
jest.mock('@/components/elements', () => ({
  ButtonAction: function MockButtonAction({
    children,
    onClick,
    className,
    data,
    'aria-expanded': ariaExpanded,
    isActive,
  }: {
    children?: React.ReactNode
    onClick?: () => void
    className?: string
    data?: { label?: { text?: string; icon?: string; ariaDescription?: string } }
    'aria-expanded'?: boolean
    isActive?: boolean
  }) {
    const finalAriaLabel = data?.label?.ariaDescription ?? data?.label?.text
    const activeClass = isActive ? 'text-primary' : 'text-neutral-700'
    const finalClassName = `${className ?? ''} ${activeClass}`.trim()

    return (
      <button onClick={onClick} className={finalClassName} aria-label={finalAriaLabel} aria-expanded={ariaExpanded}>
        {children}
        {data?.label?.icon && (
          <span data-testid="mock-icon" data-icon={data.label.icon}>
            {data.label.icon}
          </span>
        )}
        {data?.label?.text && <span data-testid="mock-text">{data.label.text}</span>}
      </button>
    )
  },
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
  ButtonLink: jest.fn(() => null),
}))

// Mock the DropdownMenu to properly render trigger and children
jest.mock('@/components/menus', () => ({
  DropdownMenu: function MockDropdownMenu({
    children,
    triggerData,
    isOpen,
    onOpenChange,
    testId,
    visible,
  }: {
    children: React.ReactNode
    triggerData: { label?: { text?: string; icon?: string; ariaDescription?: string } }
    isOpen?: boolean
    onOpenChange?: (isOpen: boolean) => void
    testId?: string
    visible?: boolean
  }) {
    const handleMouseEnter = () => {
      onOpenChange?.(true)
    }
    const handleMouseLeave = () => {
      // Skip on mobile (test environment is desktop by default)
      onOpenChange?.(false)
    }
    const handleClick = () => {
      onOpenChange?.(!isOpen)
    }
    const handleClickOutside = React.useCallback(
      (e: MouseEvent) => {
        const container = document.querySelector(`[data-testid="${testId ?? ''}"]`)
        if (container && !container.contains(e.target as Node) && isOpen) {
          onOpenChange?.(false)
        }
      },
      [testId, isOpen, onOpenChange]
    )
    const handleScroll = React.useCallback(() => {
      if (isOpen) {
        onOpenChange?.(false)
      }
    }, [isOpen, onOpenChange])

    // Register event listeners
    React.useEffect(() => {
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        window.addEventListener('scroll', handleScroll)
        return () => {
          document.removeEventListener('mousedown', handleClickOutside)
          window.removeEventListener('scroll', handleScroll)
        }
      }
      return undefined
    }, [isOpen, handleClickOutside, handleScroll])

    return (
      <div data-testid={testId} aria-hidden={!visible} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button onClick={handleClick} aria-label={triggerData.label?.ariaDescription} aria-expanded={isOpen}>
          {triggerData.label?.icon && (
            <span data-testid="mock-icon" data-icon={triggerData.label.icon}>
              {triggerData.label.icon}
            </span>
          )}
        </button>
        {isOpen && <div data-testid="dropdown-menu">{children}</div>}
      </div>
    )
  },
}))

// Need to import React for the mock
import React from 'react'

describe('MobileNavigationGroup', () => {
  const mockOnToggle = jest.fn()

  const mockData: MobileNavigationGroupProps['data'] = {
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

  const mockNavLinks: MobileNavigationGroupProps['navLinks'] = [
    { href: '/', text: 'Home', isActive: true },
    { href: '/about', text: 'About', isActive: false },
    { href: '/contact', text: 'Contact', isActive: false },
  ]

  const defaultProps: MobileNavigationGroupProps = {
    data: mockData,
    isOpen: false,
    onToggle: mockOnToggle,
    navLinks: mockNavLinks,
    direction: DirectionEnum.LTR,
  }

  beforeEach(() => {
    mockOnToggle.mockClear()
  })

  it('should render toggle button', () => {
    render(<MobileNavigationGroup {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Open menu' })
    expect(button).toBeInTheDocument()
  })

  it('should show open icon when closed', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={false} />)
    const icons = screen.getAllByTestId('mock-icon')
    // First icon is the toggle button icon
    expect(icons[0]).toHaveAttribute('data-icon', 'menu')
  })

  it('should show close icon when open', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    const icons = screen.getAllByTestId('mock-icon')
    expect(icons[0]).toHaveAttribute('data-icon', 'close')
  })

  it('should have correct aria-label when closed', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={false} />)
    const button = screen.getByRole('button', { name: 'Open menu' })
    expect(button).toHaveAttribute('aria-label', 'Open menu')
  })

  it('should have correct aria-label when open', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    const button = screen.getByRole('button', { name: 'Close menu' })
    expect(button).toHaveAttribute('aria-label', 'Close menu')
  })

  it('should have aria-expanded false when closed', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={false} />)
    const button = screen.getByRole('button', { name: 'Open menu' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should have aria-expanded true when open', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    const button = screen.getByRole('button', { name: 'Close menu' })
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should call onToggle when button clicked', () => {
    render(<MobileNavigationGroup {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(button)
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('should render navigation links as buttons', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    // Toggle button + 3 nav buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4) // 1 toggle + 3 nav buttons
  })

  it('should render nav link texts', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('should apply active styling to active nav button', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    // Find the button containing 'Home' text
    const homeText = screen.getByText('Home')
    const homeButton = homeText.closest('button')
    expect(homeButton?.className).toContain('text-primary')
  })

  it('should apply inactive styling to inactive nav buttons', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    // Find the button containing 'About' text
    const aboutText = screen.getByText('About')
    const aboutButton = aboutText.closest('button')
    expect(aboutButton?.className).toContain('text-neutral-700')
  })

  it('should call onToggle when nav button clicked', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    const homeText = screen.getByText('Home')
    const homeButton = homeText.closest('button')
    fireEvent.click(homeButton!)
    expect(mockOnToggle).toHaveBeenCalledWith(false)
  })

  it('should render dropdown menu when isOpen is true', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    const menuContent = screen.getByTestId('dropdown-menu')
    expect(menuContent).toBeInTheDocument()
  })

  it('should not render dropdown menu when isOpen is false', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument()
  })

  it('should close menu when clicking outside', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    fireEvent.mouseDown(document.body)
    expect(mockOnToggle).toHaveBeenCalledWith(false)
  })

  it('should close menu when scrolling outside', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    fireEvent.scroll(window)
    expect(mockOnToggle).toHaveBeenCalledWith(false)
  })

  it('should call onToggle on mouse enter', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={false} />)
    const container = screen.getByTestId('mobile-navigation-group-container')
    fireEvent.mouseEnter(container)
    expect(mockOnToggle).toHaveBeenCalledWith(true)
  })

  it('should call onToggle on mouse leave', () => {
    render(<MobileNavigationGroup {...defaultProps} isOpen={true} />)
    const container = screen.getByTestId('mobile-navigation-group-container')
    fireEvent.mouseLeave(container)
    expect(mockOnToggle).toHaveBeenCalledWith(false)
  })

  it('should apply hidden classes when visible is false', () => {
    render(<MobileNavigationGroup {...defaultProps} visible={false} />)
    const container = screen.getByTestId('mobile-navigation-group-container')
    expect(container).toHaveAttribute('aria-hidden', 'true')
  })

  it('should apply visible classes when visible is true', () => {
    render(<MobileNavigationGroup {...defaultProps} visible={true} />)
    const container = screen.getByTestId('mobile-navigation-group-container')
    expect(container).toHaveAttribute('aria-hidden', 'false')
  })
})
