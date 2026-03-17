// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Product Categories Menu Component
 *
 * Dropdown menu displaying product category cards with images.
 * Menu button and category data come from CMS via MenusProductCategoriesSelectorEntry.
 */

'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import type {
  ApiProductCategoryProductCategoryDocument,
  MenusProductCategoriesSelectorEntry,
} from '@/lib/generated/types.gen'
import { Image, Text } from '@/components/elements'

import { DirectionEnum } from '@/lib/generated/types.gen'
import { DropdownMenu } from '@/components/menus/DropdownMenu'

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
  const pathname = usePathname()
  const currentSearchParams = useSearchParams()
  const existingSearch = currentSearchParams.get('search')
  const categories = data.productCategories ?? []
  const [isOpen, setIsOpen] = useState(false)

  // Extract language segment from current pathname (e.g., /en/products -> en)
  const langRegex = /^\/([a-z]{2})\/?/
  const langMatch = langRegex.exec(pathname)
  const lang = langMatch?.[1] ?? 'en'

  /**
   * Builds href for a category link, preserving search param and language segment.
   * @param slug - The category slug
   * @returns URL string with language, category and optional search params
   */
  const getCategoryHref = (slug: string): string => {
    const params = new URLSearchParams()
    params.set('category', slug)
    if (existingSearch) {
      params.set('search', existingSearch)
    }
    return `/${lang}/products?${params.toString()}`
  }

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
      {categories.map((category: ApiProductCategoryProductCategoryDocument) => (
        <Link
          key={category.documentId}
          href={getCategoryHref(category.slug)}
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
                font-bold text-foreground-dark transition-colors
                group-hover/item:text-primary
              `}
            />
          </div>
        </Link>
      ))}
    </DropdownMenu>
  )
}

export default ProductCategoriesMenu
