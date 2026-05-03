"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { api } from "@/lib/api-client";

export type AnamStatus = "idle" | "starting" | "connected" | "error";

export type AnamAvatarHook = {
  videoRef: RefObject<HTMLVideoElement | null>;
  videoElementId: string;
  status: AnamStatus;
  connected: boolean;
  hasVideo: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  interrupt: () => void;
  beginSpeech: (correlationId?: string) => boolean;
  streamSpeechChunk: (chunk: string) => Promise<void>;
  endSpeech: () => Promise<void>;
  speakText: (text: string) => Promise<void>;
};

type AnamSessionTokenResponse = {
  sessionToken: string;
  sessionId?: string | null;
};

type AnamSdk = {
  createClient: (
    sessionToken: string,
    options?: Record<string, unknown>
  ) => AnamClient;
  AnamEvent: Record<string, string>;
};

type AnamClient = {
  streamToVideoElement: (elementId: string) => Promise<void>;
  stopStreaming: () => Promise<void>;
  addListener: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  interruptPersona: () => void;
  createTalkMessageStream: (correlationId?: string) => TalkMessageStream;
  talk: (text: string) => Promise<void> | void;
};

type TalkMessageStream = {
  streamMessageChunk: (
    content: string,
    endOfSpeech: boolean
  ) => Promise<void> | void;
  endMessage: () => Promise<void> | void;
  isActive: () => boolean;
};

function makeVideoId() {
  return `anam-video-${Math.random().toString(36).slice(2)}`;
}

function userFacingError(e: unknown): string {
  if (!(e instanceof Error)) return "Anam error";
  const raw = e.message;
  const jsonStart = raw.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const payload = JSON.parse(raw.slice(jsonStart)) as { detail?: unknown };
      if (typeof payload.detail === "string" && payload.detail.trim()) {
        return payload.detail.trim();
      }
    } catch {
      // Fall back to the original message below.
    }
  }
  return raw;
}

export function useAnamAvatar(sessionId: string | null): AnamAvatarHook {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoElementIdRef = useRef(makeVideoId());
  const clientRef = useRef<AnamClient | null>(null);
  const talkStreamRef = useRef<TalkMessageStream | null>(null);
  const streamQueueRef = useRef<Promise<void>>(Promise.resolve());

  const [status, setStatus] = useState<AnamStatus>("idle");
  const [hasVideo, setHasVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearTalkStream = useCallback(() => {
    talkStreamRef.current = null;
    streamQueueRef.current = Promise.resolve();
  }, []);

  const interrupt = useCallback(() => {
    clearTalkStream();
    try {
      clientRef.current?.interruptPersona();
    } catch {
      // Ignore stale-session interruptions; the next stream will surface errors.
    }
  }, [clearTalkStream]);

  const stop = useCallback(async () => {
    const client = clientRef.current;
    clientRef.current = null;
    clearTalkStream();
    setHasVideo(false);
    setError(null);
    setStatus("idle");
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (client) {
      await client.stopStreaming().catch(() => undefined);
    }
  }, [clearTalkStream]);

  const start = useCallback(async () => {
    if (!sessionId || status === "starting" || status === "connected") return;

    setStatus("starting");
    setError(null);
    setHasVideo(false);

    try {
      const data = await api<AnamSessionTokenResponse>("/api/anam/session-token", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
      if (!data.sessionToken) {
        throw new Error("Anam session-token response is incomplete");
      }

      const sdk = (await import("@anam-ai/js-sdk")) as unknown as AnamSdk;
      const client = sdk.createClient(data.sessionToken, {
        disableInputAudio: true,
      });
      clientRef.current = client;

      client.addListener(sdk.AnamEvent.SESSION_READY, () => {
        setStatus("connected");
      });
      client.addListener(sdk.AnamEvent.CONNECTION_ESTABLISHED, () => {
        setStatus("connected");
      });
      client.addListener(sdk.AnamEvent.VIDEO_STREAM_STARTED, () => {
        setHasVideo(true);
      });
      client.addListener(sdk.AnamEvent.VIDEO_PLAY_STARTED, () => {
        setHasVideo(true);
      });
      client.addListener(
        sdk.AnamEvent.CONNECTION_CLOSED,
        (reason?: unknown, details?: unknown) => {
          clientRef.current = null;
          clearTalkStream();
          setHasVideo(false);
          setStatus("idle");
          if (reason && String(reason).toLowerCase().includes("failure")) {
            setError(String(details || reason));
            setStatus("error");
          }
        }
      );

      await client.streamToVideoElement(videoElementIdRef.current);
      setStatus((current) => (current === "starting" ? "connected" : current));
    } catch (e) {
      clientRef.current = null;
      clearTalkStream();
      setHasVideo(false);
      setError(userFacingError(e));
      setStatus("error");
    }
  }, [clearTalkStream, sessionId, status]);

  const beginSpeech = useCallback(
    (correlationId?: string): boolean => {
      const client = clientRef.current;
      if (!client || status !== "connected") return false;
      interrupt();
      try {
        talkStreamRef.current = client.createTalkMessageStream(correlationId);
        streamQueueRef.current = Promise.resolve();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Anam talk stream error");
        return false;
      }
    },
    [interrupt, status]
  );

  const streamSpeechChunk = useCallback(async (chunk: string) => {
    const content = chunk;
    if (!content) return;
    streamQueueRef.current = streamQueueRef.current
      .then(async () => {
        const stream = talkStreamRef.current;
        if (!stream?.isActive()) return;
        await stream.streamMessageChunk(content, false);
      })
      .catch(() => undefined);
    await streamQueueRef.current;
  }, []);

  const endSpeech = useCallback(async () => {
    streamQueueRef.current = streamQueueRef.current
      .then(async () => {
        const stream = talkStreamRef.current;
        if (stream?.isActive()) {
          await stream.endMessage();
        }
        talkStreamRef.current = null;
      })
      .catch(() => {
        talkStreamRef.current = null;
      });
    await streamQueueRef.current;
  }, []);

  const speakText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      const client = clientRef.current;
      if (!trimmed || !client || status !== "connected") return;
      interrupt();
      await client.talk(trimmed);
    },
    [interrupt, status]
  );

  useEffect(() => {
    return () => {
      const client = clientRef.current;
      clientRef.current = null;
      if (client) {
        void client.stopStreaming().catch(() => undefined);
      }
    };
  }, []);

  return {
    videoRef,
    videoElementId: videoElementIdRef.current,
    status,
    connected: status === "connected",
    hasVideo,
    error,
    start,
    stop,
    interrupt,
    beginSpeech,
    streamSpeechChunk,
    endSpeech,
    speakText,
  };
}
