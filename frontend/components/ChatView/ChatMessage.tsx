import { AlexAvatar } from "../AlexWidget/AlexAvatar";
import type { UiMessage } from "@/hooks/useChat";
import { MarkdownText } from "./MarkdownText";

type Props = {
  msg: UiMessage;
};

export function ChatMessage({ msg }: Props) {
  const isUser = msg.role === "user";
  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 10,
        gap: 8,
      }}
    >
      {!isUser && <AlexAvatar size={28} online={false} />}
      <div
        style={{
          maxWidth: "78%",
          padding: "9px 13px",
          borderRadius: 14,
          borderBottomLeftRadius: isUser ? 14 : 4,
          borderBottomRightRadius: isUser ? 4 : 14,
          background: isUser
            ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
            : "rgba(255,255,255,0.04)",
          color: isUser ? "#0a0e14" : "var(--text)",
          fontSize: 14,
          lineHeight: 1.45,
          fontWeight: isUser ? 600 : 400,
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.05)",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {isUser ? msg.text : <MarkdownText text={msg.text} />}
      </div>
    </div>
  );
}
