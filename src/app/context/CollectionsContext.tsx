"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ProductCollection = {
  id: string;
  name: string;
  productIds: string[];
  createdAt: string;
};

type CollectionsContextType = {
  collections: ProductCollection[];
  createCollection: (name: string) => {
    success: boolean;
    message?: string;
  };
  deleteCollection: (collectionId: string) => void;
  renameCollection: (collectionId: string, name: string) => {
    success: boolean;
    message?: string;
  };
  isProductInCollection: (
    collectionId: string,
    productId: string
  ) => boolean;
  toggleProductInCollection: (
    collectionId: string,
    productId: string
  ) => void;
  addProductToCollection: (
    collectionId: string,
    productId: string
  ) => void;
  removeProductFromCollection: (
    collectionId: string,
    productId: string
  ) => void;
  getCollectionsForProduct: (productId: string) => ProductCollection[];
};

const CollectionsContext = createContext<CollectionsContextType | undefined>(
  undefined
);

const collectionsStorageKey = "minishop_collections";
const defaultCollections: ProductCollection[] = [
  {
    id: "gaming",
    name: "Gaming",
    productIds: ["1", "2", "3"],
    createdAt: "2026-04-20T00:00:00.000Z",
  },
];

function normalizeCollectionName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function parseStoredCollections(raw: string | null): ProductCollection[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);

    // Backward compatibility for old structure: { gaming: ["1","2","3"] }
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed).flatMap(([name, ids]) =>
        Array.isArray(ids)
          ? [
              {
                id: name.toLowerCase().replace(/\s+/g, "-"),
                name:
                  name.charAt(0).toUpperCase() + name.slice(1),
                productIds: ids.filter(
                  (item) => typeof item === "string"
                ),
                createdAt: new Date().toISOString(),
              },
            ]
          : []
      );
    }

    if (!Array.isArray(parsed)) return null;

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          Array.isArray(item.productIds)
      )
      .map((item) => ({
        id: item.id,
        name: item.name,
        productIds: item.productIds.filter(
          (id: unknown) => typeof id === "string"
        ),
        createdAt:
          typeof item.createdAt === "string"
            ? item.createdAt
            : new Date().toISOString(),
      }));
  } catch {
    return null;
  }
}

export function CollectionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collections, setCollections] = useState<ProductCollection[]>(() => {
    if (typeof window === "undefined") return defaultCollections;
    return (
      parseStoredCollections(
        window.localStorage.getItem(collectionsStorageKey)
      ) ?? defaultCollections
    );
  });

  useEffect(() => {
    window.localStorage.setItem(
      collectionsStorageKey,
      JSON.stringify(collections)
    );
  }, [collections]);

  const createCollection = useCallback(
    (name: string) => {
      const normalized = normalizeCollectionName(name);
      if (!normalized) {
        return {
          success: false,
          message: "Collection name is required.",
        };
      }

      const alreadyExists = collections.some(
        (collection) =>
          collection.name.toLowerCase() === normalized.toLowerCase()
      );
      if (alreadyExists) {
        return {
          success: false,
          message: "Collection with this name already exists.",
        };
      }

      setCollections((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: normalized,
          productIds: [],
          createdAt: new Date().toISOString(),
        },
      ]);

      return { success: true };
    },
    [collections]
  );

  const deleteCollection = useCallback((collectionId: string) => {
    setCollections((prev) =>
      prev.filter((collection) => collection.id !== collectionId)
    );
  }, []);

  const renameCollection = useCallback(
    (collectionId: string, name: string) => {
      const normalized = normalizeCollectionName(name);
      if (!normalized) {
        return { success: false, message: "Collection name is required." };
      }

      const duplicate = collections.some(
        (collection) =>
          collection.id !== collectionId &&
          collection.name.toLowerCase() === normalized.toLowerCase()
      );

      if (duplicate) {
        return {
          success: false,
          message: "Collection with this name already exists.",
        };
      }

      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === collectionId
            ? { ...collection, name: normalized }
            : collection
        )
      );

      return { success: true };
    },
    [collections]
  );

  const isProductInCollection = useCallback(
    (collectionId: string, productId: string) =>
      (
        collections.find((collection) => collection.id === collectionId)
          ?.productIds ?? []
      ).includes(productId),
    [collections]
  );

  const toggleProductInCollection = useCallback(
    (collectionId: string, productId: string) => {
      setCollections((prev) =>
        prev.map((collection) => {
          if (collection.id !== collectionId) return collection;
          const nextIds = collection.productIds.includes(productId)
            ? collection.productIds.filter((id) => id !== productId)
            : [...collection.productIds, productId];
          return { ...collection, productIds: nextIds };
        })
      );
    },
    []
  );

  const addProductToCollection = useCallback(
    (collectionId: string, productId: string) => {
      setCollections((prev) =>
        prev.map((collection) => {
          if (collection.id !== collectionId) return collection;
          if (collection.productIds.includes(productId)) return collection;
          return {
            ...collection,
            productIds: [...collection.productIds, productId],
          };
        })
      );
    },
    []
  );

  const removeProductFromCollection = useCallback(
    (collectionId: string, productId: string) => {
      setCollections((prev) =>
        prev.map((collection) => {
          if (collection.id !== collectionId) return collection;
          return {
            ...collection,
            productIds: collection.productIds.filter(
              (id) => id !== productId
            ),
          };
        })
      );
    },
    []
  );

  const getCollectionsForProduct = useCallback(
    (productId: string) =>
      collections.filter((collection) =>
        collection.productIds.includes(productId)
      ),
    [collections]
  );

  const value = useMemo(
    () => ({
      collections,
      createCollection,
      deleteCollection,
      renameCollection,
      isProductInCollection,
      toggleProductInCollection,
      addProductToCollection,
      removeProductFromCollection,
      getCollectionsForProduct,
    }),
    [
      addProductToCollection,
      collections,
      createCollection,
      deleteCollection,
      getCollectionsForProduct,
      isProductInCollection,
      removeProductFromCollection,
      renameCollection,
      toggleProductInCollection,
    ]
  );

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error(
      "useCollections must be used within a CollectionsProvider"
    );
  }
  return context;
}
