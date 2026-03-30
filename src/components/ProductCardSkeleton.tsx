export default function ProductCardSkeleton() {
  return (
    <li
      className="
        border rounded-lg p-4 bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800
        w-full mb-4 break-inside-avoid
        animate-pulse
      "
    >
      <div className="w-full h-40 rounded-md mb-4 skeleton-shimmer" />

      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded skeleton-shimmer" />
        <div className="h-3 w-1/3 rounded skeleton-shimmer" />
      </div>

      <div className="mt-4 h-9 w-full rounded-md skeleton-shimmer" />
    </li>
  );
}
