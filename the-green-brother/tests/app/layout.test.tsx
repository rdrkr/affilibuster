// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for root layout component
 */

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter-font' }),
}))

// Mock the navigation API
jest.mock('@/lib/content/api', () => ({
  getNavigation: jest.fn(),
}))

import RootLayout, { generateMetadata } from '@/app/layout'
import { getNavigation } from '@/lib/content/api'

const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be a valid React component', () => {
    // RootLayout is a function component
    expect(typeof RootLayout).toBe('function')
  })

  it('should accept children prop', () => {
    // The component should accept children
    const element = RootLayout({ children: <div>Test</div> })
    expect(element).toBeDefined()
  })

  it('should return an html element structure', () => {
    const element = RootLayout({ children: <div>Content</div> })
    // element.type should be 'html'
    expect(element.type).toBe('html')
  })

  it('should include suppressHydrationWarning on html element', () => {
    const element = RootLayout({ children: <div>Content</div> })
    expect(element.props.suppressHydrationWarning).toBe(true)
  })

  it('should not set a lang attribute on html element', () => {
    const element = RootLayout({ children: <div>Content</div> })
    expect(element.props.lang).toBeUndefined()
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return metadata from navigation data', async () => {
    mockGetNavigation.mockResolvedValueOnce({
      siteTitle: 'Test Site',
      siteDescription: 'Test Description',
    } as Awaited<ReturnType<typeof getNavigation>>)

    const metadata = await generateMetadata()

    expect(metadata).toEqual({
      title: 'Test Site',
      description: 'Test Description',
      manifest: '/manifest.webmanifest',
    })
  })

  it('should return default metadata when navigation is null', async () => {
    mockGetNavigation.mockResolvedValueOnce(null)

    const metadata = await generateMetadata()

    expect(metadata).toEqual({
      title: 'TheGreenBrother - Sustainable Products',
      description: 'Your trusted source for curated sustainable products.',
      manifest: '/manifest.webmanifest',
    })
  })

  it('should return default title when navigation has no siteTitle', async () => {
    mockGetNavigation.mockResolvedValueOnce({
      siteDescription: 'Test Description',
    } as Awaited<ReturnType<typeof getNavigation>>)

    const metadata = await generateMetadata()

    expect(metadata.title).toBe('TheGreenBrother - Sustainable Products')
    expect(metadata.description).toBe('Test Description')
  })

  it('should return default description when navigation has no siteDescription', async () => {
    mockGetNavigation.mockResolvedValueOnce({
      siteTitle: 'Custom Title',
    } as Awaited<ReturnType<typeof getNavigation>>)

    const metadata = await generateMetadata()

    expect(metadata.title).toBe('Custom Title')
    expect(metadata.description).toBe('Your trusted source for curated sustainable products.')
  })
})
