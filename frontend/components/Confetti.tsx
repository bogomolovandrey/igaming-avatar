"use client";

import { useEffect, useState } from "react";

const COLORS = [
  "#fbbf24",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
  "#10b981",
  "#fcd34d",
];

type Piece = {
  id: number;
  left: string;
  dx: string;
  duration: string;
  delay: string;
  color: string;
};

export function Confetti({
  active,
  durationMs = 2400,
  count = 80,
  onDone,
}: {
  active: boolean;
  durationMs?: number;
  count?: number;
  onDone?: () => void;
}) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) return;
    const next: Piece[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      dx: `${(Math.random() - 0.5) * 220}px`,
      duration: `${(durationMs / 1000) * (0.85 + Math.random() * 0.45)}s`,
      delay: `${Math.random() * 0.4}s`,
      color: COLORS[i % COLORS.length],
    }));
    setPieces(next);
    const t = window.setTimeout(() => {
      setPieces([]);
      onDone?.();
    }, durationMs + 600);
    return () => window.clearTimeout(t);
  }, [active, count, durationMs, onDone]);

  if (pieces.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 200,
      }}
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetto"
          style={
            {
              left: p.left,
              background: p.color,
              "--dx": p.dx,
              "--dur": p.duration,
              animationDelay: p.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
