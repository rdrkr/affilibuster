// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Product Categories Section Component
 *
 * Renders a grid of product categories with icons.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header composite for section title and Label for category items.
 */

import Link from 'next/link'

import { CMSIcon, CMSText, Header } from '@/components/elements'
import {
  DirectionEnum,
  type ApiProductCategoryProductCategoryDocument,
  type SectionsCategoryGridEntry,
} from '@/lib/generated/types.gen'

/**
 * Props for the ProductCategoriesSection component
 */
export interface ProductCategoriesSectionProps {
  /** Category grid section data from CMS */
  data: SectionsCategoryGridEntry & {
    __component: 'sections.category-grid'
  }
  /** Product categories to display (fetched separately from CMS) */
  categories: ApiProductCategoryProductCategoryDocument[]
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Product categories section with icons and links.
 * @param props - Component props with CMS section data and categories
 * @param props.data - Categories section data from CMS
 * @param props.categories - Product categories to display
 * @param props.direction - Language direction for RTL support
 * @returns Product categories section component or null if no categories
 */
export function ProductCategoriesSection({ data, categories, direction }: ProductCategoriesSectionProps) {
  const { header } = data

  // Don't render if no categories
  if (categories.length === 0) {
    return null
  }

  return (
    <section className="mb-0" aria-label={header.header?.ariaDescription ?? ''}>
      <Header data={header} level={2} direction={direction} />
      <div
        className={`
        mt-12 flex flex-wrap justify-center
        gap-8 md:gap-16
      `}
      >
        {categories.map(category => {
          // content is ElementsLabelEntry with icon, text, ariaDescription
          const { content } = category

          if (!content) {
            return null
          }

          return (
            <Link
              key={category.documentId}
              href={`/products?category=${category.slug}`}
              className="group flex w-28 flex-col items-center gap-3"
              aria-label={content.ariaDescription}
            >
              <div
                className={`
                  flex size-24 transform items-center justify-center
                  rounded-full border border-neutral-200 bg-white shadow-lg
                  transition-all duration-300
                  group-hover:scale-110 group-hover:border-primary
                  group-hover:bg-primary
                  dark:border-white/10 dark:bg-surface-dark
                `}
              >
                <CMSIcon
                  icon={content.icon ?? 'category'}
                  size="4xl"
                  className={`
                    text-neutral-500 transition-colors
                    group-hover:text-background-dark dark:text-text-secondary-dark
                  `}
                />
              </div>
              <span
                className={`
                  text-center font-semibold text-neutral-600
                  transition-colors
                  group-hover:text-neutral-800 dark:text-text-secondary-dark
                  dark:group-hover:text-white
                `}
              >
                <CMSText text={content.text} />
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default ProductCategoriesSection
