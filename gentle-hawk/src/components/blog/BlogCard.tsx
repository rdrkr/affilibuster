// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * BlogCard Placeholder
 *
 * GentleHawk does not use blog features. This placeholder satisfies
 * the barrel import from `@affilibuster/frontend`/components/sections/BlogTeaserSection.
 */

import type { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Props for the BlogCard component.
 */
export interface BlogCardProps {
  /** Blog post data */
  post: unknown
  /** Language direction */
  direction: DirectionEnum
  /** Additional props */
  [key: string]: unknown
}

/**
 * Placeholder BlogCard — renders nothing in GentleHawk.
 * @param _props - Blog card props (unused)
 * @returns null
 */
export function BlogCard(_props: BlogCardProps): React.ReactElement | null {
  return null
}
