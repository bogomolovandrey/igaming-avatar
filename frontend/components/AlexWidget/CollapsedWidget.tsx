"use client";

import type { Mode } from "@/lib/types";
import { AlexAvatar } from "./AlexAvatar";
import { SpeechBubble } from "./SpeechBubble";

type Props = {
  onOpen: () => void;
  bubble?: string | null;
  onCloseBubble?: () => void;
  mode?: Mode;
  position?: "left" | "right";
};

export function CollapsedWidget({
  onOpen,
  bubble,
  onCloseBubble,
  mode,
  position = "right",
}: Props) {
  const ringPulse = !bubble;
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 90,
        bottom: 24,
        ...(position === "left" ? { left: 24 } : { right: 24 }),
      }}
    >
      {bubble && (
        <SpeechBubble
          text={bubble}
          onClick={onOpen}
          onClose={onCloseBubble ?? (() => undefined)}
        />
      )}
      <button
        onClick={onOpen}
        className={mode === "rg_care" ? "rg-glow" : undefined}
        style={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          position: "relative",
        }}
      >
        <AlexAvatar size={68} online pulse={ringPulse} />
      </button>
    </div>
  );
}
