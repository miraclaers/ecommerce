"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiState } from "@/lib/api-state";
import { AppError, isAppError } from "@/lib/errors";

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  deps: unknown[] = []
): ApiState<T> & { reload: () => void } {
  const [state, setState] = useState<ApiState<T>>({ status: "idle" });

  const load = useCallback(() => {
    setState({ status: "loading" });
    loader()
      .then((data) => setState({ status: "success", data }))
      .catch((error: unknown) => {
        const appError = isAppError(error)
          ? error
          : new AppError(
              error instanceof Error ? error.message : "Request failed"
            );
        setState({ status: "error", error: appError });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
