"use client";

type Props = {
  text: string;
  onClick: () => void;
  onClose: () => void;
};

export function SpeechBubble({ text, onClick, onClose }: Props) {
  return (
    <div
      className="bubble-in"
      onClick={onClick}
      style={{
        position: "absolute",
        bottom: 88,
        right: 0,
        maxWidth: 260,
        minWidth: 200,
        background: "rgba(26,31,46,0.94)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        borderBottomRightRadius: 4,
        padding: "12px 14px",
        color: "var(--text)",
        fontSize: 13,
        lineHeight: 1.45,
        cursor: "pointer",
        boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>{text}</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-mute)",
            cursor: "pointer",
            fontSize: 14,
            padding: 0,
            lineHeight: 1,
            marginTop: -2,
          }}
        >
          ×
        </button>
      </div>
      <div
        style={{
          fontSize: 10.5,
          color: "var(--text-mute)",
          marginTop: 6,
          letterSpacing: "0.03em",
        }}
      >
        Нажми, чтобы ответить
      </div>
    </div>
  );
}
