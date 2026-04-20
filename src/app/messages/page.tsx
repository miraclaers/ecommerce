"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMessages } from "@/app/context/MessagesContext";

function formatMessageDate(dateIso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateIso));
}

export default function MessagesPage() {
  const { threads, sendMessage, markThreadAsRead } = useMessages();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => {
      const dateA = a.messages[a.messages.length - 1]?.sentAt ?? "";
      const dateB = b.messages[b.messages.length - 1]?.sentAt ?? "";
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [threads]);

  const selectedThread =
    sortedThreads.find((thread) => thread.id === selectedThreadId) ??
    sortedThreads[0] ??
    null;

  useEffect(() => {
    if (!selectedThread) return;
    markThreadAsRead(selectedThread.id);
  }, [selectedThread, markThreadAsRead]);

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    markThreadAsRead(threadId);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedThread) return;
    sendMessage(selectedThread.id, draft);
    setDraft("");
  };

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Messages
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Mock inbox with local storage persistence.
      </p>

      <section className="grid min-h-[560px] grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-[300px,1fr]">
        <aside className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
            Inbox
          </div>
          <ul className="max-h-[520px] overflow-y-auto">
            {sortedThreads.map((thread) => {
              const lastMessage = thread.messages[thread.messages.length - 1];
              const unread = thread.messages.filter(
                (message) => message.sender === "other" && !message.read
              ).length;
              const isSelected = selectedThread?.id === thread.id;
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectThread(thread.id)}
                    className={`w-full border-b border-zinc-100 px-4 py-3 text-left transition dark:border-zinc-800 ${
                      isSelected
                        ? "bg-violet-50 dark:bg-violet-950/20"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                        {thread.name}
                      </p>
                      {unread > 0 ? (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {unread}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {thread.role}
                    </p>
                    <p className="mt-1 truncate text-xs text-zinc-600 dark:text-zinc-300">
                      {lastMessage?.text}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex min-h-0 flex-col rounded-xl border border-zinc-200 dark:border-zinc-800">
          {selectedThread ? (
            <>
              <header className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {selectedThread.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {selectedThread.role}
                </p>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {selectedThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                      message.sender === "me"
                        ? "ml-auto bg-violet-600 text-white"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`mt-1 text-[11px] ${
                        message.sender === "me"
                          ? "text-violet-100"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {formatMessageDate(message.sentAt)}
                    </p>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
              No conversations yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
