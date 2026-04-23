"use client";

import { AlexAvatar } from "./AlexAvatar";

type Props = {
  mobile?: boolean;
  onClose: () => void;
};

export function WidgetHeader({ mobile = false, onClose }: Props) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background:
          "linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(236,72,153,0.03) 100%)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}
    >
      {mobile && (
        <button
          onClick={onClose}
          className="btn-hover"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-dim)",
            cursor: "pointer",
            fontSize: 20,
            padding: 0,
            width: 28,
          }}
        >
          ↓
        </button>
      )}
      <AlexAvatar size={mobile ? 34 : 40} online />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}
        >
          Алекс
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--success)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: "var(--success)",
            }}
          />
          онлайн · AI компаньон
        </div>
      </div>
      {!mobile && (
        <button
          onClick={onClose}
          className="btn-hover"
          title="Свернуть"
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            cursor: "pointer",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "var(--text-dim)",
            fontSize: 16,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
