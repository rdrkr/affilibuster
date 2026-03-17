// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { render, screen } from '@testing-library/react'
import DefaultHomeSections, { HomeSections } from '@/components/homepage/HomeSections'
import type { HomeSectionsProps } from '@/components/homepage/HomeSections'
import { DirectionEnum } from '@/lib/generated/types.gen'

// Mock shared components
jest.mock('@/components/sections/HeroSection', () => ({
  HeroSection: ({ data }: any) => <div data-testid="hero-section">{data.id}</div>,
}))
jest.mock('@/components/sections/FeaturedProductsSection', () => ({
  FeaturedProductsSection: ({ data }: any) => <div data-testid="featured-products">{data.id}</div>,
}))
jest.mock('@/components/sections/ProductCategoriesSection', () => ({
  ProductCategoriesSection: ({ data }: any) => <div data-testid="product-categories">{data.id}</div>,
}))
jest.mock('@/components/sections/BrandFeaturesSection', () => ({
  BrandFeaturesSection: ({ data }: any) => <div data-testid="brand-features">{data.id}</div>,
}))
jest.mock('@/components/elements/TextBlock', () => ({
  TextBlock: ({ data }: any) => <div data-testid="text-block">{data.id}</div>,
}))
jest.mock('@/components/layout', () => ({
  DynamicZone: ({ sections, renderSection }: any) => (
    <div data-testid="dynamic-zone">
      {sections.map((s: any, i: number) => (
        <div key={s.id ?? i}>{renderSection(s)}</div>
      ))}
    </div>
  ),
}))
jest.mock('@/components/providers/LayoutProvider', () => ({
  useLayoutContext: () => ({ direction: DirectionEnum.LTR }),
}))

const baseProps: HomeSectionsProps = {
  sections: [],
  enableUserProfile: false,
}

describe('HomeSections', () => {
  it('renders hero section', () => {
    const sections = [{ __component: 'sections.hero' as const, id: 1 }] as any[]
    render(<HomeSections {...baseProps} sections={sections} />)
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })

  it('skips hero when skipHero is true', () => {
    const sections = [{ __component: 'sections.hero' as const, id: 1 }] as any[]
    render(<HomeSections {...baseProps} sections={sections} skipHero />)
    expect(screen.queryByTestId('hero-section')).not.toBeInTheDocument()
  })

  it('renders heroSlot when provided', () => {
    const sections = [{ __component: 'sections.hero' as const, id: 1 }] as any[]
    render(<HomeSections {...baseProps} sections={sections} heroSlot={<div data-testid="hero-slot">Slot</div>} />)
    expect(screen.getByTestId('hero-slot')).toBeInTheDocument()
    expect(screen.queryByTestId('hero-section')).not.toBeInTheDocument()
  })

  it('renders featured products section', () => {
    const sections = [{ __component: 'sections.featured-products' as const, id: 2 }] as any[]
    render(<HomeSections {...baseProps} sections={sections} />)
    expect(screen.getByTestId('featured-products')).toBeInTheDocument()
  })

  it('renders product categories section', () => {
    const sections = [{ __component: 'sections.category-grid' as const, id: 3, categories: [] }] as any[]
    render(<HomeSections {...baseProps} sections={sections} />)
    expect(screen.getByTestId('product-categories')).toBeInTheDocument()
  })

  it('renders brand features section', () => {
    const sections = [{ __component: 'sections.brand-features-section' as const, id: 4 }] as any[]
    render(<HomeSections {...baseProps} sections={sections} />)
    expect(screen.getByTestId('brand-features')).toBeInTheDocument()
  })

  it('renders text block section', () => {
    const sections = [{ __component: 'elements.text-block' as const, id: 5 }] as any[]
    render(<HomeSections {...baseProps} sections={sections} />)
    expect(screen.getByTestId('text-block')).toBeInTheDocument()
  })

  it('returns null for unknown section types', () => {
    const sections = [{ __component: 'unknown.type' as any, id: 99 }] as any[]
    render(<HomeSections {...baseProps} sections={sections} />)
    // Unknown section wrapped in a div but renders null content
    expect(screen.queryByTestId('hero-section')).not.toBeInTheDocument()
    expect(screen.queryByTestId('featured-products')).not.toBeInTheDocument()
  })

  it('renders empty when no sections provided', () => {
    const { container } = render(<HomeSections {...baseProps} sections={[]} />)
    expect(container.querySelector('[data-testid="dynamic-zone"]')).toBeInTheDocument()
  })

  it('exports default and named export as the same component', () => {
    expect(DefaultHomeSections).toBe(HomeSections)
  })
})
