// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Loading skeleton for the blog post detail page.
 * Renders animated pulse placeholders mimicking hero image, article metadata, and content.
 * @returns The animated loading skeleton JSX
 */
export default function BlogPostLoading(): React.ReactElement {
  return (
    <div className="space-y-8 py-8">
      {/* Hero image skeleton */}
      <div className="animate-pulse">
        <div className="h-64 rounded-xl bg-skeleton sm:h-96 dark:bg-skeleton-dark" />
      </div>

      {/* Breadcrumb skeleton */}
      <div className="flex animate-pulse gap-2">
        <div className="h-4 w-12 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        <div className="h-4 w-3 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        <div className="h-4 w-16 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        <div className="h-4 w-3 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        <div className="h-4 w-32 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
      </div>

      {/* Article metadata skeleton */}
      <div className="flex animate-pulse items-center gap-4">
        <div className="size-10 rounded-full bg-skeleton dark:bg-skeleton-dark" />
        <div className="space-y-1">
          <div className="h-4 w-28 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
          <div className="h-3 w-20 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        </div>
      </div>

      {/* Article content skeleton */}
      <div className="mx-auto max-w-3xl animate-pulse space-y-6">
        <div className="h-8 w-2/3 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-lg bg-skeleton dark:bg-skeleton-dark" />
          <div className="h-4 w-full rounded-lg bg-skeleton dark:bg-skeleton-dark" />
          <div className="h-4 w-4/5 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        </div>
        <div className="h-56 rounded-xl bg-skeleton dark:bg-skeleton-dark" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-lg bg-skeleton dark:bg-skeleton-dark" />
          <div className="h-4 w-full rounded-lg bg-skeleton dark:bg-skeleton-dark" />
          <div className="h-4 w-3/4 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        </div>
        <div className="h-6 w-1/2 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-lg bg-skeleton dark:bg-skeleton-dark" />
          <div className="h-4 w-5/6 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        </div>
      </div>
    </div>
  )
}
