import Link from "next/link";

export default function Navbar() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-sm text-zinc-600">
        <span>© {new Date().getFullYear()} MiniShop</span>
        <Link
          href="https://placeholder-portfolio.example"
          className="rounded-md border border-zinc-200 px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Portfolio (placeholder)
        </Link>
      </div>
    </footer>
  );
}
