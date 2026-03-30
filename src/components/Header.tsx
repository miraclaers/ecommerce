"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/app/context/CartContext";

const THEME_KEY = "minishop-theme";

export default function Header() {
  const { cart } = useCart();
  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const [animateBadge, setAnimateBadge] = useState(false);
  const previousCount = useRef(itemCount);
  const badgeTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

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

  useEffect(() => {
    if (itemCount > previousCount.current) {
      setAnimateBadge(true);
      if (badgeTimer.current) {
        clearTimeout(badgeTimer.current);
      }
      badgeTimer.current = setTimeout(() => {
        setAnimateBadge(false);
      }, 320);
    }

    previousCount.current = itemCount;

    return () => {
      if (badgeTimer.current) {
        clearTimeout(badgeTimer.current);
      }
    };
  }, [itemCount]);

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
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold uppercase text-white dark:bg-zinc-100 dark:text-zinc-900">
            MS
          </span>
          MiniShop
        </Link>

        <form className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            name="q"
            placeholder="Search products"
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-700 outline-none transition focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-zinc-500"
            aria-label="Search products"
          />
        </form>

        <div className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Link
            href="/products"
            className="hidden text-sm transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 sm:inline"
          >
            Products
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Toggle theme"
          >
            Toggle theme
          </button>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Open cart"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="20" r="1.8" />
              <circle cx="17" cy="20" r="1.8" />
              <path d="M3 4h2l2.6 11h9.8l2.1-7H7.1" />
            </svg>
            {itemCount > 0 ? (
              <span
                className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[11px] font-semibold text-white ${
                  animateBadge ? "cart-badge-pop" : ""
                }`}
              >
                {itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </nav>
    </header>
  );
}
