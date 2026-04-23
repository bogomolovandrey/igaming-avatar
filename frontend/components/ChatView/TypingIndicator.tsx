import { AlexAvatar } from "../AlexWidget/AlexAvatar";

export function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <AlexAvatar size={28} online={false} />
      <div
        style={{
          padding: "11px 16px",
          borderRadius: 14,
          borderBottomLeftRadius: 4,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}
