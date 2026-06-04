type LogLevel = "info" | "warn" | "error";

type LogPayload = Record<string, unknown>;

export function log(
  level: LogLevel,
  message: string,
  payload: LogPayload = {}
): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}
