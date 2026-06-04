"use client";

import { useCallback, useState } from "react";
import type { ApiState } from "@/lib/api-state";
import { AppError, isAppError } from "@/lib/errors";

type MutationState<T> = ApiState<T> & {
  mutate: () => Promise<T | undefined>;
  reset: () => void;
};

export function useApiMutation<T>(
  mutator: () => Promise<T>
): MutationState<T> {
  const [state, setState] = useState<ApiState<T>>({ status: "idle" });

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const mutate = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await mutator();
      setState({ status: "success", data });
      return data;
    } catch (error: unknown) {
      const appError = isAppError(error)
        ? error
        : new AppError(
            error instanceof Error ? error.message : "Mutation failed"
          );
      setState({ status: "error", error: appError });
      return undefined;
    }
  }, [mutator]);

  return { ...state, mutate, reset };
}
