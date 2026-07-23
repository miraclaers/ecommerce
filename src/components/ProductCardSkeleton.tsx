export default function ProductCardSkeleton() {
  return (
    <li className="list-none">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface-elevated shadow-card animate-pulse">
        <div className="aspect-[4/3] w-full skeleton-shimmer" />
        <div className="space-y-3 p-4">
          <div className="h-4 w-3/4 rounded skeleton-shimmer" />
          <div className="h-3 w-1/3 rounded skeleton-shimmer" />
          <div className="mt-2 h-9 w-full rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </li>
  );
}
