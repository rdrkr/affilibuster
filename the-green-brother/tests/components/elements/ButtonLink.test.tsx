// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ButtonLink server component
 */

import { render, screen } from '@testing-library/react'

import ButtonLinkDefault, { ButtonLink, type ButtonLinkProps } from '@/components/elements/ButtonLink'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the Label component (ButtonLink uses relative import)
jest.mock('@/components/elements/Label', () => ({
  __esModule: true,
  default: function MockLabel({
    data,
    direction,
    iconSize,
  }: {
    data?: { text?: string; ariaDescription?: string }
    direction?: string
    iconSize?: string
  }) {
    return (
      <span data-testid="mock-label" data-direction={direction} data-icon-size={iconSize}>
        {data?.text}
      </span>
    )
  },
  Label: function MockLabel({
    data,
    direction,
    iconSize,
  }: {
    data?: { text?: string; ariaDescription?: string }
    direction?: string
    iconSize?: string
  }) {
    return (
      <span data-testid="mock-label" data-direction={direction} data-icon-size={iconSize}>
        {data?.text}
      </span>
    )
  },
}))

describe('ButtonLink', () => {
  const mockButtonData: ButtonLinkProps['data'] = {
    url: '/test-url',
    openInNewTab: false,
    label: {
      text: 'Click Me',
      icon: 'arrow_forward',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'Test button description',
    },
  }

  it('should render null when data is undefined', () => {
    const { container } = render(<ButtonLink direction={DirectionEnum.LTR} data={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render hidden element when visible is false', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} visible={false} />)
    const link = screen.getByRole('link', { hidden: true })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('aria-hidden', 'true')
    expect(link.className).toContain('opacity-0')
    expect(link.className).toContain('w-0')
  })

  it('should render as a link', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} />)
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test-url')
  })

  it('should render label content', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} />)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('should open in new tab when openInNewTab is true', () => {
    const dataWithNewTab = { ...mockButtonData, openInNewTab: true }
    render(<ButtonLink direction={DirectionEnum.LTR} data={dataWithNewTab} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should not have target/rel when openInNewTab is false', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} />)
    const link = screen.getByRole('link')
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
  })

  it('should apply aria-label from nested label', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'Test button description')
  })

  it('should apply aria-expanded when provided', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} aria-expanded={true} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-expanded', 'true')
  })

  it('should pass direction to Label component', () => {
    render(<ButtonLink data={mockButtonData} direction={DirectionEnum.RTL} />)
    const label = screen.getByTestId('mock-label')
    expect(label).toHaveAttribute('data-direction', DirectionEnum.RTL)
  })

  it('should pass iconSize to Label component', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} iconSize="lg" />)
    const label = screen.getByTestId('mock-label')
    expect(label).toHaveAttribute('data-icon-size', 'lg')
  })

  it('should apply primary variant classes by default', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('bg-primary')
  })

  it('should apply secondary variant classes', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} variant="secondary" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('bg-white/5')
  })

  it('should apply outline variant classes', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} variant="outline" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('border-primary')
  })

  it('should apply ghost variant classes', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} variant="ghost-1" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('text-primary')
    expect(link.className).toContain('hover:bg-transparent')
  })

  it('should apply disabled styling when disabled prop is true', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} disabled />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('pointer-events-none')
    expect(link.className).toContain('opacity-50')
    expect(link.className).toContain('cursor-not-allowed')
  })

  it('should have aria-disabled when disabled is true', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} disabled />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-disabled', 'true')
  })

  it('should apply link variant classes without dimension classes but WITH text size', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} variant="link-1" size="lg" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('hover:scale-105')
    // Should have p-0
    expect(link.className).toContain('p-0')
    // Should have text size
    expect(link.className).toContain('text-lg')
    // Should NOT have padding
    expect(link.className).not.toContain('px-6')
  })

  it('should allow overriding text size via className', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} size="md" className="text-xl" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('text-base')
    expect(link.className).toContain('text-xl')
  })

  it('should apply sm size classes', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} size="sm" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('px-3')
    expect(link.className).toContain('py-1.5')
    expect(link.className).toContain('text-sm')
  })

  it('should apply md size classes by default', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('px-4')
    expect(link.className).toContain('py-2')
    expect(link.className).toContain('text-base')
  })

  it('should apply lg size classes', () => {
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} size="lg" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('px-5')
    expect(link.className).toContain('py-3')
    expect(link.className).toContain('text-lg')
  })

  it('should apply custom className', () => {
    // eslint-disable-next-line better-tailwindcss/no-unknown-classes
    render(<ButtonLink direction={DirectionEnum.LTR} data={mockButtonData} className="custom-class" />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('custom-class')
  })

  it('should render both label and children when both are provided', () => {
    render(
      <ButtonLink direction={DirectionEnum.LTR} data={mockButtonData}>
        <span>Custom Content</span>
      </ButtonLink>
    )
    expect(screen.getByText('Custom Content')).toBeInTheDocument()
    // Label content should ALSO be rendered (children are appended to label)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('should return null when label is undefined and no children', () => {
    const dataWithoutLabel = { ...mockButtonData, label: undefined } as unknown as ButtonLinkProps['data']
    const { container } = render(<ButtonLink direction={DirectionEnum.LTR} data={dataWithoutLabel} />)
    // Component should return null (no content to render)
    expect(container.firstChild).toBeNull()
  })

  it('should render label before children in LTR', () => {
    const { container } = render(
      <ButtonLink direction={DirectionEnum.LTR} data={mockButtonData}>
        <span data-testid="custom">Custom</span>
      </ButtonLink>
    )
    const link = container.querySelector('a')
    const children = Array.from(link?.children ?? [])
    // First child should be the label (mock-label), second should be the custom span
    expect(children[0]).toHaveAttribute('data-testid', 'mock-label')
    expect(children[1]).toHaveAttribute('data-testid', 'custom')
  })

  it('should render children before label in RTL', () => {
    const { container } = render(
      <ButtonLink direction={DirectionEnum.RTL} data={mockButtonData}>
        <span data-testid="custom">Custom</span>
      </ButtonLink>
    )
    const link = container.querySelector('a')
    const children = Array.from(link?.children ?? [])
    // First child should be the custom span, second should be the label (mock-label)
    expect(children[0]).toHaveAttribute('data-testid', 'custom')
    expect(children[1]).toHaveAttribute('data-testid', 'mock-label')
  })

  it('should work with default export', () => {
    render(<ButtonLinkDefault direction={DirectionEnum.LTR} data={mockButtonData} />)
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test-url')
  })
})
