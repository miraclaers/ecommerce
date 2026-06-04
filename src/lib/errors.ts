export type AppErrorCode =
  | "NETWORK"
  | "TIMEOUT"
  | "HTTP"
  | "PARSE"
  | "UNKNOWN";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status?: number;
  readonly isRetryable: boolean;

  constructor(
    message: string,
    options: {
      code?: AppErrorCode;
      status?: number;
      isRetryable?: boolean;
      cause?: unknown;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.code = options.code ?? "UNKNOWN";
    this.status = options.status;
    this.isRetryable = options.isRetryable ?? false;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function fromResponse(
  status: number,
  payload: { error?: string }
): AppError {
  const message =
    typeof payload.error === "string"
      ? payload.error
      : `Request failed: ${status}`;
  const retryable = status === 429 || status === 502 || status === 503;
  return new AppError(message, {
    code: "HTTP",
    status,
    isRetryable: retryable,
  });
}
