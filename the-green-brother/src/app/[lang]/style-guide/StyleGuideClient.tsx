// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import React from 'react'

import { BlogCard } from '@/components/blog'

import { NewsletterSignupCTA } from '@/components/call-to-actions'
import { ButtonAction, ButtonLink, Header, Icon, Image, Label, Text, TextBlock } from '@/components/elements'
import { ContributorCard } from '@/components/elements/ContributorCard'
import { PageClient } from '@/components/layout'
import { LanguageMenu, ProductCategoriesMenu, SearchMenu, ThemeMenu } from '@/components/menus'
import BackToTopButton from '@/components/navigation/BackToTopButton'
import { ProductCard } from '@/components/product/ProductCard'
import { BrandFeaturesSection, HeroSection } from '@/components/sections'
import {
  AlignmentEnum,
  type ApiBlogPostBlogPostDocument,
  type ApiContributorContributorDocument,
  type ApiProductProductDocument,
  type ElementsHeaderEntry,
  IconPositionEnum,
  LanguageCode,
  VariantEnum,
} from '@/lib/generated/types.gen'

import { useLayoutContext } from '@/components/providers/LayoutProvider'

/**
 * Style Guide Client Component - Interactive UI showcase.
 * This is a client component that displays all design tokens and reusable components.
 * @returns The style guide client component
 */
