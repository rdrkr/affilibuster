// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Loading skeleton for the blog listing page.
 * Renders animated pulse placeholders mimicking header, featured posts carousel, and tag sections.
 * @returns The animated loading skeleton JSX
 */
export default function BlogLoading(): React.ReactElement {
  return (
    <div className="space-y-12 py-8">
      {/* Page header skeleton */}
      <div className="animate-pulse">
        <div className="mx-auto h-10 w-40 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
      </div>

      {/* Featured posts carousel skeleton */}
      <div className="animate-pulse">
        <div className="h-64 rounded-xl bg-skeleton sm:h-80 dark:bg-skeleton-dark" />
      </div>

      {/* Tag section skeleton */}
      {Array.from({ length: 2 }, (_, sectionIdx) => (
        <div key={sectionIdx} className="animate-pulse space-y-4">
          <div className="h-7 w-36 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="space-y-3 rounded-xl">
                <div className="h-48 rounded-xl bg-skeleton dark:bg-skeleton-dark" />
                <div className="h-5 w-3/4 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
                <div className="h-4 w-full rounded-lg bg-skeleton dark:bg-skeleton-dark" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-2 rounded-xl">
                <div className="h-32 rounded-xl bg-skeleton dark:bg-skeleton-dark" />
                <div className="h-4 w-2/3 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
