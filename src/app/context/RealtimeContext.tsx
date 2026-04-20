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
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4001";
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onclose = () => {
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
