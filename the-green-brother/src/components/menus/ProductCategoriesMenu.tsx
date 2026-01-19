// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Product Categories Menu Component
 *
 * Dropdown menu displaying product category cards with images.
 * Menu button and category data come from CMS via MenusProductCategoriesSelectorEntry.
 */

'use client'

import { useState } from 'react'

import type {
  ApiProductCategoryProductCategoryDocument,
  MenusProductCategoriesSelectorEntry,
} from '@/lib/generated/types.gen'
import Link from 'next/link'
import { Image, Text } from '../elements'

import { DirectionEnum } from '@/lib/generated/types.gen'
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
  /** Whether to show text labels (default: true) */
  showText?: boolean
  /** Whether the menu is disabled (prevents hover interactions) */
  disabled?: boolean
  /** Controls visibility of entire menu - when false, menu is hidden from layout */
  visible?: boolean
}

/**
 * Product categories dropdown menu with image cards
 * @param props - Component props with CMS data
 * @param props.data - CMS data for the products menu
 * @param props.isActive - Whether the products link is currently active
 * @param props.direction - Text direction for RTL support
 * @param props.showText - Whether to show text labels (default: true)
 * @param props.disabled - Whether the menu is disabled (prevents hover)
 * @param props.visible - Controls visibility of entire menu - when false, menu is hidden from layout
 * @returns Product categories menu component
 */
export function ProductCategoriesMenu({
  data,
  isActive,
  direction,
  showText = true,
  disabled = false,
  visible = true,
}: ProductCategoriesMenuProps) {
  const categories = data.productCategories ?? []
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu
      triggerData={data.menuButton}
      triggerType="link"
      direction={direction}
      showText={showText}
      visible={visible}
      isActive={isActive}
      disabled={disabled}
      width="500px"
      dropdownClassName="grid grid-cols-2 gap-4 p-4"
      testId="product-categories-menu-container"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
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
            onClick={() => {
              setIsOpen(false)
            }}
          >
            <Image
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
              <Text
                text={category.content.text}
                as="span"
                className={`
                font-bold text-white transition-colors
                group-hover/item:text-primary
              `}
              />
            </div>
          </Link>
        )
      })}
    </DropdownMenu>
  )
}

export default ProductCategoriesMenu
