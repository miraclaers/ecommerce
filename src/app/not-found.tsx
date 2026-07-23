import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-8 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-gray-600 dark:text-zinc-300">
        The page you are looking for doesn&apos;t exist.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/products"
          className="px-6 py-3 bg-accent text-white rounded-lg hover:brightness-110 transition"
        >
          Browse products
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-accent/30 text-accent rounded-lg hover:bg-white transition dark:border-accent/40 dark:text-accent dark:hover:bg-zinc-900"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