export default function StyleGuideClient(): React.ReactElement {
  const { lang, direction } = useLayoutContext()
  const mockLabels = {
    readTimeMinutesLabel: {
      text: 'min read',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Read time in minutes',
    },
    readArticleLabel: {
      text: 'Read Article',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'Read full article',
    },
    mockAuthor: {
      documentId: 'mock-contributor',
      id: 0,
      firstName: 'The Green',
      lastName: 'Brother',
      slug: 'the-green-brother',
      bio: 'Eco enthusiast',
      publishedAt: new Date().toISOString(),
      roles: [],
    },
  }
  return (
    <PageClient>
      {/* Hero Section - Using actual HeroSection component */}
      <HeroSection
        direction={direction}
        data={{
          __component: 'sections.hero',
          id: 1,
          variant: VariantEnum.TEXT_OVER_BACKGROUND,
          image: {
            documentId: 'placeholder',
            id: 0,
            name: 'placeholder.svg',
            hash: 'placeholder',
            mime: 'image/svg+xml',
            size: 1024,
            url: '/images/placeholder.svg',
            provider: 'local',
            publishedAt: new Date().toISOString(),
          },
          header: {
            alignment: AlignmentEnum.CENTER,
            promoteHeaderIcon: false,
            header: {
              icon: 'eco',
              text: 'TheGreenBrother **Style Guide**',
              iconPosition: IconPositionEnum.BEFORE_TEXT,
              ariaDescription: 'Style Guide - Design system reference',
            },
            subheader: {
              text: 'Design system reference for sustainable eco-friendly products',
              iconPosition: IconPositionEnum.BEFORE_TEXT,
              ariaDescription: 'Subtitle',
            },
          },
          exploreButton: {
            label: {
              icon: 'arrow_downward',
              text: 'Explore Components',
              iconPosition: IconPositionEnum.AFTER_TEXT,
              ariaDescription: 'Scroll to components',
            },
            url: '#components',
            openInNewTab: false,
          },
        }}
      />

      <div className="container mx-auto space-y-16 px-4 py-16">
        {/* Table of Contents */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative z-10">
            <h2 className="mb-8 text-4xl font-bold text-white">Component Hierarchy</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 text-xl font-bold text-primary">Primitives</h3>
                <ul className="space-y-2 text-text-secondary-dark">
                  <li>• Text - Text with markdown formatting</li>
                  <li>• Icon - Material Symbols & local icons</li>
                  <li>• Image - CMS media handler</li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 text-xl font-bold text-primary">Elements</h3>
                <ul className="space-y-2 text-text-secondary-dark">
                  <li>
                    <a href="#blog-card" className="hover:text-primary-hover active:text-primary-700">
                      • BlogCard - Blog post preview
                    </a>
                  </li>
                  <li>
                    <a href="#product-card" className="hover:text-primary-hover active:text-primary-700">
                      • ProductCard - Product display
                    </a>
                  </li>
                  <li>
                    <a href="#contributor-card" className="hover:text-primary-hover active:text-primary-700">
                      • ContributorCard - Team member profile
                    </a>
                  </li>
                  <li>
                    <a href="#card-heights" className="hover:text-primary-hover active:text-primary-700">
                      • Card Height Variants - Full/Fixed height examples
                    </a>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 text-xl font-bold text-primary">Interactive Components</h3>
                <ul className="space-y-2 text-text-secondary-dark">
                  <li>• LanguageMenu - Language switcher</li>
                  <li>• ThemeMenu - Dark/Light mode toggle</li>
                  <li>• BackToTopButton - Scroll to top</li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 text-xl font-bold text-primary">Layout Components</h3>
                <ul className="space-y-2 text-text-secondary-dark">
                  <li>• Navigation - Header with menus (CMS-driven)</li>
                  <li>• Footer - Site footer (CMS-driven)</li>
                  <li>• Section Components - Hero, Products, Blog, etc.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Primitive Components Section */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16">
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 space-y-12">
            <div>
              <h2 className="mb-4 text-4xl font-bold text-white">Primitive Components</h2>
              <p className="text-lg text-text-secondary-dark">
                1:1 mappings to Strapi fields. These are the building blocks for all other components.
              </p>
            </div>

            {/* Text Component */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">Text</h3>
              <p className="mb-6 text-text-secondary-dark">
                Renders CMS text with markdown-style **bold** formatting. Bold text automatically gets primary color.
              </p>
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">Plain Text</h4>
                  <div className="rounded-xl border border-white/10 bg-surface-dark p-6">
                    <Text text="Simple text without formatting" className="text-lg text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">Bold Text (Markdown)</h4>
                  <div className="rounded-xl border border-white/10 bg-surface-dark p-6">
                    <Text text="This text has **bold formatting** in primary color" className="text-lg text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">As Different HTML Elements</h4>
                  <div className="space-y-4 rounded-xl border border-white/10 bg-surface-dark p-6">
                    <Text text="Heading: Eco **Friendly** Products" as="h2" className="text-3xl font-bold text-white" />
                    <Text
                      text="Paragraph: We sell **sustainable** products"
                      as="p"
                      className="text-text-secondary-dark"
                    />
                    <Text text="Span: Visit our **store**" as="span" className="text-white" />
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">
                    {`<Text text="Hello **World**" />
<Text text="Eco **Friendly**" as="h1" className="text-4xl" />

// **bold** converts to <span className="text-primary">bold</span>`}
                  </code>
                </pre>
              </div>
            </div>

            {/* Icon Component */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">Icon</h3>
              <p className="mb-6 text-text-secondary-dark">
                Renders Material Symbols icons or local image files. Automatically detects type based on file extension.
              </p>
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">Material Symbols Icons</h4>
                  <div className="rounded-xl border border-white/10 bg-surface-dark p-6">
                    <div className="flex flex-wrap gap-8">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="Nest Eco Leaf" size="3xl" className="text-primary" />
                        <span className="text-sm text-text-secondary-dark">nest_eco_leaf</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="recycling" size="3xl" className="text-primary" />
                        <span className="text-sm text-text-secondary-dark">recycling</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="eco" size="3xl" className="text-primary" />
                        <span className="text-sm text-text-secondary-dark">eco</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="water_drop" size="3xl" className="text-primary" />
                        <span className="text-sm text-text-secondary-dark">water_drop</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="shopping_bag" size="3xl" className="text-primary" />
                        <span className="text-sm text-text-secondary-dark">shopping_bag</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="favorite" size="3xl" className="text-primary" />
                        <span className="text-sm text-text-secondary-dark">favorite</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">Icon Sizes</h4>
                  <div className="flex flex-wrap items-end gap-8 rounded-xl border border-white/10 bg-surface-dark p-6">
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="sm" className="text-primary" />
                      <span className="text-xs text-text-secondary-dark">sm (16px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="md" className="text-primary" />
                      <span className="text-xs text-text-secondary-dark">md (20px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="lg" className="text-primary" />
                      <span className="text-xs text-text-secondary-dark">lg (24px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="xl" className="text-primary" />
                      <span className="text-xs text-text-secondary-dark">xl (32px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="2xl" className="text-primary" />
                      <span className="text-xs text-text-secondary-dark">2xl (40px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="3xl" className="text-primary" />
                      <span className="text-xs text-text-secondary-dark">3xl (48px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="4xl" className="text-primary" />
                      <span className="text-xs text-text-secondary-dark">4xl (56px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="5xl" className="text-primary" />
                      <span className="text-xs text-text-secondary-dark">5xl (64px)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">Color Variations</h4>
                  <div className="flex flex-wrap gap-8 rounded-xl border border-white/10 bg-surface-dark p-6">
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="3xl" className="text-primary" />
                      <span className="text-sm text-text-secondary-dark">Primary</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="3xl" className="text-secondary" />
                      <span className="text-sm text-text-secondary-dark">Secondary</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="3xl" className="text-white" />
                      <span className="text-sm text-text-secondary-dark">White</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="eco" size="3xl" className="text-text-secondary-dark" />
                      <span className="text-sm text-text-secondary-dark">Gray</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">
                    {`<Icon icon="Nest Eco Leaf" size="lg" className="text-primary" />
<Icon icon="eco" size="3xl" className="text-white" />

// Local image icons
<Icon icon="brand.svg" size="lg" />`}
                  </code>
                </pre>
              </div>
            </div>

            {/* Image Component */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">Image</h3>
              <p className="mb-6 text-text-secondary-dark">
                Wrapper around Next.js Image that resolves CMS media URLs and extracts alt text. Handles placeholder
                fallback.
              </p>
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">Placeholder Example</h4>
                  <div className="rounded-xl border border-white/10 bg-surface-dark p-6">
                    <Image image={null} width={200} height={200} className="rounded-xl" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">Usage Example</h4>
                  <div className="rounded-xl bg-surface-dark p-4">
                    <pre className="overflow-x-auto text-xs">
                      <code className="text-tertiary-300">
                        {`// With CMS media object
<Image
  image={product.image}
  width={300}
  height={300}
  className="rounded-xl"
/>

// With fill (responsive)
<div className="relative h-64 w-full">
  <Image
    image={hero.backgroundImage}
    fill
    className="object-cover"
    sizes="100vw"
  />
</div>

// Placeholder shown when image is null/undefined`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette Section - Full Theme Tokens */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 space-y-16">
            <div>
              <h2 className="mb-4 text-4xl font-bold text-white">Color Palette</h2>
              <p className="text-lg text-text-secondary-dark">
                Complete design tokens from <code className="rounded-sm bg-surface-dark px-2 py-1">theme.css</code>. All
                colors use CSS custom properties for consistency.
              </p>
            </div>

            {/* Primary Palette */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-white">Primary (TheGreenBrother Green)</h3>
              <div className="grid grid-cols-5 gap-4 md:grid-cols-10">
                {[
                  { shade: 50, bg: 'bg-primary-50' },
                  { shade: 100, bg: 'bg-primary-100' },
                  { shade: 200, bg: 'bg-primary-200' },
                  { shade: 300, bg: 'bg-primary-300' },
                  { shade: 400, bg: 'bg-primary-400' },
                  { shade: 500, bg: 'bg-primary-500', border: true },
                  { shade: 600, bg: 'bg-primary-600', border: true },
                  { shade: 700, bg: 'bg-primary-700', border: true },
                  { shade: 800, bg: 'bg-primary-800', border: true },
                  { shade: 900, bg: 'bg-primary-900', border: true },
                ].map(({ shade, bg, border }) => (
                  <div key={`primary-${String(shade)}`} className="text-center">
                    <div className={`mb-2 h-16 rounded-xl ${bg} ${border ? 'border border-white/10' : ''}`} />
                    <p className="text-xs text-text-secondary-dark">{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Palette */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-white">Secondary (Dark Green)</h3>
              <div className="grid grid-cols-5 gap-4 md:grid-cols-10">
                {[
                  { shade: 50, bg: 'bg-secondary-50' },
                  { shade: 100, bg: 'bg-secondary-100' },
                  { shade: 200, bg: 'bg-secondary-200' },
                  { shade: 300, bg: 'bg-secondary-300' },
                  { shade: 400, bg: 'bg-secondary-400', border: true },
                  { shade: 500, bg: 'bg-secondary-500', border: true },
                  { shade: 600, bg: 'bg-secondary-600', border: true },
                  { shade: 700, bg: 'bg-secondary-700', border: true },
                  { shade: 800, bg: 'bg-secondary-800', border: true },
                  { shade: 900, bg: 'bg-secondary-900', border: true },
                ].map(({ shade, bg, border }) => (
                  <div key={`secondary-${String(shade)}`} className="text-center">
                    <div className={`mb-2 h-16 rounded-xl ${bg} ${border ? 'border border-white/10' : ''}`} />
                    <p className="text-xs text-text-secondary-dark">{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tertiary Palette */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-white">Tertiary (Forest Tones)</h3>
              <div className="grid grid-cols-5 gap-4 md:grid-cols-10">
                {[
                  { shade: 50, bg: 'bg-tertiary-50' },
                  { shade: 100, bg: 'bg-tertiary-100' },
                  { shade: 200, bg: 'bg-tertiary-200' },
                  { shade: 300, bg: 'bg-tertiary-300' },
                  { shade: 400, bg: 'bg-tertiary-400' },
                  { shade: 500, bg: 'bg-tertiary-500', border: true },
                  { shade: 600, bg: 'bg-tertiary-600', border: true },
                  { shade: 700, bg: 'bg-tertiary-700', border: true },
                  { shade: 800, bg: 'bg-tertiary-800', border: true },
                  { shade: 900, bg: 'bg-tertiary-900', border: true },
                ].map(({ shade, bg, border }) => (
                  <div key={`tertiary-${String(shade)}`} className="text-center">
                    <div className={`mb-2 h-16 rounded-xl ${bg} ${border ? 'border border-white/10' : ''}`} />
                    <p className="text-xs text-text-secondary-dark">{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Colors */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-white">Semantic Colors</h3>
              <div className="grid gap-8 md:grid-cols-3">
                {/* Success */}
                <div>
                  <h4 className="mb-4 font-semibold text-success-400">Success</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { shade: 100, bg: 'bg-success-100' },
                      { shade: 300, bg: 'bg-success-300' },
                      { shade: 500, bg: 'bg-success-500' },
                      { shade: 700, bg: 'bg-success-700', border: true },
                      { shade: 900, bg: 'bg-success-900', border: true },
                    ].map(({ shade, bg, border }) => (
                      <div key={`success-${String(shade)}`} className="text-center">
                        <div className={`mb-1 h-10 rounded-sm ${bg} ${border ? 'border border-white/10' : ''}`} />
                        <p className="text-xs text-text-secondary-dark">{shade}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Error */}
                <div>
                  <h4 className="mb-4 font-semibold text-error-400">Error</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { shade: 100, bg: 'bg-error-100' },
                      { shade: 300, bg: 'bg-error-300' },
                      { shade: 500, bg: 'bg-error-500' },
                      { shade: 700, bg: 'bg-error-700', border: true },
                      { shade: 900, bg: 'bg-error-900', border: true },
                    ].map(({ shade, bg, border }) => (
                      <div key={`error-${String(shade)}`} className="text-center">
                        <div className={`mb-1 h-10 rounded-sm ${bg} ${border ? 'border border-white/10' : ''}`} />
                        <p className="text-xs text-text-secondary-dark">{shade}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Warning */}
                <div>
                  <h4 className="mb-4 font-semibold text-warning-400">Warning</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { shade: 100, bg: 'bg-warning-100' },
                      { shade: 300, bg: 'bg-warning-300' },
                      { shade: 500, bg: 'bg-warning-500' },
                      { shade: 700, bg: 'bg-warning-700', border: true },
                      { shade: 900, bg: 'bg-warning-900', border: true },
                    ].map(({ shade, bg, border }) => (
                      <div key={`warning-${String(shade)}`} className="text-center">
                        <div className={`mb-1 h-10 rounded-sm ${bg} ${border ? 'border border-white/10' : ''}`} />
                        <p className="text-xs text-text-secondary-dark">{shade}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Surface & Background */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-white">Surface & Background</h3>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="text-center">
                  <div className="mb-2 h-24 rounded-xl border border-white/10 bg-background-dark" />
                  <p className="text-sm text-text-secondary-dark">bg-background-dark</p>
                </div>
                <div className="text-center">
                  <div className="mb-2 h-24 rounded-xl border border-white/10 bg-surface-dark" />
                  <p className="text-sm text-text-secondary-dark">bg-surface-dark</p>
                </div>
                <div className="text-center">
                  <div className="mb-2 h-24 rounded-xl border border-white/10 bg-subtle-dark" />
                  <p className="text-sm text-text-secondary-dark">bg-subtle-dark</p>
                </div>
                <div className="text-center">
                  <div className="mb-2 h-24 rounded-xl bg-primary shadow-lg shadow-primary/30" />
                  <p className="text-sm text-text-secondary-dark">bg-primary</p>
                </div>
              </div>
            </div>

            {/* Text Colors */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-white">Text Colors</h3>
              <div className="space-y-4 rounded-xl border border-white/10 bg-background-dark p-6">
                <p className="text-text-main-dark">text-text-main-dark - Primary text color</p>
                <p className="text-text-secondary-dark">text-text-secondary-dark - Secondary/muted text</p>
                <p className="text-text-heading-dark">text-text-heading-dark - Heading text</p>
                <p className="text-text-body-dark">text-text-body-dark - Body text</p>
                <p className="text-text-muted-dark">text-text-muted-dark - Muted text</p>
                <p className="text-primary">text-primary - Brand accent text</p>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing Scale Section */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16">
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10">
            <h2 className="mb-4 text-4xl font-bold text-white">Spacing Scale</h2>
            <p className="mb-8 text-lg text-text-secondary-dark">
              Consistent spacing tokens follow Tailwind&apos;s 0.25rem increment scale.
            </p>

            <div className="space-y-6">
              {[
                { name: 'spacing-1', size: '0.25rem (4px)', class: 'w-1' },
                { name: 'spacing-2', size: '0.5rem (8px)', class: 'w-2' },
                { name: 'spacing-3', size: '0.75rem (12px)', class: 'w-3' },
                { name: 'spacing-4', size: '1rem (16px)', class: 'w-4' },
                { name: 'spacing-6', size: '1.5rem (24px)', class: 'w-6' },
                { name: 'spacing-8', size: '2rem (32px)', class: 'w-8' },
                { name: 'spacing-12', size: '3rem (48px)', class: 'w-12' },
                { name: 'spacing-16', size: '4rem (64px)', class: 'w-16' },
                { name: 'spacing-24', size: '6rem (96px)', class: 'w-24' },
                { name: 'spacing-32', size: '8rem (128px)', class: 'w-32' },
              ].map(spacing => (
                <div key={spacing.name} className="flex items-center gap-4">
                  <div className={`${spacing.class} h-6 rounded-sm bg-primary`} />
                  <span className="w-32 font-mono text-sm text-white">{spacing.name}</span>
                  <span className="text-sm text-text-secondary-dark">{spacing.size}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Animations Section */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10">
            <h2 className="mb-4 text-4xl font-bold text-white">Animations</h2>
            <p className="mb-8 text-lg text-text-secondary-dark">
              Built-in animation keyframes from <code className="rounded-sm bg-surface-dark px-2 py-1">theme.css</code>.
              Hover to preview.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Fade animations */}
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 font-semibold text-white">Fade</h3>
                <div className="group flex h-20 items-center justify-center rounded-xl bg-surface-dark">
                  <div className="size-12 rounded-xl bg-primary opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <p className="mt-3 text-center font-mono text-xs text-text-secondary-dark">animate-fade-in</p>
              </div>

              {/* Scale animations */}
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 font-semibold text-white">Scale</h3>
                <div className="group flex h-20 items-center justify-center rounded-xl bg-surface-dark">
                  <div className="size-12 rounded-xl bg-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <p className="mt-3 text-center font-mono text-xs text-text-secondary-dark">animate-scale-up</p>
              </div>

              {/* Spin animation */}
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 font-semibold text-white">Spin</h3>
                <div className="group flex h-20 items-center justify-center rounded-xl bg-surface-dark">
                  <div className="flex size-12 items-center justify-center">
                    <Icon icon="refresh" size="3xl" className="text-primary group-hover:animate-spin" />
                  </div>
                </div>
                <p className="mt-3 text-center font-mono text-xs text-text-secondary-dark">animate-spin</p>
              </div>

              {/* Shimmer animation */}
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 font-semibold text-white">Shimmer</h3>
                <div className="group flex h-20 items-center justify-center rounded-xl bg-surface-dark">
                  <span className="text-shadow-shimmer text-2xl font-bold text-primary">Glowing Text</span>
                </div>
                <p className="mt-3 text-center font-mono text-xs text-text-secondary-dark">text-shadow-shimmer</p>
              </div>

              {/* Slide animations */}
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 font-semibold text-white">Slide Up</h3>
                <div className="group flex h-20 items-center justify-center overflow-hidden rounded-xl bg-surface-dark">
                  <div className="size-12 translate-y-4 rounded-xl bg-primary transition-transform duration-300 group-hover:translate-y-0" />
                </div>
                <p className="mt-3 text-center font-mono text-xs text-text-secondary-dark">animate-slide-up</p>
              </div>

              {/* Slide Left */}
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 font-semibold text-white">Slide Left</h3>
                <div className="group flex h-20 items-center justify-center overflow-hidden rounded-xl bg-surface-dark">
                  <div className="size-12 translate-x-8 rounded-xl bg-primary transition-transform duration-300 group-hover:translate-x-0" />
                </div>
                <p className="mt-3 text-center font-mono text-xs text-text-secondary-dark">animate-slide-left</p>
              </div>

              {/* Combined */}
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 font-semibold text-white">Combined</h3>
                <div className="group flex h-20 items-center justify-center rounded-xl bg-surface-dark">
                  <div className="size-12 scale-90 rounded-xl bg-primary opacity-70 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                </div>
                <p className="mt-3 text-center font-mono text-xs text-text-secondary-dark">fade + scale</p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16">
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 size-80 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative z-10">
            <h2 className="mb-8 text-4xl font-bold text-white">Typography</h2>

            <div className="space-y-12">
              {/* Headings */}
              <div>
                <h3 className="mb-6 text-2xl font-semibold text-white">Headings</h3>
                <div className="space-y-6 rounded-xl border border-white/5 bg-background-dark p-8">
                  <div>
                    <h1 className="text-5xl/tight font-bold text-white md:text-6xl">Heading 1</h1>
                    <code className="text-sm text-text-secondary-dark">text-5xl md:text-6xl font-bold</code>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-white md:text-5xl">Heading 2</h2>
                    <code className="text-sm text-text-secondary-dark">text-4xl md:text-5xl font-bold</code>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white md:text-4xl">Heading 3</h3>
                    <code className="text-sm text-text-secondary-dark">text-3xl md:text-4xl font-bold</code>
                  </div>
                </div>
              </div>

              {/* Body Text */}
              <div>
                <h3 className="mb-6 text-2xl font-semibold text-white">Body Text</h3>
                <div className="space-y-4 rounded-xl border border-white/5 bg-background-dark p-8">
                  <p className="text-lg text-white">Large body text - text-lg text-white</p>
                  <p className="text-base text-text-secondary-dark">
                    Regular body text - text-base text-text-secondary-dark
                  </p>
                  <p className="text-sm text-text-secondary-dark">Small body text - text-sm text-text-secondary-dark</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Element Components Section */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 space-y-12">
            <div>
              <h2 className="mb-4 text-4xl font-bold text-white">Element Components</h2>
              <p className="text-lg text-text-secondary-dark">
                Composite components built from primitives. 1:1 mapping to Strapi components.
              </p>
            </div>

            {/* Label Component */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">Label</h3>
              <p className="mb-6 text-text-secondary-dark">
                Composites Icon + Text. Used for headings, labels, and inline text elements with icons.
              </p>
              <div className="space-y-4">
                <Label
                  direction={direction}
                  data={{
                    icon: 'nest_eco_leaf',
                    text: 'Eco-Friendly Label',
                    iconPosition: IconPositionEnum.BEFORE_TEXT,
                    ariaDescription: 'Eco-friendly indicator',
                  }}
                  iconSize="lg"
                  className="text-xl font-bold text-primary"
                />
                <Label
                  direction={direction}
                  data={{
                    text: 'Simple Text Label',
                    iconPosition: IconPositionEnum.BEFORE_TEXT,
                    ariaDescription: 'Simple text label',
                  }}
                  className="text-lg text-white"
                />
                <Label
                  direction={direction}
                  data={{
                    icon: 'star',
                    text: 'Icon After Text',
                    iconPosition: IconPositionEnum.AFTER_TEXT,
                    ariaDescription: 'Star label',
                  }}
                  iconSize="md"
                  className="text-lg text-white"
                />
              </div>
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">
                    {`<Label direction={direction}
  data={{ icon: 'nest_eco_leaf', text: 'Eco-Friendly', ariaDescription: '...' }}
  iconSize="lg"
  className="text-primary"
/>`}
                  </code>
                </pre>
              </div>
            </div>

            {/* Header Component */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">Header</h3>
              <p className="mb-6 text-text-secondary-dark">
                Composite header with title Label, optional subtitle Label, and alignment. Used for section headers.
              </p>
              <div className="space-y-8">
                <Header
                  direction={direction}
                  data={{
                    alignment: AlignmentEnum.LANGUAGE_DIRECTION,
                    promoteHeaderIcon: false,
                    header: {
                      icon: 'nest_eco_leaf',
                      text: 'Sustainable Products',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: 'Sustainable products section',
                    },
                    subheader: {
                      text: 'Discover eco-friendly alternatives for everyday life',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: 'Section subtitle',
                    },
                  }}
                  level={3}
                />
                <Header
                  direction={direction}
                  data={{
                    alignment: AlignmentEnum.CENTER,
                    promoteHeaderIcon: false,
                    header: {
                      icon: 'star',
                      text: 'Featured Collection',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: 'Featured section',
                    },
                  }}
                  level={3}
                />
              </div>
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">
                    {`<Header direction={direction}
  data={{
    alignment: AlignmentEnum.CENTER,
        promoteHeaderIcon: false,
    header: { icon: 'nest_eco_leaf', text: 'Title', ariaDescription: '...' },
    subheader: { text: 'Subtitle', ariaDescription: '...' }
  }}
  level={3}
/>`}
                  </code>
                </pre>
              </div>
            </div>

            {/* Button Component */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">Button</h3>
              <p className="mb-6 text-text-secondary-dark">
                CMS-driven button/link with multiple variants and sizes. Composites Icon + Text.
              </p>

              <div className="space-y-8">
                {/* Variants */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-white">Variants</h4>
                  <div className="flex flex-wrap gap-4">
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Primary Button',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Primary action',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="primary"
                    />
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Secondary Button',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Secondary action',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="secondary"
                    />
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Outline Button',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Outline button',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="outline"
                    />
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Ghost Button',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Ghost button',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="ghost-1"
                    />
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Ghost 2 Button',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Ghost 2 button',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="ghost-2"
                    />
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Ghost 3 Button',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Ghost 3 button',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="ghost-3"
                    />
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Link Button',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Link button',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="link-1"
                    />
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Secondary Link',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Secondary link button',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="link-2"
                    />
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-white">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-4">
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Small',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Small button',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="primary"
                      size="sm"
                    />
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Medium',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Medium button',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="primary"
                      size="md"
                    />
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Large',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Large button',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="primary"
                      size="lg"
                    />
                  </div>
                </div>

                {/* With Icons */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-white">With Icons</h4>
                  <div className="flex flex-wrap gap-4">
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          icon: 'nest_eco_leaf',
                          text: 'Shop Eco-Friendly',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Shop eco-friendly products',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="primary"
                      size="lg"
                    />
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          icon: 'arrow_forward',
                          text: 'Learn More',
                          iconPosition: IconPositionEnum.AFTER_TEXT,
                          ariaDescription: 'Learn more',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="outline"
                    />
                  </div>
                </div>

                {/* States */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-white">States</h4>
                  <div className="flex flex-wrap gap-4">
                    <ButtonLink
                      direction={direction}
                      data={{
                        label: {
                          text: 'Normal',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Normal state',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="primary"
                    />
                    <ButtonAction
                      direction={direction}
                      data={{
                        label: {
                          text: 'Disabled',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Disabled state',
                        },
                        url: '#',
                        openInNewTab: false,
                      }}
                      variant="primary"
                      disabled
                      onClick={() => {
                        // Disabled button needs a handler to satisfy type
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">
                    {`<ButtonLink direction={direction}
  data={{
    label: {
      icon: 'nest_eco_leaf',
      text: 'Shop Eco-Friendly',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: '...'
    },
    url: '/products',
    openInNewTab: false,
  }}
  variant="primary"
  size="lg"
/>`}
                  </code>
                </pre>
              </div>
            </div>

            {/* TextBlock Component */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">TextBlock</h3>
              <p className="mb-6 text-text-secondary-dark">
                Rich text block with optional Header. Supports HTML formatting from CMS. Uses Header + HTML content.
              </p>
              <TextBlock
                direction={direction}
                data={{
                  __component: 'elements.text-block',
                  header: {
                    alignment: AlignmentEnum.LANGUAGE_DIRECTION,
                    promoteHeaderIcon: false,
                    header: {
                      icon: 'info',
                      text: 'About TheGreenBrother',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: 'About section',
                    },
                  },
                  content:
                    '<p>TheGreenBrother is your trusted source for <strong>sustainable</strong> and <em>eco-friendly</em> products. We carefully curate items that help you reduce your environmental impact while maintaining quality and style.</p><ul><li>100% sustainable materials</li><li>Ethically sourced products</li><li>Carbon-neutral shipping</li></ul>',
                }}
              />
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">
                    {`<TextBlock direction={direction}
  data={{
    __component: 'elements.text-block',
    header: { alignment: '...', header: {...} },
    content: '<p>Rich HTML content...</p>'
  }}
/>`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* BlogCard Component Section */}
        <section
          id="blog-card"
          className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16"
        >
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 space-y-12">
            <div>
              <h2 className="mb-4 text-4xl font-bold text-white">BlogCard Component</h2>
              <p className="text-lg text-text-secondary-dark">
                Specialized card for blog posts. Wraps the Card component with blog-specific features like tags, read
                time, and author info.
              </p>
            </div>

            {/* BlogCard Variants */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">Layouts, Widths & Sizes</h3>
              <p className="mb-6 text-text-secondary-dark">BlogCard supports all Card layouts, widths, and sizes.</p>
              <div className="space-y-12">
                {(['ltr', 'rtl', 'ttb', 'btt'] as const).map(layout => (
                  <div key={layout} className="space-y-8">
                    <h4 className="border-b border-white/10 pb-2 text-xl font-bold tracking-wider text-white uppercase">
                      Layout: {layout.toUpperCase()}
                    </h4>
                    {(['fixed', 'full', 'fit'] as const).map(width => (
                      <div key={`${layout}-${width}`}>
                        <h5 className="mb-4 text-lg font-semibold text-primary/80">Width: {width}</h5>
                        <div className="flex flex-col gap-6">
                          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
                            <div key={`${layout}-${width}-${size}`} className="flex flex-col gap-2">
                              <span className="font-mono text-xs text-tertiary-300">size=&quot;{size}&quot;</span>
                              <BlogCard
                                {...mockLabels}
                                direction={direction}
                                size={size}
                                layout={layout}
                                width={width}
                                post={
                                  {
                                    id: 1,
                                    documentId: `demo-${layout}-${width}-${size}`,
                                    slug: `demo-${layout}-${width}-${size}`,
                                    publishedAt: new Date().toISOString(),
                                    publishedDate: '2025-01-01',
                                    readTimeInMinutes: 5,
                                    tags: [
                                      {
                                        id: 1,
                                        documentId: 'tag-1',
                                        tagId: 'guide',
                                        publishedAt: new Date().toISOString(),
                                        tag: {
                                          text: 'Guide',
                                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                                          ariaDescription: 'Tag',
                                        },
                                        seoMetadata: {
                                          metaTitle: 'Guide',
                                          metaDescription: 'Guide tag',
                                        },
                                      },
                                    ],
                                    content: {
                                      header: {
                                        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
                                        promoteHeaderIcon: false,
                                        header: {
                                          text: 'Sustainable Living',
                                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                                          ariaDescription: 'Title',
                                        },
                                        subheader: {
                                          text: 'Greener lifestyle tips.',
                                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                                          ariaDescription: 'Subtitle',
                                        },
                                      },
                                    },
                                    readArticleLabel: {
                                      text: 'Read',
                                      iconPosition: IconPositionEnum.AFTER_TEXT,
                                      ariaDescription: 'Read article',
                                    },
                                    author: mockLabels.mockAuthor,
                                  } as unknown as ApiBlogPostBlogPostDocument
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ProductCard Component Section */}
        <section
          id="product-card"
          className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16"
        >
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 space-y-12">
            <div>
              <h2 className="mb-4 text-4xl font-bold text-white">ProductCard Component</h2>
              <p className="text-lg text-text-secondary-dark">
                Specialized card for products. Wraps the Card component with product-specific details like price,
                wishlist button, and tags.
              </p>
            </div>

            {/* ProductCard Variants */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">Layouts, Widths & Sizes</h3>
              <p className="mb-6 text-text-secondary-dark">ProductCard supports all Card layouts, widths, and sizes.</p>
              <div className="space-y-12">
                {(['ltr', 'rtl', 'ttb', 'btt'] as const).map(layout => (
                  <div key={layout} className="space-y-8">
                    <h4 className="border-b border-white/10 pb-2 text-xl font-bold tracking-wider text-white uppercase">
                      Layout: {layout.toUpperCase()}
                    </h4>
                    {(['fixed', 'full', 'fit'] as const).map(width => (
                      <div key={`${layout}-${width}`}>
                        <h5 className="mb-4 text-lg font-semibold text-primary/80">Width: {width}</h5>
                        <div className="flex flex-col gap-6">
                          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
                            <div key={`${layout}-${width}-${size}`} className="flex flex-col gap-2">
                              <span className="font-mono text-xs text-tertiary-300">size=&quot;{size}&quot;</span>
                              <ProductCard
                                direction={direction}
                                size={size}
                                layout={layout}
                                width={width}
                                enableUserProfile={true}
                                product={
                                  {
                                    id: 1,
                                    documentId: `prod-${layout}-${width}-${size}`,
                                    slug: `prod-${layout}-${width}-${size}`,
                                    name: 'Eco Product',
                                    prices: [
                                      {
                                        id: 1,
                                        amount: 29.99,
                                        currency: { symbol: '$', code: 'USD' },
                                      },
                                    ],
                                    publishedAt: '2025-01-01',
                                    images: [
                                      {
                                        documentId: 'placeholder',
                                        url: '/images/placeholder.svg',
                                        mime: 'image/svg+xml',
                                        width: 100,
                                        height: 100,
                                      },
                                    ],
                                    tags: [
                                      {
                                        id: 1,
                                        tag: {
                                          text: 'New',
                                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                                        },
                                      },
                                    ],
                                    header: {
                                      header: {
                                        text: 'Eco Bottle',
                                        iconPosition: IconPositionEnum.BEFORE_TEXT,
                                      },
                                    },
                                    viewDetailsLabel: {
                                      text: 'View',
                                      iconPosition: IconPositionEnum.AFTER_TEXT,
                                    },
                                    seoMetadata: {
                                      metaTitle: 'Eco Product',
                                      metaDescription: 'Eco Product description',
                                    },
                                    seller: {
                                      documentId: 'seller-1',
                                    },
                                  } as unknown as ApiProductProductDocument
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ContributorCard Component Section */}
        <section
          id="contributor-card"
          className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16"
        >
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 space-y-12">
            <div>
              <h2 className="mb-4 text-4xl font-bold text-white">ContributorCard Component</h2>
              <p className="text-lg text-text-secondary-dark">
                Specialized card for team profiles. Handles contributor data from CMS.
              </p>
            </div>

            {/* Common Usage Patterns */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">Common Usage Patterns</h3>
              <p className="mb-6 text-text-secondary-dark">
                Real-world examples of how ContributorCard is used throughout the site.
              </p>

              <div className="space-y-12">
                {/* Team Section Pattern */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 text-xl font-bold tracking-wider text-white uppercase">
                    Team Section (Carousel)
                  </h4>
                  <p className="text-sm text-text-secondary-dark">
                    Used in TeamSection.tsx - Default vertical layout with fixed width for carousel display.
                  </p>
                  <div className="flex gap-6 overflow-x-auto pb-4">
                    {(
                      [
                        {
                          ...mockLabels.mockAuthor,
                          firstName: 'Sarah',
                          lastName: 'Green',
                          bio: 'Passionate about sustainable living and eco-friendly products.',
                          roles: [{ documentId: 'role-1', id: 1, name: 'Founder', roleId: 1, publishedAt: '' }],
                        },
                        {
                          ...mockLabels.mockAuthor,
                          documentId: 'contributor-2',
                          firstName: 'Mike',
                          lastName: 'Rivers',
                          bio: 'Expert in renewable energy and green technology solutions.',
                          roles: [{ documentId: 'role-2', id: 2, name: 'CTO', roleId: 2, publishedAt: '' }],
                        },
                        {
                          ...mockLabels.mockAuthor,
                          documentId: 'contributor-3',
                          firstName: 'Emma',
                          lastName: 'Woods',
                          bio: 'Dedicated to reducing carbon footprint through innovative design.',
                          roles: [{ documentId: 'role-3', id: 3, name: 'Designer', roleId: 3, publishedAt: '' }],
                        },
                      ] as unknown as ApiContributorContributorDocument[]
                    ).map(member => (
                      <ContributorCard
                        key={member.documentId}
                        direction={direction}
                        size="md"
                        layout="ttb"
                        width="fixed"
                        member={member}
                      />
                    ))}
                  </div>
                  <div className="rounded-xl bg-surface-dark p-4">
                    <pre className="overflow-x-auto text-xs">
                      <code className="text-tertiary-300">
                        {`<ContributorCard
  direction={direction}
  size="md"          // Default team card size
  layout="ttb"       // Top-to-bottom (vertical)
  width="fixed"      // Fixed width for carousel
  member={contributor}
/>`}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Blog Author Bio Pattern */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 text-xl font-bold tracking-wider text-white uppercase">
                    Blog Author Bio
                  </h4>
                  <p className="text-sm text-text-secondary-dark">
                    Used in BlogPostClient.tsx - Compact horizontal layout for author bios at the end of articles.
                  </p>
                  <div className="max-w-2xl">
                    <ContributorCard
                      direction={direction}
                      size="xs"
                      layout="ltr"
                      width="full"
                      className="border-none! bg-transparent! p-0 shadow-none!"
                      member={{
                        ...mockLabels.mockAuthor,
                        firstName: 'John',
                        lastName: 'Doe',
                        bio: 'Environmental journalist with 10+ years covering sustainability topics.',
                        twitter: 'johndoe',
                        linkedin: 'johndoe',
                        roles: [],
                        seoMetadata: {
                          metaTitle: 'John Doe',
                          metaDescription: 'Author bio',
                        },
                      }}
                    />
                  </div>
                  <div className="rounded-xl bg-surface-dark p-4">
                    <pre className="overflow-x-auto text-xs">
                      <code className="text-tertiary-300">
                        {`<ContributorCard
  direction={direction}
  size="xs"          // Compact size
  layout="ltr"       // Left-to-right (horizontal)
  width="full"       // Full width
  className="border-none! bg-transparent! p-0 shadow-none!"
  member={contributor}
/>`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* All Layouts & Sizes Reference */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">All Layouts & Sizes</h3>
              <p className="mb-6 text-text-secondary-dark">Complete reference of all layout and size combinations.</p>
              <div className="space-y-12">
                {(['ltr', 'rtl', 'ttb', 'btt'] as const).map(layout => (
                  <div key={layout} className="space-y-8">
                    <h4 className="border-b border-white/10 pb-2 text-xl font-bold tracking-wider text-white uppercase">
                      Layout: {layout.toUpperCase()}
                    </h4>
                    {(['fixed', 'full', 'fit'] as const).map(width => (
                      <div key={`${layout}-${width}`}>
                        <h5 className="mb-4 text-lg font-semibold text-primary/80">Width: {width}</h5>
                        <div className="flex flex-col gap-6">
                          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
                            <div key={`${layout}-${width}-${size}`} className="flex flex-col gap-2">
                              <span className="font-mono text-xs text-tertiary-300">size=&quot;{size}&quot;</span>
                              <ContributorCard
                                direction={direction}
                                size={size}
                                layout={layout}
                                width={width}
                                member={{
                                  ...mockLabels.mockAuthor,
                                  seoMetadata: {
                                    metaTitle: 'John Doe',
                                    metaDescription: 'Author bio',
                                  },
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Components Section */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16">
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 space-y-12">
            <div>
              <h2 className="mb-4 text-4xl font-bold text-white">Interactive Components</h2>
              <p className="text-lg text-text-secondary-dark">
                Standalone interactive UI components with client-side functionality.
              </p>
            </div>

            {/* LanguageMenu */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">LanguageMenu</h3>
              <p className="mb-6 text-text-secondary-dark">
                Language switcher dropdown. Detects current language from URL and navigates to selected language.
              </p>
              <div className="flex justify-center rounded-xl border border-white/10 bg-surface-dark p-8">
                <LanguageMenu
                  data={{
                    menuButton: {
                      label: {
                        icon: 'language',
                        text: 'Language',
                        iconPosition: IconPositionEnum.BEFORE_TEXT,
                        ariaDescription: 'Select language',
                      },
                      url: '#',
                      openInNewTab: false,
                    },
                  }}
                  languages={[
                    { name: 'English', flag: '🇬🇧', code: LanguageCode.EN },
                    { name: 'Italiano', flag: '🇮🇹', code: LanguageCode.IT },
                    { name: 'עברית', flag: '🇮🇱', code: LanguageCode.HE },
                  ]}
                  selectedLang={lang}
                  onLanguageChange={(code: LanguageCode) => {
                    console.log('Language changed to:', code)
                  }}
                  direction={direction}
                  showText={true}
                />
              </div>
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">{`<LanguageMenu
  data={{ menuButton: {...} }}
  languages={[...]}
  selectedLang="en"
  onLanguageChange={(code) => {...}}
/>`}</code>
                </pre>
              </div>
            </div>

            {/* ThemeMenu */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">ThemeMenu</h3>
              <p className="mb-6 text-text-secondary-dark">
                Theme toggle for dark/light mode. Currently dark mode only, but ready for light mode support.
              </p>
              <div className="flex justify-center rounded-xl border border-white/10 bg-surface-dark p-8">
                <ThemeMenu
                  data={{
                    menuButton: {
                      label: {
                        icon: 'palette',
                        text: 'Theme',
                        iconPosition: IconPositionEnum.BEFORE_TEXT,
                        ariaDescription: 'Select theme',
                      },
                      url: '#',
                      openInNewTab: false,
                    },
                    themes: [
                      {
                        id: 1,
                        documentId: 'dark-theme',
                        themeId: 'dark',
                        publishedAt: '2025-01-01T00:00:00.000Z',
                        content: {
                          icon: 'dark_mode',
                          text: 'Dark',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Dark theme',
                        },
                        seoMetadata: {
                          metaTitle: 'Dark',
                          metaDescription: 'Dark theme',
                        },
                      },
                      {
                        id: 2,
                        documentId: 'light-theme',
                        themeId: 'light',
                        publishedAt: '2025-01-01T00:00:00.000Z',
                        content: {
                          icon: 'light_mode',
                          text: 'Light',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Light theme',
                        },
                        seoMetadata: {
                          metaTitle: 'Light',
                          metaDescription: 'Light theme',
                        },
                      },
                      {
                        id: 3,
                        documentId: 'system-theme',
                        themeId: 'system',
                        publishedAt: '2025-01-01T00:00:00.000Z',
                        content: {
                          icon: 'computer',
                          text: 'System',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'System theme',
                        },
                        seoMetadata: {
                          metaTitle: 'System',
                          metaDescription: 'System theme',
                        },
                      },
                    ],
                  }}
                  selectedTheme="dark"
                  onThemeChange={theme => {
                    console.log('Theme changed to:', theme)
                  }}
                  direction={direction}
                />
              </div>
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">{`<ThemeMenu
  data={{ menuButton: {...}, themes: [...] }}
  selectedTheme="Dark"
  onThemeChange={(theme) => {...}}
/>`}</code>
                </pre>
              </div>
            </div>

            {/* SearchMenu */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">SearchMenu</h3>
              <p className="mb-6 text-text-secondary-dark">
                Expandable search input with recent/trending search suggestions.
              </p>
              <div className="flex justify-center rounded-xl border border-white/10 bg-surface-dark p-8">
                <SearchMenu
                  direction={direction}
                  navWidth={1200}
                  data={{
                    menuButton: {
                      label: {
                        icon: 'search',
                        text: 'Search',
                        iconPosition: IconPositionEnum.BEFORE_TEXT,
                        ariaDescription: 'Open search',
                      },
                      url: '#',
                      openInNewTab: false,
                    },
                    textBoxPlaceholderLabel: {
                      icon: 'search',
                      text: 'Search for products...',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: 'Search input',
                    },
                    recentSearchesLabel: {
                      icon: 'history',
                      text: 'Recent Searches',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: 'Recent searches',
                    },
                    nowTrendingLabel: {
                      icon: 'trending_up',
                      text: 'Now Trending',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: 'Trending searches',
                    },
                    viewAllResultsButton: {
                      label: {
                        icon: 'arrow_forward',
                        text: 'View all results for',
                        iconPosition: IconPositionEnum.AFTER_TEXT,
                        ariaDescription: 'View all search results',
                      },
                      url: '/products',
                      openInNewTab: false,
                    },
                  }}
                />
              </div>
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">{`<SearchMenu
  data={{
    menuButton: {...},
    textBoxPlaceholderLabel: {...},
    recentSearchesLabel: {...},
    nowTrendingLabel: {...},
    viewAllResultsButton: {...}
  }}
/>`}</code>
                </pre>
              </div>
            </div>

            {/* ProductCategoriesMenu */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">ProductCategoriesMenu</h3>
              <p className="mb-6 text-text-secondary-dark">
                Dropdown menu displaying product category cards with images. Hover to see the dropdown.
              </p>
              <div className="flex justify-center rounded-xl border border-white/10 bg-surface-dark p-8">
                <div className="relative">
                  <ProductCategoriesMenu
                    data={{
                      menuButton: {
                        label: {
                          icon: 'category',
                          text: 'Products',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Browse product categories',
                        },
                        url: '/products',
                        openInNewTab: false,
                      },
                      productCategories: [
                        {
                          id: 1,
                          documentId: 'home-garden',
                          publishedAt: new Date().toISOString(),
                          slug: 'home-garden',
                          content: {
                            icon: 'home',
                            text: 'Home & Garden',
                            iconPosition: IconPositionEnum.BEFORE_TEXT,
                            ariaDescription: 'Home and garden products',
                          },
                          image: {
                            documentId: 'img-1',
                            id: 1,
                            name: 'home-garden.jpg',
                            hash: 'home_garden_123',
                            mime: 'image/jpeg',
                            size: 100,
                            url: '/uploads/home-garden.jpg',
                            provider: 'local',
                            publishedAt: new Date().toISOString(),
                          },
                          seoMetadata: { metaTitle: 'Home', metaDescription: 'Home' },
                        },
                        {
                          id: 2,
                          documentId: 'personal-care',
                          publishedAt: new Date().toISOString(),
                          slug: 'personal-care',
                          content: {
                            icon: 'spa',
                            text: 'Personal Care',
                            iconPosition: IconPositionEnum.BEFORE_TEXT,
                            ariaDescription: 'Personal care products',
                          },
                          image: {
                            documentId: 'img-2',
                            id: 2,
                            name: 'personal-care.jpg',
                            hash: 'personal_care_123',
                            mime: 'image/jpeg',
                            size: 100,
                            url: '/uploads/personal-care.jpg',
                            provider: 'local',
                            publishedAt: new Date().toISOString(),
                          },
                          seoMetadata: { metaTitle: 'Personal Care', metaDescription: 'Personal Care' },
                        },
                        {
                          id: 3,
                          documentId: 'kitchen',
                          publishedAt: new Date().toISOString(),
                          slug: 'kitchen',
                          content: {
                            icon: 'kitchen',
                            text: 'Kitchen',
                            iconPosition: IconPositionEnum.BEFORE_TEXT,
                            ariaDescription: 'Kitchen products',
                          },
                          image: {
                            documentId: 'img-3',
                            id: 3,
                            name: 'kitchen.jpg',
                            hash: 'kitchen_123',
                            mime: 'image/jpeg',
                            size: 100,
                            url: '/uploads/kitchen.jpg',
                            provider: 'local',
                            publishedAt: new Date().toISOString(),
                          },
                          seoMetadata: { metaTitle: 'Kitchen', metaDescription: 'Kitchen' },
                        },
                        {
                          id: 4,
                          documentId: 'outdoor',
                          publishedAt: new Date().toISOString(),
                          slug: 'outdoor',
                          content: {
                            icon: 'nature',
                            text: 'Outdoor',
                            iconPosition: IconPositionEnum.BEFORE_TEXT,
                            ariaDescription: 'Outdoor products',
                          },
                          image: {
                            documentId: 'img-4',
                            id: 4,
                            name: 'outdoor.jpg',
                            hash: 'outdoor_123',
                            mime: 'image/jpeg',
                            size: 100,
                            url: '/uploads/outdoor.jpg',
                            provider: 'local',
                            publishedAt: new Date().toISOString(),
                          },
                          seoMetadata: { metaTitle: 'Outdoor', metaDescription: 'Outdoor' },
                        },
                      ],
                    }}
                    isActive={false}
                    direction={direction}
                  />
                </div>
              </div>
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">{`<ProductCategoriesMenu
  data={{
    menuButton: { label: {...}, url: '/products' },
    productCategories: [...categories]
  }}
  isActive={false}
/>`}</code>
                </pre>
              </div>
            </div>

            {/* BackToTopButton */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">BackToTopButton</h3>
              <p className="mb-6 text-text-secondary-dark">
                Floating button that appears on scroll. Smoothly scrolls to top when clicked.
              </p>
              <div className="flex justify-center rounded-xl border border-white/10 bg-surface-dark p-8">
                <BackToTopButton />
              </div>
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">{`<BackToTopButton />`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Section Components - Working Demos */}
        <section
          id="section-components"
          className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16"
        >
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 space-y-12">
            <div>
              <h2 className="mb-4 text-4xl font-bold text-white">Section Components</h2>
              <p className="text-lg text-text-secondary-dark">
                Page-level sections that compose primitives and elements. These are used on homepage and content pages.
              </p>
            </div>

            {/* HeroSection Demo */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">HeroSection</h3>
              <p className="mb-6 text-text-secondary-dark">
                Hero banner with background image, header, subheader, and optional CTA button. Supports two variants.
              </p>

              {/* Variant 1: TEXT_OVER_BACKGROUND with button */}
              <div className="mb-8">
                <h4 className="mb-4 text-lg font-medium text-white">Variant: TEXT_OVER_BACKGROUND (with button)</h4>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <HeroSection
                    direction={direction}
                    data={{
                      __component: 'sections.hero',
                      id: 1,
                      variant: VariantEnum.TEXT_OVER_BACKGROUND,
                      image: {
                        documentId: 'placeholder',
                        id: 0,
                        name: 'placeholder.svg',
                        hash: 'placeholder',
                        mime: 'image/svg+xml',
                        size: 1024,
                        url: '/images/placeholder.svg',
                        provider: 'local',
                        publishedAt: new Date().toISOString(),
                      },
                      header: {
                        alignment: AlignmentEnum.CENTER,
                        promoteHeaderIcon: false,
                        header: {
                          icon: 'eco',
                          text: 'Text **Over** Background',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Hero with overlay',
                        },
                        subheader: {
                          text: 'Gradient overlay dims the background image',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Subtitle',
                        },
                      },
                      exploreButton: {
                        label: {
                          icon: 'arrow_downward',
                          text: 'Explore',
                          iconPosition: IconPositionEnum.AFTER_TEXT,
                          ariaDescription: 'Call to action',
                        },
                        url: '#',
                        openInNewTab: false,
                      },
                    }}
                  />
                </div>
              </div>

              {/* Variant 2: TEXT_ABOVE_BACKGROUND without button */}
              <div className="mb-6">
                <h4 className="mb-4 text-lg font-medium text-white">Variant: TEXT_ABOVE_BACKGROUND (no button)</h4>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <HeroSection
                    direction={direction}
                    data={{
                      __component: 'sections.hero',
                      id: 2,
                      variant: VariantEnum.TEXT_ABOVE_BACKGROUND,
                      image: {
                        documentId: 'placeholder',
                        id: 0,
                        name: 'placeholder.svg',
                        hash: 'placeholder',
                        mime: 'image/svg+xml',
                        size: 1024,
                        url: '/images/placeholder.svg',
                        provider: 'local',
                        publishedAt: new Date().toISOString(),
                      },
                      header: {
                        alignment: AlignmentEnum.CENTER,
                        promoteHeaderIcon: false,
                        header: {
                          icon: 'nature',
                          text: 'Text **Above** Background',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Hero without overlay',
                        },
                        subheader: {
                          text: 'No gradient overlay - full brightness image',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Subtitle',
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">{`<HeroSection
  direction={direction}
  data={{
    __component: 'sections.hero',
    variant: VariantEnum.TEXT_OVER_BACKGROUND, // or TEXT_ABOVE_BACKGROUND
    image: cmsImage,
    header: { alignment: AlignmentEnum.CENTER, header: {...}, subheader: {...} },
    exploreButton: { label: {...}, url: '/products' } // optional
  }}
/>`}</code>
                </pre>
              </div>
            </div>

            {/* BrandFeaturesSection Demo */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">BrandFeaturesSection</h3>
              <p className="mb-6 text-text-secondary-dark">
                Grid of feature cards highlighting brand values/benefits. Uses Label composite for feature items.
              </p>
              <div className="rounded-xl border border-white/10 bg-surface-dark p-6">
                <BrandFeaturesSection
                  direction={direction}
                  data={{
                    __component: 'sections.brand-features-section',
                    id: 1,
                    showHeader: true,
                    headerText: 'Why Choose **TheGreenBrother**?',
                    headerAriaDescription: 'Brand features section',
                    subheaderText: 'We are committed to sustainability and quality.',
                    learnMoreButtonText: 'Learn More',
                    learnMoreButtonUrl: '/about',
                    learnMoreButtonIcon: 'arrow_forward',
                    learnMoreButtonOpenInNewTab: false,
                    learnMoreButtonAriaDescription: 'Learn more about our mission',
                    features: [
                      {
                        id: 1,
                        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
                        promoteHeaderIcon: false,
                        header: {
                          icon: 'eco',
                          text: '100% Sustainable',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Sustainable products',
                        },
                        subheader: {
                          text: 'Every product is carefully vetted for environmental impact.',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Description',
                        },
                      },
                      {
                        id: 2,
                        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
                        promoteHeaderIcon: false,
                        header: {
                          icon: 'verified',
                          text: 'Quality Guaranteed',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Quality guarantee',
                        },
                        subheader: {
                          text: 'Premium materials that last longer and reduce waste.',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Description',
                        },
                      },
                      {
                        id: 3,
                        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
                        promoteHeaderIcon: false,
                        header: {
                          icon: 'local_shipping',
                          text: 'Carbon Neutral Shipping',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Carbon neutral shipping',
                        },
                        subheader: {
                          text: 'We offset 100% of shipping emissions.',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Description',
                        },
                      },
                      {
                        id: 4,
                        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
                        promoteHeaderIcon: false,
                        header: {
                          icon: 'recycling',
                          text: 'Recyclable Packaging',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Recyclable packaging',
                        },
                        subheader: {
                          text: 'All packaging is made from recycled materials.',
                          iconPosition: IconPositionEnum.BEFORE_TEXT,
                          ariaDescription: 'Description',
                        },
                      },
                    ] satisfies ElementsHeaderEntry[],
                  }}
                />
              </div>
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">{`<BrandFeaturesSection direction={direction}
  data={{
    __component: 'sections.brand-features-section',
    headerText: 'Why Choose **TheGreenBrother**?',
    features: [{ header: {...}, subheader: {...} }, ...]
  }}
/>`}</code>
                </pre>
              </div>
            </div>

            {/* NewsletterSignupCTA Demo */}
            <div className="rounded-xl border border-white/5 bg-background-dark p-8">
              <h3 className="mb-6 text-2xl font-semibold text-white">NewsletterSignupCTA</h3>
              <p className="mb-6 text-text-secondary-dark">
                Newsletter signup form with title, description, email input, and submit button.
              </p>
              <div className="rounded-xl border border-white/10 bg-surface-dark">
                <NewsletterSignupCTA
                  direction={direction}
                  data={{
                    __component: 'call-to-actions.newsletter-signup-cta',
                    id: 1,
                    title: 'Join Our **Eco** Community',
                    description: 'Get exclusive deals and sustainability tips delivered to your inbox.',
                    emailPlaceholder: {
                      text: 'Enter your email',
                      iconPosition: IconPositionEnum.BEFORE_TEXT,
                      ariaDescription: 'Email address input',
                    },
                    submitButton: {
                      label: {
                        icon: 'send',
                        text: 'Subscribe',
                        iconPosition: IconPositionEnum.BEFORE_TEXT,
                        ariaDescription: 'Subscribe to newsletter',
                      },
                      url: '#',
                      openInNewTab: false,
                    },
                  }}
                />
              </div>
              <div className="mt-6 rounded-xl bg-surface-dark p-4">
                <pre className="overflow-x-auto text-xs">
                  <code className="text-tertiary-300">{`<NewsletterSignupCTA direction={direction}
  data={{
    __component: 'call-to-actions.newsletter-signup-cta',
    title: 'Join Our **Eco** Community',
    description: '...',
    emailPlaceholder: { text: 'Enter your email', ... },
    submitButton: { label: {...}, url: '#' }
  }}
/>`}</code>
                </pre>
              </div>
            </div>

            {/* CMS-Only Components Note */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <h3 className="mb-4 text-xl font-bold text-white">CMS-Driven Sections</h3>
              <p className="mb-4 text-text-secondary-dark">
                The following sections require product/blog data from CMS and are best viewed on actual pages:
              </p>
              <ul className="list-inside list-disc space-y-2 text-text-secondary-dark">
                <li>
                  <strong className="text-white">FeaturedProductsSection:</strong> Product carousel (requires products
                  array)
                </li>
                <li>
                  <strong className="text-white">ProductCategoriesSection:</strong> Category grid (requires categories
                  array)
                </li>
                <li>
                  <strong className="text-white">BlogTeaserSection:</strong> Blog previews (requires blogPosts array)
                </li>
              </ul>
              <p className="mt-4 text-white">
                <strong>💡 Tip:</strong> Visit the{' '}
                <a href={`/${lang}`} className="underline hover:text-primary-hover">
                  TheGreenBrother homepage
                </a>{' '}
                to see these components with real CMS content.
              </p>
            </div>
          </div>
        </section>

        {/* Layout Components Note */}
        <section className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-8 md:p-16">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10">
            <h2 className="mb-6 text-4xl font-bold text-white">Layout Components</h2>
            <p className="mb-6 text-lg text-white">
              Complex layout components that require CMS data. These are visible throughout the TheGreenBrother site.
            </p>

            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-3 text-xl font-bold text-white">Navigation</h3>
                <p className="mb-4 text-text-secondary-dark">
                  Site header with logo, navigation links, language/theme menus, and mobile menu. Requires CMS
                  navigation data.
                </p>
                <ul className="list-inside list-disc space-y-2 text-text-secondary-dark">
                  <li>Responsive design with mobile hamburger menu</li>
                  <li>Integrates LanguageMenu and ThemeMenu</li>
                  <li>Active link highlighting</li>
                  <li>Sticky header on scroll</li>
                </ul>
              </div>

              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-3 text-xl font-bold text-white">Footer</h3>
                <p className="mb-4 text-text-secondary-dark">
                  Site footer with multiple columns, newsletter signup, and social links. Requires CMS footer data.
                </p>
                <ul className="list-inside list-disc space-y-2 text-text-secondary-dark">
                  <li>Multi-column layout (brand, links, newsletter)</li>
                  <li>Newsletter subscription form</li>
                  <li>Social media links</li>
                  <li>Copyright notice</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-primary/40 bg-primary/10 p-6">
              <p className="text-white">
                <strong>💡 Tip:</strong> To see these components in action, visit the{' '}
                <a href={`/${lang}`} className="underline hover:text-primary-hover">
                  TheGreenBrother homepage
                </a>{' '}
                where they are used with real CMS content.
              </p>
            </div>
          </div>
        </section>

        {/* Design Patterns Section */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16">
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 space-y-8">
            <h2 className="mb-4 text-4xl font-bold text-white">Design Patterns</h2>

            {/* Rounded Corners */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-white">Rounded Corners</h3>
              <p className="mb-6 text-text-secondary-dark">
                Simplified to two values: <code className="rounded-xl bg-surface-dark px-2 py-1">rounded-xl</code> for
                UI elements and <code className="rounded-full bg-surface-dark px-2 py-1">rounded-full</code> for
                circles.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { name: 'rounded-xl', label: 'XL (2rem / 32px)', desc: 'Cards, sections, inputs' },
                  { name: 'rounded-full', label: 'Full (9999px)', desc: 'Avatars, pills, circular buttons' },
                ].map(radius => (
                  <div key={radius.label} className="text-center">
                    <div
                      className={`${radius.name} h-24 w-full border border-white/10 bg-primary shadow-lg shadow-primary/20`}
                    />
                    <p className="mt-4 font-mono text-sm text-white">{radius.name}</p>
                    <p className="text-xs text-text-secondary-dark">{radius.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shadows */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-white">Shadows</h3>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                {[
                  { name: 'shadow-lg', label: 'Large' },
                  { name: 'shadow-xl', label: 'XL' },
                  { name: 'shadow-2xl', label: '2XL' },
                ].map(shadow => (
                  <div key={shadow.name} className="rounded-xl border border-white/5 bg-surface-dark p-6 text-center">
                    <div className={`${shadow.name} h-24 rounded-xl bg-primary`} />
                    <p className="mt-4 font-mono text-sm text-text-secondary-dark">{shadow.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Consent Components */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16">
          <div className="mb-8">
            <h2 className="mb-4 text-4xl font-bold text-white">Consent Components</h2>
            <p className="text-text-secondary-dark">
              GDPR consent components for cookie management and consent gating.
            </p>
          </div>

          <div className="space-y-8">
            {/* CookieConsentBanner note */}
            <div>
              <h3 className="mb-4 text-2xl font-semibold text-white">CookieConsentBanner</h3>
              <p className="text-text-secondary-dark">
                The CookieConsentBanner is a layout-level component mounted in the root layout. It requires CMS API
                calls and full consent state. See{' '}
                <code className="rounded-sm bg-surface-dark px-2 py-1">src/app/[lang]/layout.tsx</code> for its usage.
              </p>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-8 md:p-16">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 space-y-8">
            <h2 className="mb-4 text-4xl font-bold text-white">Usage Guidelines</h2>

            <div className="space-y-6">
              {/* CMS-Driven */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                <h3 className="mb-4 text-2xl font-bold text-white">CMS-Driven Components</h3>
                <p className="mb-4 text-text-secondary-dark">
                  All TheGreenBrother components are CMS-driven, meaning their content comes from Strapi through the
                  backend API.
                </p>
                <ul className="list-inside list-disc space-y-2 text-text-secondary-dark">
                  <li>Content can be updated without code changes</li>
                  <li>Multi-language support is built-in</li>
                  <li>Consistency across all pages</li>
                  <li>No hardcoded strings (violates No Fallback Strings Principle)</li>
                </ul>
              </div>

              {/* Component Hierarchy */}
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 text-2xl font-bold text-white">Component Hierarchy</h3>
                <ol className="list-inside list-decimal space-y-2 text-text-secondary-dark">
                  <li>
                    <strong className="text-white">Primitives:</strong> Text, Icon, Image - Direct 1:1 mapping to Strapi
                    fields
                  </li>
                  <li>
                    <strong className="text-white">Elements:</strong> Label, Button, Header, TextBlock - Composite
                    components from Strapi
                  </li>
                  <li>
                    <strong className="text-white">Sections:</strong> HeroSection, ProductCategoriesSection, etc. -
                    Page-level sections
                  </li>
                  <li>
                    <strong className="text-white">Layouts:</strong> Navigation, Footer - Full layout components
                  </li>
                </ol>
              </div>

              {/* Theme-First Styling */}
              <div className="rounded-xl border border-white/10 bg-background-dark p-6">
                <h3 className="mb-4 text-2xl font-bold text-white">Theme-First Styling</h3>
                <p className="mb-4 text-text-secondary-dark">
                  TheGreenBrother follows the <strong className="text-white">Theme-First Styling</strong> principle:
                </p>
                <ul className="list-inside list-disc space-y-2 text-text-secondary-dark">
                  <li>
                    <strong className="text-white">FORBIDDEN:</strong> Hardcoded color values (hex, rgb, hsl)
                  </li>
                  <li>
                    <strong className="text-white">MANDATORY:</strong> Use theme variables from{' '}
                    <code className="rounded-sm bg-surface-dark px-2 py-1">src/styles/theme.css</code>
                  </li>
                  <li>All colors defined as CSS custom properties</li>
                  <li>Supports automatic light/dark mode switching</li>
                  <li>WCAG AA accessibility compliance built-in</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageClient>
  )
}
