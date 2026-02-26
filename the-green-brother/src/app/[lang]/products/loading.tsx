// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Loading skeleton for the products listing page.
 * Renders animated pulse placeholders mimicking header, filter tabs, and product card grid.
 * @returns The animated loading skeleton JSX
 */
export default function ProductsLoading(): React.ReactElement {
  return (
    <div className="space-y-8 py-8">
      {/* Page header skeleton */}
      <div className="animate-pulse">
        <div className="mx-auto h-10 w-56 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
      </div>

      {/* Filter tabs + sort skeleton */}
      <div className="flex animate-pulse items-center justify-between gap-4">
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-skeleton dark:bg-skeleton-dark" />
          ))}
        </div>
        <div className="h-8 w-32 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-3 rounded-xl p-4">
            <div className="aspect-square rounded-xl bg-skeleton dark:bg-skeleton-dark" />
            <div className="h-4 w-16 rounded-full bg-skeleton dark:bg-skeleton-dark" />
            <div className="h-5 w-3/4 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
            <div className="h-5 w-1/3 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
            <div className="h-10 w-full rounded-xl bg-skeleton dark:bg-skeleton-dark" />
          </div>
        ))}
      </div>
    </div>
  )
}
