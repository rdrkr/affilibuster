// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Dropdown } from '@/components/Dropdown'
import { Checkbox } from '@/components/Checkbox'
import { Radio } from '@/components/Radio'
import { Hero } from '@/components/Hero'
import type { LanguageCode } from '@/lib/types'

interface StyleGuideClientProps {
  lang: LanguageCode
}

/**
 * Style Guide Client Component - Interactive UI showcase.
 * This is a client component that displays all design tokens and reusable components.
 *
 * @param props - Component props
 * @returns The style guide client component
 */
export default function StyleGuideClient({ lang }: StyleGuideClientProps): React.ReactElement {
  const [selectedOption, setSelectedOption] = useState('option1')
  const [checkboxValue1, setCheckboxValue1] = useState(false)
  const [checkboxValue2, setCheckboxValue2] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <Hero
        title="Affilibuster **Style Guide**"
        subtitle="Design system reference for consistent UI development"
        size="medium"
      >
        <p className="text-sm text-primary-200 mt-2">Language: {lang.toUpperCase()}</p>
      </Hero>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Design Tokens Section */}
        <section id="colors">
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 border-b-4 border-primary-400 pb-4">
            Color Palette
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
            Based on Catppuccin Mocha theme. All colors support dark mode.
          </p>

          {/* Primary Colors */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Primary (Green)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                <div key={shade} className="space-y-2">
                  <div
                    className="h-20 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    style={{
                      backgroundColor: `var(--color-primary-${String(shade)})`,
                    }}
                  />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{shade}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">primary-{shade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Colors */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Secondary (Peach)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                <div key={shade} className="space-y-2">
                  <div
                    className="h-20 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    style={{
                      backgroundColor: `var(--color-secondary-${String(shade)})`,
                    }}
                  />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{shade}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">secondary-{shade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tertiary Colors */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Tertiary (Teal)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                <div key={shade} className="space-y-2">
                  <div
                    className="h-20 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    style={{
                      backgroundColor: `var(--color-tertiary-${String(shade)})`,
                    }}
                  />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{shade}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">tertiary-{shade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Semantic Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Success', color: 'success', main: 400 },
                { name: 'Error', color: 'error', main: 400 },
                { name: 'Warning', color: 'warning', main: 400 },
                { name: 'Neutral', color: 'neutral', main: 400 },
              ].map(semantic => (
                <div key={semantic.name} className="space-y-2">
                  <div
                    className="h-24 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    style={{
                      backgroundColor: `var(--color-${semantic.color}-${String(semantic.main)})`,
                    }}
                  />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">{semantic.name}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {semantic.color}-{semantic.main}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section id="typography">
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 border-b-4 border-secondary-400 pb-4">
            Typography
          </h2>

          <div className="space-y-8">
            {/* Headings */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">Headings</h3>
              <div className="space-y-4 bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div>
                  <h1 className="text-6xl font-bold text-neutral-800 dark:text-neutral-100">Heading 1</h1>
                  <code className="text-sm text-neutral-500 dark:text-neutral-400">text-6xl font-bold</code>
                </div>
                <div>
                  <h2 className="text-5xl font-bold text-neutral-800 dark:text-neutral-100">Heading 2</h2>
                  <code className="text-sm text-neutral-500 dark:text-neutral-400">text-5xl font-bold</code>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100">Heading 3</h3>
                  <code className="text-sm text-neutral-500 dark:text-neutral-400">text-4xl font-bold</code>
                </div>
                <div>
                  <h4 className="text-3xl font-semibold text-neutral-800 dark:text-neutral-100">Heading 4</h4>
                  <code className="text-sm text-neutral-500 dark:text-neutral-400">text-3xl font-semibold</code>
                </div>
                <div>
                  <h5 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Heading 5</h5>
                  <code className="text-sm text-neutral-500 dark:text-neutral-400">text-2xl font-semibold</code>
                </div>
                <div>
                  <h6 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Heading 6</h6>
                  <code className="text-sm text-neutral-500 dark:text-neutral-400">text-xl font-semibold</code>
                </div>
              </div>
            </div>

            {/* Body Text */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">Body Text</h3>
              <div className="space-y-4 bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div>
                  <p className="text-lg text-neutral-700 dark:text-neutral-200">Large body text - text-lg</p>
                </div>
                <div>
                  <p className="text-base text-neutral-700 dark:text-neutral-200">
                    Regular body text - text-base (default)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">Small body text - text-sm</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Extra small text - text-xs</p>
                </div>
              </div>
            </div>

            {/* Font Weights */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">Font Weights</h3>
              <div className="space-y-4 bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">Bold - font-bold</p>
                <p className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Semibold - font-semibold</p>
                <p className="text-xl font-medium text-neutral-800 dark:text-neutral-100">Medium - font-medium</p>
                <p className="text-xl font-normal text-neutral-700 dark:text-neutral-200">Normal - font-normal</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section id="buttons">
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 border-b-4 border-tertiary-400 pb-4">
            Buttons
          </h2>

          {/* Button Variants */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">Variants</h3>
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-wrap gap-4 mb-6">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Button</Button>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-neutral-700 dark:text-neutral-300">
                    {`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>`}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Button Sizes */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">Sizes</h3>
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Button variant="primary" size="sm">
                  Small
                </Button>
                <Button variant="primary" size="md">
                  Medium
                </Button>
                <Button variant="primary" size="lg">
                  Large
                </Button>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-neutral-700 dark:text-neutral-300">
                    {`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Button States */}
          <div>
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">States</h3>
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-wrap gap-4 mb-6">
                <Button variant="primary">Normal</Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-neutral-700 dark:text-neutral-300">
                    {`<Button variant="primary">Normal</Button>
<Button variant="primary" disabled>Disabled</Button>`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section id="cards">
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 border-b-4 border-primary-400 pb-4">
            Cards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Default Card */}
            <div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Default Card</h3>
              <Card variant="default">
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Card Title</h4>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    This is a default card with standard styling and hover effects.
                  </p>
                </div>
              </Card>
              <div className="mt-4 bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                <pre className="text-xs overflow-x-auto">
                  <code className="text-neutral-700 dark:text-neutral-300">
                    {`<Card variant="default">
  <div className="p-6">
    <h4>Card Title</h4>
    <p>Card content...</p>
  </div>
</Card>`}
                  </code>
                </pre>
              </div>
            </div>

            {/* Product Card */}
            <div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Product Card</h3>
              <Card variant="product">
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Product Name</h4>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                    Product description with enhanced hover effects.
                  </p>
                  <div className="text-2xl font-bold text-primary-600">$99.99</div>
                </div>
              </Card>
              <div className="mt-4 bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                <pre className="text-xs overflow-x-auto">
                  <code className="text-neutral-700 dark:text-neutral-300">
                    {`<Card variant="product">
  <div className="p-6">
    <h4>Product Name</h4>
    <p>Description...</p>
  </div>
</Card>`}
                  </code>
                </pre>
              </div>
            </div>

            {/* Info Card */}
            <div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Info Card</h3>
              <Card variant="info">
                <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Information</h4>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Card with padding included, ideal for informational content.
                </p>
              </Card>
              <div className="mt-4 bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                <pre className="text-xs overflow-x-auto">
                  <code className="text-neutral-700 dark:text-neutral-300">
                    {`<Card variant="info">
  <h4>Information</h4>
  <p>Content...</p>
</Card>`}
                  </code>
                </pre>
              </div>
            </div>

            {/* Feature Card */}
            <div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Feature Card</h3>
              <Card variant="feature">
                <h4 className="text-lg font-semibold mb-2">Feature Highlight</h4>
                <p>Card with primary background and scale hover effect.</p>
              </Card>
              <div className="mt-4 bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                <pre className="text-xs overflow-x-auto">
                  <code className="text-neutral-700 dark:text-neutral-300">
                    {`<Card variant="feature">
  <h4>Feature</h4>
  <p>Content...</p>
</Card>`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements Section */}
        <section id="forms">
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 border-b-4 border-secondary-400 pb-4">
            Form Elements
          </h2>

          <div className="space-y-8">
            {/* Input Fields */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">Input Fields</h3>
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-6">
                <Input type="text" label="Text Input" placeholder="Enter text..." />
                <Input type="email" label="Email Input" placeholder="email@example.com" />
                <Input type="password" label="Password Input" placeholder="Enter password..." />
                <Textarea label="Textarea" placeholder="Enter longer text..." rows={4} />
                <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    <code className="text-neutral-700 dark:text-neutral-300">
                      {`<Input type="text" label="Text Input" placeholder="..." />
<Input type="email" label="Email Input" placeholder="..." />
<Textarea label="Textarea" placeholder="..." rows={4} />`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Select Dropdown */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">Dropdown</h3>
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-6">
                <Dropdown
                  label="Select Option"
                  value={selectedOption}
                  items={[
                    { value: 'option1', label: 'Option 1', description: 'First option' },
                    { value: 'option2', label: 'Option 2', description: 'Second option' },
                    { value: 'option3', label: 'Option 3', description: 'Third option' },
                  ]}
                  onChange={setSelectedOption}
                  placeholder="Select an option"
                />
                <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    <code className="text-neutral-700 dark:text-neutral-300">
                      {`<Dropdown
  label="Select Option"
  value={selectedOption}
  items={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
  onChange={setSelectedOption}
/>`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Checkboxes & Radio Buttons */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">
                Checkboxes & Radio Buttons
              </h3>
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Checkboxes</h4>
                  <Checkbox
                    label="Checkbox option 1"
                    checked={checkboxValue1}
                    onChange={e => {
                      setCheckboxValue1(e.target.checked)
                    }}
                  />
                  <Checkbox
                    label="Checkbox option 2"
                    checked={checkboxValue2}
                    onChange={e => {
                      setCheckboxValue2(e.target.checked)
                    }}
                  />
                </div>
                <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Radio Buttons</h4>
                  <Radio
                    name="radio-group"
                    value="option1"
                    label="Radio option 1"
                    checked={radioValue === 'option1'}
                    onChange={() => {
                      setRadioValue('option1')
                    }}
                  />
                  <Radio
                    name="radio-group"
                    value="option2"
                    label="Radio option 2"
                    checked={radioValue === 'option2'}
                    onChange={() => {
                      setRadioValue('option2')
                    }}
                  />
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    <code className="text-neutral-700 dark:text-neutral-300">
                      {`<Checkbox
  label="Checkbox option 1"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>

<Radio
  name="radio-group"
  value="option1"
  label="Radio option 1"
  checked={value === 'option1'}
  onChange={() => setValue('option1')}
/>`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Loading States Section */}
        <section id="loading">
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 border-b-4 border-tertiary-400 pb-4">
            Loading States
          </h2>

          <div className="space-y-8">
            {/* Skeleton Loaders */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">Skeleton Loaders</h3>
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-4">
                <div className="h-8 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded w-3/4" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded w-full" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded w-5/6" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded w-4/6" />
                <div className="mt-6 bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    <code className="text-neutral-700 dark:text-neutral-300">
                      {`<div className="h-8 bg-neutral-200 dark:bg-neutral-700
  animate-pulse rounded w-3/4" />`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Spinner */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">Spinner</h3>
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full animate-spin" />
                </div>
                <div className="mt-6 bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    <code className="text-neutral-700 dark:text-neutral-300">
                      {`<div className="w-12 h-12 border-4
  border-primary-200 dark:border-primary-800
  border-t-primary-600 rounded-full animate-spin" />`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <section id="spacing">
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 border-b-4 border-primary-400 pb-4">
            Spacing Scale
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
            Uses Tailwind&apos;s default spacing scale (0.25rem = 4px base unit)
          </p>

          <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div className="space-y-4">
              {[
                { size: '0', px: '0px', rem: '0rem' },
                { size: '1', px: '4px', rem: '0.25rem' },
                { size: '2', px: '8px', rem: '0.5rem' },
                { size: '3', px: '12px', rem: '0.75rem' },
                { size: '4', px: '16px', rem: '1rem' },
                { size: '6', px: '24px', rem: '1.5rem' },
                { size: '8', px: '32px', rem: '2rem' },
                { size: '12', px: '48px', rem: '3rem' },
                { size: '16', px: '64px', rem: '4rem' },
                { size: '24', px: '96px', rem: '6rem' },
              ].map(space => (
                <div key={space.size} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-semibold text-neutral-700 dark:text-neutral-300">{space.size}</div>
                  <div className="bg-primary-400 h-8" style={{ width: space.rem }} />
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {space.px} / {space.rem}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shadows Section */}
        <section id="shadows">
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 border-b-4 border-secondary-400 pb-4">
            Shadows
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'shadow-sm', label: 'Small' },
              { name: 'shadow', label: 'Default' },
              { name: 'shadow-md', label: 'Medium' },
              { name: 'shadow-lg', label: 'Large' },
              { name: 'shadow-xl', label: 'Extra Large' },
              { name: 'shadow-2xl', label: '2X Large' },
            ].map(shadow => (
              <div key={shadow.name}>
                <div
                  className={`bg-white dark:bg-neutral-800 p-8 rounded-xl ${shadow.name} h-32 flex items-center justify-center`}
                >
                  <p className="text-neutral-700 dark:text-neutral-300 font-semibold">{shadow.label}</p>
                </div>
                <p className="text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                  {shadow.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Border Radius Section */}
        <section id="radius">
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 border-b-4 border-tertiary-400 pb-4">
            Border Radius
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: 'rounded-none', label: 'None' },
              { name: 'rounded-sm', label: 'Small' },
              { name: 'rounded', label: 'Default' },
              { name: 'rounded-md', label: 'Medium' },
              { name: 'rounded-lg', label: 'Large' },
              { name: 'rounded-xl', label: 'Extra Large' },
              { name: 'rounded-2xl', label: '2X Large' },
              { name: 'rounded-full', label: 'Full' },
            ].map(radius => (
              <div key={radius.name} className="text-center">
                <div
                  className={`bg-primary-500 h-24 w-full ${radius.name} flex items-center justify-center text-white font-semibold`}
                >
                  {radius.label}
                </div>
                <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 font-mono">{radius.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Layout & Containers Section */}
        <section id="layout">
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 border-b-4 border-primary-400 pb-4">
            Layout & Containers
          </h2>

          <div className="space-y-8">
            {/* Page Container */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">
                Standard Page Container
              </h3>
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-6">
                <p className="text-neutral-600 dark:text-neutral-300">
                  All pages should use a consistent container pattern for proper margins and centering:
                </p>
                <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    <code className="text-neutral-700 dark:text-neutral-300">
                      {`{/* Standard page container for content pages */}
<div className="container mx-auto px-4 py-16 max-w-4xl">
  {/* Your page content */}
</div>

{/* Wider container for component showcases */}
<div className="container mx-auto px-4 py-12 max-w-7xl">
  {/* Your page content */}
</div>

{/* Full-width section with centered content */}
<section className="py-16 bg-neutral-50 dark:bg-neutral-900">
  <div className="container mx-auto px-4">
    {/* Your section content */}
  </div>
</section>`}
                    </code>
                  </pre>
                </div>
                <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-300">
                  <li>
                    <code className="bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">container mx-auto</code> -
                    Centers content and provides responsive breakpoints
                  </li>
                  <li>
                    <code className="bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">px-4</code> - Standard
                    horizontal padding (1rem / 16px)
                  </li>
                  <li>
                    <code className="bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">py-12</code> or{' '}
                    <code className="bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">py-16</code> - Vertical
                    spacing between sections
                  </li>
                  <li>
                    <code className="bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">max-w-4xl</code> - For
                    content pages (about, contact, etc.)
                  </li>
                  <li>
                    <code className="bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">max-w-7xl</code> - For wider
                    layouts (product grids, dashboards)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section id="guidelines">
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 border-b-4 border-primary-400 pb-4">
            Usage Guidelines
          </h2>

          <div className="space-y-6">
            <Card variant="info">
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                Component Reusability
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                All components shown in this style guide are the ACTUAL components used throughout the site. When you
                update a component here, all instances across the site will automatically reflect the changes.
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-300">
                <li>
                  Import components from{' '}
                  <code className="bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">@/components</code>
                </li>
                <li>Use design tokens from Tailwind classes</li>
                <li>Follow the established patterns for consistency</li>
                <li>Test in both light and dark modes</li>
                <li>Ensure RTL support for Hebrew language</li>
              </ul>
            </Card>

            <Card variant="info">
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                Adding New Components
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-300">
                <li>
                  Create component in{' '}
                  <code className="bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">src/components/</code>
                </li>
                <li>Use TypeScript with proper types and JSDoc</li>
                <li>Follow existing naming conventions</li>
                <li>Add the component to this style guide for reference</li>
                <li>Write comprehensive tests</li>
              </ol>
            </Card>

            <Card variant="info">
              <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Color Usage</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-300">
                <li>
                  <strong>Primary (Green):</strong> Main CTAs, primary actions, navigation highlights
                </li>
                <li>
                  <strong>Secondary (Peach):</strong> Secondary CTAs, accents, featured elements
                </li>
                <li>
                  <strong>Tertiary (Teal):</strong> Focus states, hover accents, links
                </li>
                <li>
                  <strong>Semantic:</strong> Use success/error/warning for appropriate contexts
                </li>
                <li>
                  <strong>Neutral:</strong> Text, borders, backgrounds
                </li>
              </ul>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
