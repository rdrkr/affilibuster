// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Product Categories Menu Component
 *
 * Dropdown menu displaying product category cards with images.
 * Menu button and category data come from CMS via MenusProductCategoriesSelectorEntry.
 */

'use client'

import Link from 'next/link'

import { CMSIcon, CMSImage, CMSText } from '@/components/elements'
import type {
  ApiProductCategoryProductCategoryDocument,
  MenusProductCategoriesSelectorEntry,
} from '@/lib/generated/types.gen'

/**
 * Props for the ProductCategoriesMenu component
 */
export interface ProductCategoriesMenuProps {
  /** CMS data for the products menu */
  data: MenusProductCategoriesSelectorEntry
  /** Whether the products link is currently active */
  isActive: boolean
}

/**
 * Product categories dropdown menu with image cards
 * @param props - Component props with CMS data
 * @param props.data - CMS data for the products menu
 * @param props.isActive - Whether the products link is currently active
 * @returns Product categories menu component
 */
export function ProductCategoriesMenu({ data, isActive }: ProductCategoriesMenuProps) {
  const categories = data.productCategories ?? []

  return (
    <div className="group flex h-full items-center">
      <Link
        href={data.menuButton.url}
        className={`
          flex items-center gap-1.5 transition-colors
          hover:text-primary
          ${isActive ? `text-primary` : ''}
        `}
        aria-label={data.menuButton.label?.ariaDescription}
      >
        <CMSIcon icon={data.menuButton.label?.icon} size="md" />
        <CMSText text={data.menuButton.label?.text} />
        <span
          className={`
          material-symbols-outlined text-sm transition-transform
          group-hover:rotate-180
        `}
        >
          expand_more
        </span>
      </Link>
      {/* Dropdown menu */}
      <div
        className={`
          invisible absolute top-full left-0 z-50 w-[500px] pt-6 opacity-0
          transition-all duration-300
          group-hover:visible group-hover:opacity-100
        `}
      >
        <div
          className={`
          grid grid-cols-2 gap-4 rounded-xl border border-white/10
          bg-surface-dark p-4 shadow-xl
        `}
        >
          {categories.map((category: ApiProductCategoryProductCategoryDocument) => {
            if (!category.content) {
              return null
            }

            return (
              <Link
                key={category.documentId}
                href={`/products?category=${category.slug}`}
                className={`
                  group/item relative block h-32 overflow-hidden rounded-xl
                `}
              >
                <CMSImage
                  image={category.image}
                  className={`
                    object-cover transition-transform duration-500
                    group-hover/item:scale-110
                  `}
                  fill
                  sizes="250px"
                />
                <div
                  className={`
                  absolute inset-0 flex items-end bg-linear-to-t from-black/80
                  to-transparent p-4
                `}
                >
                  <span
                    className={`
                    font-bold text-white transition-colors
                    group-hover/item:text-primary
                  `}
                  >
                    <CMSText text={category.content.text} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProductCategoriesMenu
