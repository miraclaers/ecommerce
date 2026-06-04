"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  serialize: (value: T) => string = JSON.stringify,
  deserialize: (raw: string) => T = JSON.parse
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    const raw = window.localStorage.getItem(key);
    if (!raw) return initialValue;
    try {
      return deserialize(raw);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, serialize(value));
  }, [key, serialize, value]);

  const setStored = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) =>
        typeof next === "function" ? (next as (p: T) => T)(prev) : next
      );
    },
    []
  );

  return [value, setStored];
}
