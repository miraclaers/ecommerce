"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MessageThread } from "@/lib/types";

type MessagesContextType = {
  threads: MessageThread[];
  sendMessage: (threadId: string, text: string) => void;
  markThreadAsRead: (threadId: string) => void;
  unreadCount: number;
};

const messagesStorageKey = "minishop_messages";

const seededThreads: MessageThread[] = [
  {
    id: "support",
    name: "MiniShop Support",
    role: "Customer care",
    messages: [
      {
        id: "support-1",
        sender: "other",
        text: "Hey Alex! Your recent order has been confirmed. Need help with anything else?",
        sentAt: "2026-04-20T09:20:00.000Z",
        read: false,
      },
      {
        id: "support-2",
        sender: "me",
        text: "Thanks! Everything looks good so far.",
        sentAt: "2026-04-20T09:24:00.000Z",
        read: true,
      },
    ],
  },
  {
    id: "shipping",
    name: "Shipping Updates",
    role: "Delivery bot",
    messages: [
      {
        id: "shipping-1",
        sender: "other",
        text: "Your package is in transit and should arrive tomorrow before 6 PM.",
        sentAt: "2026-04-19T16:45:00.000Z",
        read: false,
      },
    ],
  },
  {
    id: "deals",
    name: "Deals Team",
    role: "Promotions",
    messages: [
      {
        id: "deals-1",
        sender: "other",
        text: "Weekend flash sale starts now. Extra 20% off on accessories!",
        sentAt: "2026-04-18T14:10:00.000Z",
        read: true,
      },
    ],
  },
];

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);

function isValidThreads(value: unknown): value is MessageThread[] {
  return (
    Array.isArray(value) &&
    value.every(
      (thread) =>
        thread &&
        typeof thread.id === "string" &&
        typeof thread.name === "string" &&
        typeof thread.role === "string" &&
        Array.isArray(thread.messages)
    )
  );
}

function parseStoredThreads(raw: string | null): MessageThread[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!isValidThreads(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function MessagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [threads, setThreads] = useState<MessageThread[]>(() => {
    if (typeof window === "undefined") return seededThreads;
    return (
      parseStoredThreads(
        window.localStorage.getItem(messagesStorageKey)
      ) ?? seededThreads
    );
  });

  useEffect(() => {
    window.localStorage.setItem(messagesStorageKey, JSON.stringify(threads));
  }, [threads]);

  const sendMessage = useCallback((threadId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        const nextMessage = {
          id: crypto.randomUUID(),
          sender: "me" as const,
          text: trimmed,
          sentAt: new Date().toISOString(),
          read: true,
        };
        return {
          ...thread,
          messages: [...thread.messages, nextMessage],
        };
      })
    );
  }, []);

  const markThreadAsRead = useCallback((threadId: string) => {
    setThreads((prev) => {
      let changed = false;
      const next = prev.map((thread) => {
        if (thread.id !== threadId) return thread;

        const hasUnread = thread.messages.some(
          (message) => message.sender === "other" && !message.read
        );
        if (!hasUnread) return thread;

        changed = true;
        return {
          ...thread,
          messages: thread.messages.map((message) =>
            message.sender === "other" ? { ...message, read: true } : message
          ),
        };
      });

      return changed ? next : prev;
    });
  }, []);

  const unreadCount = useMemo(
    () =>
      threads.reduce(
        (total, thread) =>
          total +
          thread.messages.filter(
            (message) => message.sender === "other" && !message.read
          ).length,
        0
      ),
    [threads]
  );

  return (
    <MessagesContext.Provider
      value={{ threads, sendMessage, markThreadAsRead, unreadCount }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
}
