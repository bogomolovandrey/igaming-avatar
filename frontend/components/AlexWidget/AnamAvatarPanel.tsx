"use client";

import type { AnamAvatarHook } from "@/hooks/useAnamAvatar";

type Props = {
  avatar: AnamAvatarHook;
};

export function AnamAvatarPanel({ avatar }: Props) {
  const active = avatar.status === "connected" || avatar.status === "starting";
  const statusText =
    avatar.error ??
    (avatar.status === "connected"
      ? "видео онлайн · текст"
      : avatar.status === "starting"
        ? "подключаю видео..."
        : "видео аватар");

  return (
    <div
      style={{
        flexShrink: 0,
        padding: "10px 14px 0",
        background: "rgba(5,7,12,0.4)",
      }}
    >
      <div
        style={{
          position: "relative",
          height: active ? 246 : 96,
          minHeight: active ? 246 : 96,
          border: active
            ? "1px solid rgba(16,185,129,0.35)"
            : "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          background: "#05070a",
          overflow: "hidden",
          transition: "height 180ms ease, min-height 180ms ease",
        }}
      >
        <video
          id={avatar.videoElementId}
          ref={avatar.videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
            background: "#05070a",
          }}
        />

        {(!active || !avatar.hasVideo) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: "var(--text-dim)",
              fontSize: 12,
              background: "#05070a",
            }}
          >
            {avatar.status === "starting" ? "подключаю видео..." : "видео аватар"}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            bottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 8px",
            borderRadius: 7,
            background: "rgba(5,7,10,0.72)",
            backdropFilter: "blur(8px)",
            pointerEvents: "none",
          }}
        >
          <StatusDot status={avatar.status} />
          <StatusText text={statusText} error={Boolean(avatar.error)} />
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: AnamAvatarHook["status"] }) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: 99,
        background:
          status === "connected"
            ? "var(--success)"
            : status === "error"
              ? "var(--error)"
              : "var(--text-mute)",
        flexShrink: 0,
      }}
    />
  );
}

function StatusText({ text, error }: { text: string; error: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        fontSize: 12,
        color: error ? "#fca5a5" : "var(--text-dim)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {text}
    </div>
  );
}
