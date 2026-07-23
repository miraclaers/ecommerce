 "use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const THEME_KEY = "minishop-theme";

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;

    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "dark") return true;
    if (saved === "light") return false;

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-medium text-accent transition hover:text-accent dark:text-accent dark:hover:text-accent"
        >
          ← Back to home
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Settings
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        This is a demo page. You can grow it with real preferences later
        (notifications, language, theme, and so on).
      </p>

      <section className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Appearance
        </h2>
        <div className="rounded-lg border border-zinc-200 px-3 py-3 dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Theme
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Current mode: {isDark ? "Dark" : "Light"}
          </p>
          <button
            type="button"
            onClick={toggleTheme}
            className="mt-3 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Toggle theme"
          >
            Switch to {isDark ? "light" : "dark"} mode
          </button>
        </div>

        <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Placeholder sections
        </h2>
        <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
          <li className="rounded-lg border border-dashed border-zinc-200 px-3 py-3 dark:border-zinc-700">
            Personal data — connect to your account flow when you add auth.
          </li>
          <li className="rounded-lg border border-dashed border-zinc-200 px-3 py-3 dark:border-zinc-700">
            Notifications — stub for future email / push preferences.
          </li>
        </ul>
      </section>
    </div>
  );
}
