// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Loading skeleton for the homepage route.
 * Renders animated pulse placeholders mimicking hero, feature sections, and card grids.
 * @returns The animated loading skeleton JSX
 */
export default function HomepageLoading(): React.ReactElement {
  return (
    <div className="space-y-12 py-8">
      {/* Hero section skeleton */}
      <div className="animate-pulse">
        <div className="h-72 rounded-xl bg-skeleton sm:h-96 dark:bg-skeleton-dark" />
      </div>

      {/* Feature section skeleton */}
      <div className="animate-pulse space-y-4">
        <div className="mx-auto h-8 w-48 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-3 rounded-xl p-4">
              <div className="h-40 rounded-xl bg-skeleton dark:bg-skeleton-dark" />
              <div className="h-5 w-3/4 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
              <div className="h-4 w-full rounded-lg bg-skeleton dark:bg-skeleton-dark" />
            </div>
          ))}
        </div>
      </div>

      {/* Card grid section skeleton */}
      <div className="animate-pulse space-y-4">
        <div className="mx-auto h-8 w-40 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-3 rounded-xl p-4">
              <div className="h-48 rounded-xl bg-skeleton dark:bg-skeleton-dark" />
              <div className="h-5 w-2/3 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
              <div className="h-4 w-1/2 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
