export default function ProductDetailSkeleton() {
  return (
    <section className="grid gap-12 md:grid-cols-2">
      <div className="rounded-xl border-4 border-violet-600 p-4">
        <div className="h-72 w-full rounded-lg skeleton-shimmer" />
        <div className="mt-4 flex gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`thumb-${index}`}
              className="h-16 w-16 rounded-lg skeleton-shimmer"
            />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="h-7 w-3/4 rounded skeleton-shimmer" />
        <div className="h-6 w-24 rounded skeleton-shimmer" />
        <div className="h-12 w-40 rounded-xl skeleton-shimmer" />

        <div className="mt-6 space-y-3">
          <div className="flex gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`tab-${index}`}
                className="h-5 w-24 rounded skeleton-shimmer"
              />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-11/12 rounded skeleton-shimmer" />
            <div className="h-4 w-9/12 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>
    </section>
  );
}
