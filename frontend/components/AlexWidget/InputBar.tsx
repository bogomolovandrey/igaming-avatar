"use client";

import { useState } from "react";

type Props = {
  onSend: (text: string) => void;
  micActive?: boolean;
  interim?: string;
  onMicDown?: () => void;
  onMicUp?: () => void;
  disabled?: boolean;
};

export function InputBar({
  onSend,
  micActive = false,
  interim,
  onMicDown,
  onMicUp,
  disabled,
}: Props) {
  const [val, setVal] = useState("");

  const submit = () => {
    const trimmed = val.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setVal("");
  };

  // When user typed something we swap the mic for a send button.
  const showSend = val.trim().length > 0 && !micActive;

  return (
    <div
      style={{
        padding: "10px 12px calc(12px + env(safe-area-inset-bottom))",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.25)",
        flexShrink: 0,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          background: "#0c1220",
          border: "1px solid var(--border-strong)",
          borderRadius: 999,
          padding: "8px 14px",
        }}
      >
        <input
          value={micActive ? interim ?? "" : val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Напиши Алексу…"
          readOnly={micActive}
          disabled={disabled}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: micActive ? "var(--text-dim)" : "var(--text)",
            fontSize: 14,
            outline: "none",
            fontStyle: micActive ? "italic" : "normal",
            fontFamily: "inherit",
            opacity: disabled ? 0.5 : 1,
          }}
        />
      </div>
      {showSend ? (
        <button
          type="button"
          onClick={submit}
          title="Отправить"
          aria-label="Отправить"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            border: "none",
            cursor: "pointer",
            color: "#0a0e14",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(251,191,36,0.3)",
            transition: "all 180ms ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 13.5L14 8L2 2.5L2 7L11 8L2 9L2 13.5Z"
              fill="currentColor"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onMicDown?.();
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            onMicUp?.();
          }}
          onMouseLeave={() => {
            if (micActive) onMicUp?.();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            onMicDown?.();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onMicUp?.();
          }}
          title="Зажми и говори"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: micActive
              ? "linear-gradient(135deg, #ec4899, #6366f1)"
              : "linear-gradient(135deg, #fbbf24, #f59e0b)",
            border: "none",
            cursor: "pointer",
            color: "#0a0e14",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            boxShadow: micActive
              ? "0 0 0 4px rgba(236,72,153,0.25)"
              : "0 4px 12px rgba(251,191,36,0.3)",
            transition: "all 180ms ease",
          }}
        >
          {micActive ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#0a0e14",
              }}
            >
              <div className="mic-bar" />
              <div className="mic-bar" />
              <div className="mic-bar" />
              <div className="mic-bar" />
              <div className="mic-bar" />
            </div>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect
                x="5"
                y="2"
                width="6"
                height="8"
                rx="3"
                fill="currentColor"
              />
              <path
                d="M3 7a5 5 0 0010 0M8 12v2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
