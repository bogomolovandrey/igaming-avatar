"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BACKEND_URL } from "@/lib/api-client";

export type VoiceStatus =
  | "idle"
  | "recording"
  | "transcribing"
  | "speaking"
  | "error";

export type VoiceHook = {
  supported: boolean;
  status: VoiceStatus;
  interim: string; // unused with Whisper, kept for API compatibility
  micActive: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  enqueueSpeak: (text: string) => void;
  cancelSpeak: () => void;
  error: string | null;
};

type Options = {
  onUserFinal?: (text: string) => void;
};

type QueuedItem = {
  text: string;
  fetchPromise: Promise<string | null>;
};

function pickMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return null;
}

function extFromMime(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "audio";
}

export function useVoice(options: Options = {}): VoiceHook {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeRef = useRef<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<QueuedItem[]>([]);
  const playingRef = useRef(false);
  const generationRef = useRef(0);

  const [supported] = useState(() => {
    if (typeof window === "undefined") return false;
    if (!navigator.mediaDevices?.getUserMedia) return false;
    return Boolean(pickMimeType());
  });

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [micActive, setMicActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── TTS playback queue ──────────────────────────────────────────

  const fetchTtsBlob = useCallback(
    async (text: string, gen: number): Promise<string | null> => {
      try {
        const resp = await fetch(`${BACKEND_URL}/api/voice/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (gen !== generationRef.current) return null;
        if (!resp.ok) throw new Error(`tts ${resp.status}`);
        const blob = await resp.blob();
        if (gen !== generationRef.current) return null;
        return URL.createObjectURL(blob);
      } catch (e) {
        if (gen === generationRef.current) {
          setError(e instanceof Error ? e.message : "tts error");
        }
        return null;
      }
    },
    []
  );

  const playNext = useCallback(async () => {
    if (playingRef.current) return;
    const item = queueRef.current.shift();
    if (!item) {
      setStatus((s) => (s === "speaking" ? "idle" : s));
      return;
    }
    playingRef.current = true;
    setStatus("speaking");
    const url = await item.fetchPromise;
    if (!url) {
      playingRef.current = false;
      void playNext();
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    await new Promise<void>((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
        resolve();
      };
      audio.play().catch(() => {
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
        resolve();
      });
    });
    playingRef.current = false;
    void playNext();
  }, []);

  const enqueueSpeak = useCallback(
    (text: string) => {
      const trimmed = text?.trim();
      if (!trimmed) return;
      const gen = generationRef.current;
      const fetchPromise = fetchTtsBlob(trimmed, gen);
      queueRef.current.push({ text: trimmed, fetchPromise });
      void playNext();
    },
    [fetchTtsBlob, playNext]
  );

  const cancelSpeak = useCallback(() => {
    generationRef.current += 1;
    queueRef.current = [];
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.src = "";
      audioRef.current = null;
    }
    playingRef.current = false;
    setStatus((s) => (s === "speaking" ? "idle" : s));
  }, []);

  // ─── Recording → Whisper STT ─────────────────────────────────────

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const transcribeAndEmit = useCallback(async (blob: Blob, mime: string) => {
    setStatus("transcribing");
    try {
      const fd = new FormData();
      fd.append(
        "file",
        new File([blob], `audio.${extFromMime(mime)}`, { type: mime })
      );
      const resp = await fetch(`${BACKEND_URL}/api/voice/stt`, {
        method: "POST",
        body: fd,
      });
      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        throw new Error(`stt ${resp.status}: ${body.slice(0, 120)}`);
      }
      const data = (await resp.json()) as { text: string };
      const text = (data.text || "").trim();
      if (text) {
        optionsRef.current.onUserFinal?.(text);
      }
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "stt error");
      setStatus("error");
    }
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    if (!supported) {
      setError(
        "MediaRecorder не поддерживается этим браузером (нужен Chrome/Edge/Safari современной версии)"
      );
      setStatus("error");
      return;
    }
    cancelSpeak();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mime = pickMimeType()!;
      mimeRef.current = mime;
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const mimeUsed = mimeRef.current || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeUsed });
        chunksRef.current = [];
        recorderRef.current = null;
        stopTracks();
        if (blob.size > 0) {
          await transcribeAndEmit(blob, mimeUsed);
        } else {
          setStatus("idle");
        }
      };
      recorder.start();
      setMicActive(true);
      setStatus("recording");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "mic error";
      setError(msg);
      setStatus("error");
      stopTracks();
    }
  }, [cancelSpeak, supported, transcribeAndEmit]);

  const stopListening = useCallback(async () => {
    setMicActive(false);
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        /* ignore */
      }
    } else {
      stopTracks();
      setStatus((s) => (s === "recording" ? "idle" : s));
    }
  }, []);

  useEffect(() => {
    return () => {
      try {
        recorderRef.current?.stop();
      } catch {
        /* ignore */
      }
      stopTracks();
      cancelSpeak();
    };
  }, [cancelSpeak]);

  return {
    supported,
    status,
    interim: "",
    micActive,
    startListening,
    stopListening,
    enqueueSpeak,
    cancelSpeak,
    error,
  };
}
