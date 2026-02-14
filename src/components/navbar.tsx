import Link from "next/link";

export default function Navbar() {
  return (
    <footer className="w-full border-t bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-sm text-zinc-600 dark:text-zinc-300">
        <span>© {new Date().getFullYear()} MiniShop</span>
        <Link
          href="https://github.com/alejosworkstuff"
          className="rounded-md border border-zinc-200 px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Portfolio
        </Link>
      </div>
    </footer>
  );
}


