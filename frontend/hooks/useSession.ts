"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api-client";
import { readCookie, writeCookie } from "@/lib/cookies";
import type { SessionState } from "@/lib/types";

const COOKIE_NAME = "alex_session";
const COOKIE_TTL = 24 * 60 * 60;

export type SessionHook = {
  session: SessionState | null;
  setSession: React.Dispatch<React.SetStateAction<SessionState | null>>;
  error: Error | null;
};

export function useSession(): SessionHook {
  const [session, setSession] = useState<SessionState | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    const existing = readCookie(COOKIE_NAME);
    api<SessionState>("/api/session", {
      method: "POST",
      body: JSON.stringify({ sessionId: existing }),
    })
      .then((s) => {
        if (cancelled) return;
        setSession(s);
        writeCookie(COOKIE_NAME, s.id, COOKIE_TTL);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { session, setSession, error };
}
