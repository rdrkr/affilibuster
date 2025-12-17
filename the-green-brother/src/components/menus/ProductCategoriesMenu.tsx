// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Product Categories Menu Component
 *
 * Dropdown menu displaying product category cards with images.
 * Menu button and category data come from CMS via MenusProductCategoriesSelectorEntry.
 */

'use client'

import Link from 'next/link'

import { ButtonLink, CMSImage, CMSText } from '@/components/elements'
import type {
  ApiProductCategoryProductCategoryDocument,
  MenusProductCategoriesSelectorEntry,
} from '@/lib/generated/types.gen'

import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'
import { DropdownMenu } from './DropdownMenu'

/**
 * Props for the ProductCategoriesMenu component
 */
export interface ProductCategoriesMenuProps {
  /** CMS data for the products menu */
  data: MenusProductCategoriesSelectorEntry
  /** Whether the products link is currently active */
  isActive: boolean
  /** Text direction for RTL support */
  direction: DirectionEnum
}

/**
 * Product categories dropdown menu with image cards
 * @param props - Component props with CMS data
 * @param props.data - CMS data for the products menu
 * @param props.isActive - Whether the products link is currently active
 * @param props.direction - Text direction for RTL support
 * @returns Product categories menu component
 */
export function ProductCategoriesMenu({ data, isActive, direction }: ProductCategoriesMenuProps) {
  const categories = data.productCategories ?? []
  const isRTL = direction === DirectionEnum.RTL
  const isIconAfterText = data.menuButton.label?.iconPosition === IconPositionEnum.AFTER_TEXT

  return (
    <div className="group flex h-full items-center">
      {/* Menu button with chevron */}
      <div
        className={`
          flex items-center
          ${isRTL ? 'flex-row-reverse' : ''}
        `}
      >
        <ButtonLink
          data={data.menuButton}
          direction={direction}
          variant="ghost"
          iconSize="md"
          size="sm"
          className={`
            bg-transparent! px-0! transition-colors
            group-hover:text-primary! hover:bg-transparent!
            ${isActive ? 'text-primary!' : 'text-text-secondary-dark!'}
          `}
        />
        {/* Chevron - always on opposite side of icon */}
        <span
          className={`
            material-symbols-outlined text-sm text-text-secondary-dark
            transition-transform duration-300
            group-hover:rotate-180 group-hover:text-primary
            ${isIconAfterText ? 'order-first' : 'order-last'}
            ${isRTL ? '-ms-2 me-1' : 'ms-1 -me-2'}
          `}
        >
          expand_more
        </span>
      </div>
      {/* Dropdown menu */}
      <DropdownMenu width="500px" direction={direction} contentClassName="grid grid-cols-2 gap-4 p-4">
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
      </DropdownMenu>
    </div>
  )
}

export default ProductCategoriesMenu
