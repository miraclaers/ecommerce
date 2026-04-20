"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCollections } from "@/app/context/CollectionsContext";
import { fetchProducts } from "@/lib/api-client";
import type { Product } from "@/lib/types";

export default function CollectionsPage() {
  const {
    collections,
    createCollection,
    deleteCollection,
    renameCollection,
    addProductToCollection,
    removeProductFromCollection,
  } = useCollections();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [renameValues, setRenameValues] = useState<Record<string, string>>({});
  const [addSelections, setAddSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const productsMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

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
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Collections
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Create collections, rename them, add/remove products, and delete
        them when you no longer need them.
      </p>

      <section className="mb-6 rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <form onSubmit={handleCreateCollection} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={newCollectionName}
            onChange={(event) => setNewCollectionName(event.target.value)}
            placeholder="New collection name"
            className="min-w-[220px] flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Create collection
          </button>
        </form>
        {message ? (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{message}</p>
        ) : null}
      </section>

      {collections.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-indigo-300/70 bg-indigo-50/40 p-10 text-center dark:border-indigo-500/40 dark:bg-indigo-950/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
            No collections yet
          </h2>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Create your first collection above.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-lg bg-violet-600 px-6 py-3 text-white transition hover:bg-violet-700"
          >
            Browse products
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          {collections.map((collection) => {
            const collectionProducts = collection.productIds
              .map((id) => productsMap.get(id))
              .filter(Boolean) as Product[];

            const availableToAdd = products.filter(
              (product) => !collection.productIds.includes(product.id)
            );

            const selectedProductToAdd =
              addSelections[collection.id] ?? availableToAdd[0]?.id ?? "";

            return (
              <section
                key={collection.id}
                className="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-[220px] flex-1">
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const candidate =
                          renameValues[collection.id] ?? collection.name;
                        const result = renameCollection(
                          collection.id,
                          candidate
                        );
                        if (!result.success) {
                          setMessage(result.message ?? "Rename failed.");
                        } else {
                          setMessage(null);
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={renameValues[collection.id] ?? collection.name}
                        onChange={(event) =>
                          setRenameValues((prev) => ({
                            ...prev,
                            [collection.id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm font-semibold text-zinc-800 outline-none transition focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                      <button
                        type="submit"
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        Rename
                      </button>
                    </form>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {collectionProducts.length}{" "}
                      {collectionProducts.length === 1 ? "product" : "products"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteCollection(collection.id)}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    Delete collection
                  </button>
                </div>

                <div className="mt-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Add product
                  </p>
                  {isLoading ? (
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      Loading products...
                    </p>
                  ) : availableToAdd.length > 0 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <select
                        value={selectedProductToAdd}
                        onChange={(event) =>
                          setAddSelections((prev) => ({
                            ...prev,
                            [collection.id]: event.target.value,
                          }))
                        }
                        className="min-w-[220px] flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        {availableToAdd.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedProductToAdd) return;
                          addProductToCollection(
                            collection.id,
                            selectedProductToAdd
                          );
                        }}
                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      All products are already in this collection.
                    </p>
                  )}
                </div>

                <ul className="mt-3 space-y-2">
                  {collectionProducts.length > 0 ? (
                    collectionProducts.map((product) => (
                      <li
                        key={`${collection.id}-${product.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                            {product.title}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            ${product.price}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeProductFromCollection(
                              collection.id,
                              product.id
                            )
                          }
                          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          Remove
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-lg border border-dashed border-zinc-300 px-3 py-3 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                      No products in this collection yet.
                    </li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
