import Link from "next/link";

export default function NotFound() {
  return (
    <main className="p-8 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-gray-600 dark:text-zinc-300">
        The page you are looking for doesn&apos;t exist.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/products"
          className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
        >
          Browse products
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-violet-200 text-violet-700 rounded-lg hover:bg-white transition dark:border-violet-400/40 dark:text-violet-300 dark:hover:bg-zinc-900"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
