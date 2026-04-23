"use client";

import { useEffect, useRef } from "react";

import { BACKEND_URL } from "@/lib/api-client";
import { parseSSE } from "@/lib/sse";
import type { Bonus, Mode } from "@/lib/types";

export type StateUpdate = {
  mode: Mode;
  balance: number;
  loginCount: number;
  activeBonuses: Bonus[];
};

export type UiHint =
  | { kind: "celebration"; payout?: number; newBalance?: number | null }
  | { kind: "rg_care_enter" }
  | { kind: "freebet_nudge"; amount?: number; expires_in_hours?: number }
  | { kind: "open_gallery" }
  | { kind: "reset" };

export type EventHandlers = {
  onState?: (s: StateUpdate) => void;
  onUiHint?: (h: UiHint) => void;
  onAlexMessageStart?: () => void;
  onAlexMessageDelta?: (delta: string) => void;
  onAlexMessageDone?: (text: string) => void;
  onUserMessage?: (text: string) => void;
  onError?: (err: string) => void;
};

export function useEvents(
  sessionId: string | null,
  handlers: EventHandlers
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!sessionId) return;
    const abort = new AbortController();

    (async () => {
      try {
        const resp = await fetch(
          `${BACKEND_URL}/api/events?sessionId=${encodeURIComponent(sessionId)}`,
          { signal: abort.signal }
        );
        if (!resp.ok) {
          throw new Error(`events stream HTTP ${resp.status}`);
        }
        for await (const evt of parseSSE(resp, abort.signal)) {
          const h = handlersRef.current;
          switch (evt.event) {
            case "state":
              h.onState?.(JSON.parse(evt.data) as StateUpdate);
              break;
            case "ui":
              h.onUiHint?.(JSON.parse(evt.data) as UiHint);
              break;
            case "message-start":
              h.onAlexMessageStart?.();
              break;
            case "message-delta": {
              const { text } = JSON.parse(evt.data) as { text: string };
              h.onAlexMessageDelta?.(text);
              break;
            }
            case "message-done": {
              const { text } = JSON.parse(evt.data) as { text: string };
              h.onAlexMessageDone?.(text);
              break;
            }
            case "user-message": {
              const { text } = JSON.parse(evt.data) as { text: string };
              h.onUserMessage?.(text);
              break;
            }
            case "message-error": {
              const { message } = JSON.parse(evt.data) as { message?: string };
              h.onError?.(message ?? "unknown error");
              break;
            }
          }
        }
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
        handlersRef.current.onError?.(
          err instanceof Error ? err.message : "events stream lost"
        );
      }
    })();

    return () => abort.abort();
  }, [sessionId]);
}
