"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type RealtimeEvent = {
  type: string;
  payload: Record<string, unknown>;
  at: string;
};

type RealtimeContextType = {
  latestEvent: RealtimeEvent | null;
  sendEvent: (event: Omit<RealtimeEvent, "at">) => void;
  isConnected: boolean;
};

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined
);

export function RealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const socketRef = useRef<WebSocket | null>(null);
  const [latestEvent, setLatestEvent] = useState<RealtimeEvent | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const isSecurePage = window.location.protocol === "https:";

    // Without an explicit URL we only attempt the local dev gateway over plain
    // HTTP. Browsers forbid ws:// from an https:// page, so skip entirely there.
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ??
      (isSecurePage ? null : `ws://${window.location.hostname}:4001`);

    if (!wsUrl) {
      return;
    }

    let socket: WebSocket;
    try {
      socket = new WebSocket(wsUrl);
    } catch {
      // e.g. mixed-content (ws:// from https://) — fail silently instead of
      // crashing the whole app.
      return;
    }
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onerror = () => {
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as RealtimeEvent;
        if (parsed?.type) {
          setLatestEvent(parsed);
        }
      } catch {
        // Ignore non-JSON messages from dev gateways.
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  const value = useMemo<RealtimeContextType>(
    () => ({
      latestEvent,
      isConnected,
      sendEvent: (event) => {
        if (!socketRef.current) return;
        if (socketRef.current.readyState !== WebSocket.OPEN) return;
        socketRef.current.send(
          JSON.stringify({
            ...event,
            at: new Date().toISOString(),
          })
        );
      },
    }),
    [isConnected, latestEvent]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return context;
}
