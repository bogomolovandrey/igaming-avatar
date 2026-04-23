"use client";

import { useCallback, useState } from "react";

import { BACKEND_URL } from "@/lib/api-client";
import { parseSSE } from "@/lib/sse";

export type UiMessage = {
  role: "user" | "alex";
  text: string;
  voicePlayback?: boolean;
};

export type ChatHook = {
  messages: UiMessage[];
  streaming: boolean;
  streamingText: string;
  send: (text: string, hooks?: StreamHooks) => Promise<void>;
  appendUser: (text: string) => void;
  startProactive: () => void;
  appendDelta: (delta: string) => void;
  finishProactive: (full: string) => void;
  reset: () => void;
};

export type StreamHooks = {
  onDelta?: (delta: string) => void;
  onFinish?: (full: string) => void;
};

export function useChat(sessionId: string | null): ChatHook {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  const appendUser = useCallback((text: string) => {
    setMessages((prev) => [...prev, { role: "user", text }]);
  }, []);

  const startProactive = useCallback(() => {
    setStreaming(true);
    setStreamingText("");
  }, []);

  const appendDelta = useCallback((delta: string) => {
    setStreamingText((prev) => prev + delta);
  }, []);

  const finishProactive = useCallback((full: string) => {
    setMessages((prev) =>
      full ? [...prev, { role: "alex", text: full }] : prev
    );
    setStreaming(false);
    setStreamingText("");
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setStreaming(false);
    setStreamingText("");
  }, []);

  const send = useCallback(
    async (text: string, hooks?: StreamHooks) => {
      if (!sessionId) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      appendUser(trimmed);
      startProactive();

      try {
        const resp = await fetch(`${BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, text: trimmed }),
        });
        if (!resp.ok) {
          throw new Error(`backend ${resp.status}`);
        }
        let acc = "";
        for await (const evt of parseSSE(resp)) {
          if (evt.event === "delta") {
            const payload = JSON.parse(evt.data) as { text: string };
            acc += payload.text;
            setStreamingText(acc);
            hooks?.onDelta?.(payload.text);
          } else if (evt.event === "done") {
            finishProactive(acc);
            hooks?.onFinish?.(acc);
            return;
          } else if (evt.event === "error") {
            const payload = JSON.parse(evt.data) as { message?: string };
            const msg = `Что-то пошло не так: ${payload.message ?? "ошибка"}`;
            finishProactive(msg);
            hooks?.onFinish?.(msg);
            return;
          }
        }
        // Stream ended without explicit done — flush whatever we have
        finishProactive(acc);
        hooks?.onFinish?.(acc);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "ошибка";
        const failureText = `Не получилось ответить (${msg}).`;
        finishProactive(failureText);
        hooks?.onFinish?.(failureText);
      }
    },
    [sessionId, appendUser, startProactive, finishProactive]
  );

  return {
    messages,
    streaming,
    streamingText,
    send,
    appendUser,
    startProactive,
    appendDelta,
    finishProactive,
    reset,
  };
}
