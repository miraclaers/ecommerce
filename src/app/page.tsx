"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";

export default function HomePage() {
  return (
    <div className="shop-container flex min-h-[calc(100dvh-8.5rem)] flex-col justify-center py-16 sm:py-20">
      <FadeIn className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          MiniShop
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          A quiet demo store.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
          Clean catalog, cart flow, and account surfaces — built to show
          disciplined product UI, not noise.
        </p>
        <p className="mt-3 text-sm font-medium text-ink-subtle">
          Made by Alejo Castillo
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/products" className="btn-accent px-6 py-3">
            View products
          </Link>
          <Link href="/cart" className="btn-ghost px-6 py-3">
            Open cart
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
