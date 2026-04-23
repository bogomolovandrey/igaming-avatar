"use client";

import { useState } from "react";

type Props = { id: string };

export function SessionChip({ id }: Props) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      onClick={() => {
        navigator.clipboard?.writeText(id);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="mono"
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        zIndex: 3,
        background: "rgba(10,14,20,0.85)",
        backdropFilter: "blur(8px)",
        border: "1px solid var(--border)",
        borderRadius: 3,
        padding: "5px 9px",
        fontSize: 10.5,
        color: "var(--text-mute)",
        cursor: "pointer",
        userSelect: "none",
        letterSpacing: "0.02em",
      }}
    >
      {copied ? "copied" : `sess · ${id}`}
    </div>
  );
}
