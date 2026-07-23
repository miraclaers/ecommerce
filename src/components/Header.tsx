"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

const AccountMenu = dynamic(() => import("@/components/AccountMenu"), {
  ssr: false,
  loading: () => <div className="h-10 w-10 shrink-0" aria-hidden />,
});

const THEME_KEY = "minishop-theme";

export default function Header() {
  const { cart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (pathname !== "/products") return;
    const q = new URLSearchParams(window.location.search).get("q") ?? "";
    setQuery(q);
  }, [pathname]);

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

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface-elevated/90 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="shop-container flex flex-wrap items-center gap-3 py-3 sm:h-16 sm:flex-nowrap sm:gap-5 sm:py-0"
      >
        <Link
          href="/products"
          className="group flex shrink-0 items-center gap-2.5 text-ink transition duration-shop"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-xs font-bold uppercase tracking-wide text-surface transition group-hover:bg-accent group-hover:text-accent-fg">
            MS
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            MiniShop
          </span>
        </Link>

        <form
          onSubmit={onSearch}
          className="relative order-3 w-full min-w-0 sm:order-none sm:flex-1"
          role="search"
        >
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle">
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="w-full rounded-full border border-line bg-surface-muted/70 py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition duration-shop placeholder:text-ink-subtle focus:border-accent/40 focus:bg-surface-elevated focus:ring-2 focus:ring-ring/20"
            aria-label="Search products"
          />
        </form>

        <div className="order-2 ml-auto flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink-muted sm:order-none sm:gap-2">
          <AccountMenu />

          <Link
            href="/cart"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink transition duration-shop hover:border-accent/35 hover:bg-accent-soft/50"
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
                key={itemCount}
                className="cart-badge-pop absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-fg"
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
