"use client";

import { useCallback } from "react";

import { api } from "@/lib/api-client";
import type { DemoEventType } from "@/lib/types";

type TriggerOpts = {
  payload?: Record<string, unknown>;
};

export function useAdmin(sessionId: string | null) {
  const trigger = useCallback(
    async (type: DemoEventType, opts?: TriggerOpts) => {
      if (!sessionId) return;
      await api("/api/trigger", {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          type,
          payload: opts?.payload ?? {},
        }),
      });
    },
    [sessionId]
  );

  const inject = useCallback(
    async (text: string) => {
      if (!sessionId) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      await api("/api/inject", {
        method: "POST",
        body: JSON.stringify({ sessionId, text: trimmed }),
      });
    },
    [sessionId]
  );

  return { trigger, inject };
}
