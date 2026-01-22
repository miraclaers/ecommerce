"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Logo / Marca */}
        <Link 
          href="/" 
          className="text-xl font-bold tracking-tight text-zinc-900"
        >
          MiniShop
        </Link>

        {/* Navegación */}
        <ul className="flex items-center gap-6 text-sm font-medium text-zinc-600">
          <li>
            <Link 
              href="/products" 
              className="transition-colors hover:text-zinc-900"
            >
              Products
            </Link>
          </li>

          <li>
            <Link 
              href="/cart" 
              className="rounded-md bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-800"
            >
              Cart
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
