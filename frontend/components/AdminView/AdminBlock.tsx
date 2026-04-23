"use client";

import { useState, type ReactNode } from "react";

type Props = {
  title: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function AdminBlock({
  title,
  collapsible,
  defaultOpen = true,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10,
        marginBottom: 10,
      }}
    >
      <button
        onClick={() => collapsible && setOpen(!open)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "10px 12px",
          color: "var(--text-dim)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: collapsible ? "pointer" : "default",
        }}
      >
        <span>{title}</span>
        {collapsible && (
          <span style={{ fontSize: 10 }}>{open ? "▾" : "▸"}</span>
        )}
      </button>
      {open && <div style={{ padding: "0 12px 12px" }}>{children}</div>}
    </div>
  );
}
