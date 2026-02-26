// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Loading skeleton for the product detail page.
 * Renders animated pulse placeholders mimicking image gallery, product info, and related products.
 * @returns The animated loading skeleton JSX
 */
export default function ProductDetailLoading(): React.ReactElement {
  return (
    <div className="space-y-12 py-8">
      {/* Two-column product layout */}
      <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Image gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl bg-skeleton dark:bg-skeleton-dark" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="size-16 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
            ))}
          </div>
        </div>

        {/* Right: Product info */}
        <div className="space-y-4">
          <div className="h-4 w-24 rounded-full bg-skeleton dark:bg-skeleton-dark" />
          <div className="h-8 w-3/4 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="size-5 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
            ))}
          </div>
          <div className="h-7 w-28 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded-lg bg-skeleton dark:bg-skeleton-dark" />
            <div className="h-4 w-5/6 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
            <div className="h-4 w-2/3 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-12 w-32 rounded-xl bg-skeleton dark:bg-skeleton-dark" />
            <div className="size-12 rounded-xl bg-skeleton dark:bg-skeleton-dark" />
          </div>
        </div>
      </div>

      {/* Related products skeleton */}
      <div className="animate-pulse space-y-4">
        <div className="h-7 w-44 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="w-56 shrink-0 space-y-3">
              <div className="aspect-square rounded-xl bg-skeleton dark:bg-skeleton-dark" />
              <div className="h-4 w-3/4 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
              <div className="h-4 w-1/3 rounded-lg bg-skeleton dark:bg-skeleton-dark" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
