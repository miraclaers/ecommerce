import type { AppError } from "@/lib/errors";

export type ApiState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: AppError };

export function isApiSuccess<T>(
  state: ApiState<T>
): state is { status: "success"; data: T } {
  return state.status === "success";
}

export function isApiError<T>(
  state: ApiState<T>
): state is { status: "error"; error: AppError } {
  return state.status === "error";
}
