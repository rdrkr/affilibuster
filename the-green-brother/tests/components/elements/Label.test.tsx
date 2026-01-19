// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Label component
 */

import { render, screen } from '@testing-library/react'

import { Label, type LabelProps } from '@/components/elements/Label'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the CMS primitive components (Label uses relative imports)
jest.mock('@/components/elements/Icon', () => ({
  __esModule: true,
  default: function MockIcon({
    icon,
    size,
    className,
  }: {
    icon?: string
    size?: string
    className?: string
    ariaLabel?: string
  }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
        {icon}
      </span>
    )
  },
  Icon: function MockIcon({
    icon,
    size,
    className,
  }: {
    icon?: string
    size?: string
    className?: string
    ariaLabel?: string
  }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
        {icon}
      </span>
    )
  },
}))

jest.mock('@/components/elements/Text', () => ({
  __esModule: true,
  default: function MockText({ text, as: Component = 'span', className }: any) {
    return (
      <Component data-testid="mock-text" className={className}>
        {text}
      </Component>
    )
  },
  Text: function MockText({ text, as: Component = 'span', className }: any) {
    return (
      <Component data-testid="mock-text" className={className}>
        {text}
      </Component>
    )
  },
}))

describe('Label', () => {
  const mockLabelData: LabelProps['data'] = {
    text: 'Test Label',
    icon: 'star',
    iconPosition: IconPositionEnum.BEFORE_TEXT,
    ariaDescription: 'Test label description',
  }

  it('should render null when data is undefined', () => {
    const { container } = render(<Label direction={DirectionEnum.LTR} data={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render text with default props', () => {
    render(<Label direction={DirectionEnum.LTR} data={mockLabelData} />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    render(<Label direction={DirectionEnum.LTR} data={mockLabelData} />)
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('data-icon', 'star')
  })

  it('should hide icon when hideIcon is true', () => {
    render(<Label direction={DirectionEnum.LTR} data={mockLabelData} hideIcon />)
    expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument()
  })

  it('should render icon before text when iconPosition is BEFORE_TEXT', () => {
    const { container } = render(<Label direction={DirectionEnum.LTR} data={mockLabelData} />)
    const wrapper = container.firstChild as HTMLElement
    const children = wrapper.children
    expect(children[0]).toHaveAttribute('data-testid', 'mock-icon')
    expect(children[1]).toHaveAttribute('data-testid', 'mock-text')
  })

  it('should render icon after text when iconPosition is AFTER_TEXT', () => {
    const dataWithAfterIcon = {
      ...mockLabelData,
      iconPosition: IconPositionEnum.AFTER_TEXT,
    }
    const { container } = render(<Label direction={DirectionEnum.LTR} data={dataWithAfterIcon} />)
    const wrapper = container.firstChild as HTMLElement
    const children = wrapper.children
    expect(children[0]).toHaveAttribute('data-testid', 'mock-text')
    expect(children[1]).toHaveAttribute('data-testid', 'mock-icon')
  })

  it('should apply dir="rtl" attribute for RTL direction', () => {
    const { container } = render(<Label data={mockLabelData} direction={DirectionEnum.RTL} />)
    expect(container.firstChild).toHaveAttribute('dir', 'rtl')
  })

  it('should apply flex-row class for LTR direction (default)', () => {
    const { container } = render(<Label direction={DirectionEnum.LTR} data={mockLabelData} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('flex-row')
    expect(wrapper.className).not.toContain('flex-row-reverse')
    expect(wrapper).toHaveAttribute('dir', 'ltr')
  })

  it('should apply inline-flex display when display is inline', () => {
    const { container } = render(<Label direction={DirectionEnum.LTR} data={mockLabelData} display="inline" />)
    expect(container.firstChild).toHaveClass('inline-flex')
  })

  it('should apply flex display by default (block)', () => {
    const { container } = render(<Label direction={DirectionEnum.LTR} data={mockLabelData} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('flex')
    expect(wrapper.className).not.toContain('inline-flex')
  })

  it('should render with custom tag (h1)', () => {
    render(<Label direction={DirectionEnum.LTR} data={mockLabelData} as="h1" />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it('should render with custom tag (h2)', () => {
    render(<Label direction={DirectionEnum.LTR} data={mockLabelData} as="h2" />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
  })

  it('should render with custom tag (p)', () => {
    const { container } = render(<Label direction={DirectionEnum.LTR} data={mockLabelData} as="p" />)
    expect(container.firstChild?.nodeName).toBe('P')
  })

  it('should apply custom className to container', () => {
    const { container } = render(<Label direction={DirectionEnum.LTR} data={mockLabelData} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should apply custom textClassName to text', () => {
    render(<Label direction={DirectionEnum.LTR} data={mockLabelData} textClassName="text-class" />)
    const text = screen.getByTestId('mock-text')
    expect(text.className).toContain('text-class')
  })

  it('should apply custom iconClassName to icon', () => {
    render(<Label direction={DirectionEnum.LTR} data={mockLabelData} iconClassName="icon-class" />)
    const icon = screen.getByTestId('mock-icon')
    expect(icon.className).toContain('icon-class')
  })

  it('should pass iconSize to Icon', () => {
    render(<Label direction={DirectionEnum.LTR} data={mockLabelData} iconSize="lg" />)
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toHaveAttribute('data-size', 'lg')
  })

  it('should not render icon when icon is undefined', () => {
    const dataWithoutIcon = {
      ...mockLabelData,
      icon: undefined,
    } as unknown as LabelProps['data']
    render(<Label direction={DirectionEnum.LTR} data={dataWithoutIcon} />)
    expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument()
  })

  it('should use default iconSize lg', () => {
    render(<Label direction={DirectionEnum.LTR} data={mockLabelData} />)
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toHaveAttribute('data-size', 'lg')
  })

  it('should render with all valid heading tags', () => {
    const tags: ('h3' | 'h4' | 'h5' | 'h6')[] = ['h3', 'h4', 'h5', 'h6']
    tags.forEach(tag => {
      const { container, unmount } = render(<Label direction={DirectionEnum.LTR} data={mockLabelData} as={tag} />)
      const heading = container.querySelector(tag)
      expect(heading).toBeInTheDocument()
      unmount()
    })
  })

  it('should set aria-label on container', () => {
    const { container } = render(<Label direction={DirectionEnum.LTR} data={mockLabelData} />)
    expect(container.firstChild).toHaveAttribute('aria-label', 'Test label description')
  })
})
