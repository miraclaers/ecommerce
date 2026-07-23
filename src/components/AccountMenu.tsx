"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Show,
  SignInButton,
  SignUpButton,
  useClerk,
  useUser,
} from "@clerk/nextjs";
import { useOrders } from "@/app/context/OrdersContext";
import { useMessages } from "@/app/context/MessagesContext";
import { useFavorites } from "@/app/context/FavoritesContext";
import { useCollections } from "@/app/context/CollectionsContext";

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
  | "signout"
  | "manage";

const DEMO_MESSAGES: Partial<Record<MenuAction, string>> = {
  profile: "Personal data (demo)",
  addresses: "Addresses (demo)",
  payments: "Payment methods (demo)",
  help: "Help (demo)",
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
      className={`h-5 w-5 shrink-0 text-ink-subtle ${className ?? ""}`}
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

const itemClass =
  "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-ink outline-none transition duration-shop hover:bg-surface-muted focus-visible:bg-surface-muted";

export default function AccountMenu() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { orders } = useOrders();
  const { unreadCount } = useMessages();
  const { favoritesCount } = useFavorites();
  const { collections } = useCollections();
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
    if (action === "purchases") {
      router.push("/my-purchases");
      setOpen(false);
      return;
    }
    if (action === "messages") {
      router.push("/messages");
      setOpen(false);
      return;
    }
    if (action === "favorites") {
      router.push("/favorites");
      setOpen(false);
      return;
    }
    if (action === "collections") {
      router.push("/collections");
      setOpen(false);
      return;
    }
    if (action === "settings") {
      router.push("/settings");
      setOpen(false);
      return;
    }
    if (action === "manage") {
      openUserProfile();
      setOpen(false);
      return;
    }
    if (action === "signout") {
      void signOut({ redirectUrl: "/" });
      setOpen(false);
      return;
    }
    showToast(DEMO_MESSAGES[action] ?? "Done (demo)");
    setOpen(false);
  };

  const displayName =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "Guest";
  const email =
    user?.primaryEmailAddress?.emailAddress ?? "Sign in to sync orders";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const imageUrl = user?.imageUrl;

  const panelTransition =
    "absolute right-0 top-[calc(100%+10px)] z-[70] min-w-[280px] max-w-[min(calc(100vw-24px),320px)] rounded-xl border border-line bg-surface-elevated p-2 shadow-card-hover transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]";

  const openClasses = open
    ? "visible translate-y-0 opacity-100"
    : "pointer-events-none invisible -translate-y-2 opacity-0";

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <Show when="signed-out">
        <div className="flex items-center gap-1.5">
          <SignInButton mode="modal">
            <button type="button" className="btn-ghost !px-3 !py-2 text-sm">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button type="button" className="btn-accent !px-3 !py-2 text-sm">
              Sign up
            </button>
          </SignUpButton>
        </div>
      </Show>

      <Show when="signed-in">
        <button
          type="button"
          id={`${menuId}-trigger`}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={`${menuId}-panel`}
          aria-label={`Account menu, ${displayName}`}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-muted text-[11px] font-bold uppercase tracking-wide text-ink shadow-sm outline-none transition duration-shop hover:border-accent/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Clerk CDN hosts vary
            <img
              src={imageUrl}
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <span aria-hidden>{initials || "?"}</span>
          )}
        </button>

        <div
          ref={menuRef}
          id={`${menuId}-panel`}
          role="menu"
          aria-label="Account menu"
          aria-hidden={!open}
          className={`${panelTransition} ${openClasses}`}
        >
          <div className="border-b border-line px-3 pb-3 pt-2">
            <p className="truncate text-sm font-semibold text-ink">
              {displayName}
            </p>
            <p className="truncate text-xs text-ink-muted">{email}</p>
          </div>

          <div role="group" aria-label="Activity" className="px-1 pt-2">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
              Activity
            </p>
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => handleAction("purchases")}
            >
              <MenuIcon>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </MenuIcon>
              <span className="flex items-center gap-2">
                My purchases
                {orders.length > 0 ? (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {orders.length}
                  </span>
                ) : null}
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => handleAction("messages")}
            >
              <MenuIcon>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </MenuIcon>
              <span className="flex items-center gap-2">
                Messages
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {unreadCount}
                  </span>
                ) : null}
              </span>
            </button>
          </div>

          <div className="my-1 h-px bg-line" role="separator" aria-hidden />

          <div role="group" aria-label="Lists" className="px-1">
            <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
              Lists
            </p>
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => handleAction("favorites")}
            >
              <MenuIcon>
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </MenuIcon>
              <span className="flex items-center gap-2">
                Favorites
                {favoritesCount > 0 ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    {favoritesCount}
                  </span>
                ) : null}
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => handleAction("collections")}
            >
              <MenuIcon>
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </MenuIcon>
              <span className="flex items-center gap-2">
                Collections
                {collections.length > 0 ? (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {collections.length}
                  </span>
                ) : null}
              </span>
            </button>
          </div>

          <div className="my-1 h-px bg-line" role="separator" aria-hidden />

          <div role="group" aria-label="Account" className="px-1">
            <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
              Account
            </p>
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => handleAction("manage")}
            >
              <MenuIcon>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </MenuIcon>
              Manage account
            </button>
            <button
              type="button"
              role="menuitem"
              className={itemClass}
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
              className={itemClass}
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
              className={itemClass}
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
              className={itemClass}
              onClick={() => handleAction("settings")}
            >
              <MenuIcon>
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </MenuIcon>
              Settings
            </button>
          </div>

          <div className="my-1 h-px bg-line" role="separator" aria-hidden />

          <div role="group" aria-label="Support" className="px-1 pb-1">
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => handleAction("help")}
            >
              <MenuIcon>
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
              </MenuIcon>
              Help
            </button>
          </div>

          <div className="my-1 h-px bg-line" role="separator" aria-hidden />

          <button
            type="button"
            role="menuitem"
            className="mb-1 flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-semibold text-red-600 outline-none transition hover:bg-red-50 focus-visible:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 dark:focus-visible:bg-red-950/40"
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
            className="toast-pop fixed bottom-8 left-1/2 z-[90] max-w-[min(calc(100vw-32px),360px)] -translate-x-1/2 rounded-full border border-line bg-surface-elevated px-4 py-2 text-center text-sm font-medium text-ink shadow-card"
          >
            {toast}
          </div>
        ) : null}
      </Show>
    </div>
  );
}
