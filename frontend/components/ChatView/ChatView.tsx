"use client";

import { useEffect, useRef } from "react";

import type { UiMessage } from "@/hooks/useChat";
import type { Mode } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";

type Props = {
  messages: UiMessage[];
  streamingText: string;
  streaming: boolean;
  micActive?: boolean;
  interim?: string;
  mode: Mode;
};

export function ChatView({
  messages,
  streamingText,
  streaming,
  micActive,
  interim,
  mode,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, streaming, streamingText]);

  const isRg = mode === "rg_care";

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: isRg
          ? "linear-gradient(180deg, rgba(245,158,11,0.04) 0%, transparent 40%)"
          : "transparent",
      }}
    >
      {isRg && (
        <div
          style={{
            margin: "10px 14px 0",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 11.5,
            color: "#fcd34d",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span>🫂</span>
          <span>Режим заботы · Алекс рядом</span>
        </div>
      )}

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 14px 6px",
        }}
      >
        {messages.length === 0 && !streaming && (
          <div
            style={{
              color: "var(--text-mute)",
              fontSize: 13,
              padding: "12px 4px",
              lineHeight: 1.5,
            }}
          >
            Привет! Я Алекс. Спроси что угодно про спорт и ставки —
            или зажми микрофон.
          </div>
        )}
        {messages.map((m, i) => (
          <ChatMessage key={i} msg={m} />
        ))}
        {streaming && streamingText && (
          <ChatMessage msg={{ role: "alex", text: streamingText }} />
        )}
        {streaming && !streamingText && <TypingIndicator />}
      </div>

      {micActive && (
        <div
          style={{
            padding: "8px 14px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(236,72,153,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#fb7185",
              fontWeight: 700,
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            СЛУШАЮ…
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-dim)",
              fontStyle: "italic",
            }}
          >
            {interim || "…"}
          </div>
        </div>
      )}
    </div>
  );
}
