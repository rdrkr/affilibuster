// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Homepage Client Component
 *
 * Renders the homepage using CMS data through composable section components.
 * Handles client-side animations while all content comes from CMS.
 */

'use client'

import { useEffect, useState } from 'react'

import { HomeSections } from '@/components/homepage'
import type {
  ApiBlogPostBlogPostDocument,
  ApiHomepageHomepageDocument,
  ApiProductCategoryProductCategoryDocument,
  ApiProductProductDocument,
} from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Props for the HomeClient component
 */
export interface HomeClientProps {
  /** Homepage CMS data (null if unavailable) */
  homepageData: ApiHomepageHomepageDocument | null
  /** Featured products from CMS */
  products: ApiProductProductDocument[]
  /** Product categories from CMS */
  categories: ApiProductCategoryProductCategoryDocument[]
  /** Blog posts from CMS */
  blogPosts: ApiBlogPostBlogPostDocument[]
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Homepage client component that renders CMS-driven sections with animations.
 * @param props - Homepage data from server component
 * @param props.homepageData - Homepage CMS data (null if unavailable)
 * @param props.products - Featured products from CMS
 * @param props.categories - Product categories from CMS
 * @param props.blogPosts - Blog posts from CMS
 * @param props.direction - Language direction for RTL support
 * @returns Rendered homepage or null if no CMS data
 */
export default function HomeClient({ homepageData, products, categories, blogPosts, direction }: HomeClientProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Use requestAnimationFrame to avoid cascading renders
    const frame = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [])

  // Don't render if no homepage data from CMS
  if (!homepageData) {
    return null
  }

  return (
    <div
      className={`
        space-y-16 py-8 transition-opacity duration-1000
        md:space-y-24
        ${isVisible ? `opacity-100` : `opacity-0`}
      `}
    >
      <HomeSections
        sections={homepageData.sections}
        products={products}
        categories={categories}
        blogPosts={blogPosts}
        direction={direction}
      />
    </div>
  )
}
