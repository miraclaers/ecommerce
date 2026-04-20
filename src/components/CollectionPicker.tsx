"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCollections } from "@/app/context/CollectionsContext";

type Props = {
  productId: string;
  buttonClassName?: string;
};

export default function CollectionPicker({
  productId,
  buttonClassName,
}: Props) {
  const {
    collections,
    createCollection,
    isProductInCollection,
    toggleProductInCollection,
  } = useCollections();
  const [open, setOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const canUseDOM = typeof window !== "undefined";

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleCreateCollection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = createCollection(newCollectionName);
    if (!result.success) {
      setMessage(result.message ?? "Could not create collection.");
      return;
    }
    setMessage(null);
    setNewCollectionName("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          buttonClassName ??
          "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
        }
      >
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
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
        Manage collections
      </button>

      {open && canUseDOM
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4"
              onClick={() => setOpen(false)}
            >
              <div
                className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Collections
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Close
                  </button>
                </div>

                <ul className="max-h-52 space-y-2 overflow-auto pr-1">
                  {collections.length > 0 ? (
                    collections.map((collection) => {
                      const checked = isProductInCollection(
                        collection.id,
                        productId
                      );
                      return (
                        <li
                          key={collection.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-zinc-100 px-2 py-1.5 dark:border-zinc-800"
                        >
                          <span className="truncate text-sm text-zinc-700 dark:text-zinc-200">
                            {collection.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              toggleProductInCollection(
                                collection.id,
                                productId
                              )
                            }
                            className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                              checked
                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                            }`}
                          >
                            {checked ? "Added" : "Add"}
                          </button>
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-sm text-zinc-500 dark:text-zinc-400">
                      No collections yet.
                    </li>
                  )}
                </ul>

                <form
                  onSubmit={handleCreateCollection}
                  className="mt-4 space-y-2"
                >
                  <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    New collection
                  </label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(event) =>
                      setNewCollectionName(event.target.value)
                    }
                    placeholder="Example: Work Setup"
                    className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-800 outline-none transition focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Create and keep editing
                  </button>
                  {message ? (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {message}
                    </p>
                  ) : null}
                </form>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
