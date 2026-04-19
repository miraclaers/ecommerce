"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

type MenuAction =
  | "purchases"
  | "messages"
  | "favorites"
  | "collections"
  | "profile"
  | "addresses"
  | "payments"
  | "settings"
  | "help"
  | "signout";

const DEMO_MESSAGES: Record<MenuAction, string> = {
  purchases: "My purchases (demo)",
  messages: "Messages (demo)",
  favorites: "Favorites (demo)",
  collections: "Collections (demo)",
  profile: "Personal data (demo)",
  addresses: "Addresses (demo)",
  payments: "Payment methods (demo)",
  settings: "Settings (demo)",
  help: "Help (demo)",
  signout: "Sign out (demo)",
};

function MenuIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400 ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export default function AccountMenu() {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1700);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector(
      '[role="menuitem"]'
    ) as HTMLElement | null;
    window.requestAnimationFrame(() => first?.focus());
  }, [open]);

  const handleAction = (action: MenuAction) => {
    showToast(DEMO_MESSAGES[action]);
    setOpen(false);
  };

  const panelTransition =
    "absolute right-0 top-[calc(100%+10px)] z-[70] min-w-[280px] max-w-[min(calc(100vw-24px),320px)] rounded-xl border border-zinc-200 bg-white p-2 shadow-lg transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] dark:border-zinc-700 dark:bg-zinc-900";

  const openClasses = open
    ? "visible translate-y-0 opacity-100"
    : "pointer-events-none invisible -translate-y-2 opacity-0";

  const staggerBase =
    "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0";

  const staggerWhenOpen = open
    ? "translate-y-0 opacity-100"
    : "-translate-y-1 opacity-0";

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${menuId}-panel`}
        aria-label="Account menu, Alex Demo"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 text-[11px] font-bold uppercase tracking-wide text-zinc-800 shadow-sm outline-none ring-violet-500 transition hover:border-zinc-300 hover:shadow-md focus-visible:ring-2 dark:border-zinc-600 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 forced-colors:border-[ButtonBorder]"
      >
        <span aria-hidden>AD</span>
      </button>

      <div
        ref={menuRef}
        id={`${menuId}-panel`}
        role="menu"
        aria-label="Account menu"
        aria-hidden={!open}
        className={`${panelTransition} ${openClasses}`}
      >
        <div className="border-b border-zinc-100 px-3 pb-3 pt-2 dark:border-zinc-800">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Alex Demo
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            alex.demo@example.com
          </p>
        </div>

        <div
          role="group"
          aria-label="Activity"
          className={`${staggerBase} ${staggerWhenOpen} px-1 pt-2 delay-75 motion-reduce:delay-0`}
        >
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Activity
          </p>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-zinc-800 outline-none transition hover:bg-zinc-100 focus-visible:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
            onClick={() => handleAction("purchases")}
          >
            <MenuIcon>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </MenuIcon>
            My purchases
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-zinc-800 outline-none transition hover:bg-zinc-100 focus-visible:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
            onClick={() => handleAction("messages")}
          >
            <MenuIcon>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </MenuIcon>
            Messages
          </button>
        </div>

        <div
          className="my-1 h-px bg-zinc-100 dark:bg-zinc-800"
          role="separator"
          aria-hidden
        />

        <div
          role="group"
          aria-label="Lists"
          className={`${staggerBase} ${staggerWhenOpen} px-1 delay-100 motion-reduce:delay-0`}
        >
          <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Lists
          </p>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-zinc-800 outline-none transition hover:bg-zinc-100 focus-visible:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
            onClick={() => handleAction("favorites")}
          >
            <MenuIcon>
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </MenuIcon>
            Favorites
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-zinc-800 outline-none transition hover:bg-zinc-100 focus-visible:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
            onClick={() => handleAction("collections")}
          >
            <MenuIcon>
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </MenuIcon>
            Collections
          </button>
        </div>

        <div
          className="my-1 h-px bg-zinc-100 dark:bg-zinc-800"
          role="separator"
          aria-hidden
        />

        <div
          role="group"
          aria-label="Account"
          className={`${staggerBase} ${staggerWhenOpen} px-1 delay-150 motion-reduce:delay-0`}
        >
          <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Account
          </p>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-zinc-800 outline-none transition hover:bg-zinc-100 focus-visible:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
            onClick={() => handleAction("profile")}
          >
            <MenuIcon>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </MenuIcon>
            Personal data
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-zinc-800 outline-none transition hover:bg-zinc-100 focus-visible:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
            onClick={() => handleAction("addresses")}
          >
            <MenuIcon>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </MenuIcon>
            Addresses
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-zinc-800 outline-none transition hover:bg-zinc-100 focus-visible:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
            onClick={() => handleAction("payments")}
          >
            <MenuIcon>
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <path d="M1 10h22" />
            </MenuIcon>
            Payment methods
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-zinc-800 outline-none transition hover:bg-zinc-100 focus-visible:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
            onClick={() => handleAction("settings")}
          >
            <MenuIcon>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </MenuIcon>
            Settings
          </button>
        </div>

        <div
          className="my-1 h-px bg-zinc-100 dark:bg-zinc-800"
          role="separator"
          aria-hidden
        />

        <div
          role="group"
          aria-label="Support"
          className={`${staggerBase} ${staggerWhenOpen} px-1 pb-1 delay-200 motion-reduce:delay-0`}
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-zinc-800 outline-none transition hover:bg-zinc-100 focus-visible:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
            onClick={() => handleAction("help")}
          >
            <MenuIcon>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
            </MenuIcon>
            Help
          </button>
        </div>

        <div
          className="my-1 h-px bg-zinc-100 dark:bg-zinc-800"
          role="separator"
          aria-hidden
        />

        <button
          type="button"
          role="menuitem"
          className={`${staggerBase} ${staggerWhenOpen} mb-1 flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-semibold text-red-600 outline-none transition hover:bg-red-50 focus-visible:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 dark:focus-visible:bg-red-950/40 motion-reduce:!delay-0 ${open ? "delay-[240ms]" : "delay-0"}`}
          onClick={() => handleAction("signout")}
        >
          <MenuIcon className="text-red-500 dark:text-red-400">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </MenuIcon>
          Sign out
        </button>
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="toast-pop fixed bottom-28 left-1/2 z-[90] max-w-[min(calc(100vw-32px),360px)] -translate-x-1/2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-center text-sm font-medium text-zinc-800 shadow-lg dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
