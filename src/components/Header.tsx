"use client";

import Link from "next/link";
import { useEffect } from "react";

const THEME_KEY = "minishop-theme";

export default function Header() {
  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const nextTheme =
      saved === "light" || saved === "dark"
        ? saved
        : systemPrefersDark
          ? "dark"
          : "light";

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );
  }, []);

  const toggleTheme = () => {
    const isDark =
      document.documentElement.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );
    window.localStorage.setItem(THEME_KEY, nextTheme);
  };

  return (
    <header className="w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          MiniShop
        </Link>

        <ul className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <li>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Toggle theme"
            >
              Toggle theme
            </button>
          </li>

          <li>
            <Link
              href="/products"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Products
            </Link>
          </li>

          <li>
            <Link
              href="/cart"
              className="rounded-md bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Cart
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
