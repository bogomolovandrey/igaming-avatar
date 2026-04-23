"use client";

import { useEffect } from "react";

import { useIsMobile } from "@/hooks/useIsMobile";
import { characters } from "@/lib/characters";
import { CharCard } from "./CharCard";

type Props = { onClose: () => void };

export function CharacterGallery({ onClose }: Props) {
  const mobile = useIsMobile();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const cols = mobile ? 2 : 3;

  return (
    <div
      className="fade-in"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(5,7,12,0.78)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: mobile ? "stretch" : "center",
        padding: mobile ? 0 : 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-alt)",
          border: mobile ? "none" : "1px solid var(--border-strong)",
          borderRadius: mobile ? 0 : 16,
          width: mobile ? "100%" : 820,
          maxWidth: "100%",
          height: mobile ? "100%" : "auto",
          maxHeight: mobile ? "100%" : "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            padding: mobile ? "18px 16px 14px" : "20px 24px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background:
              "linear-gradient(180deg, rgba(99,102,241,0.05) 0%, transparent 100%)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: "var(--gold)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Команда
            </div>
            <h2
              style={{
                margin: "4px 0 0",
                fontSize: mobile ? 18 : 22,
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              Твоя команда компаньонов
            </h2>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            className="btn-hover"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-dim)",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: mobile ? 14 : 24,
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: mobile ? 10 : 14,
          }}
        >
          {characters.map((c) => (
            <CharCard key={c.id} c={c} mobile={mobile} />
          ))}
        </div>

        <div
          style={{
            padding: mobile ? "12px 16px" : "14px 24px",
            borderTop: "1px solid var(--border)",
            fontSize: 11.5,
            color: "var(--text-mute)",
            textAlign: "center",
          }}
        >
          {characters.filter((c) => !c.active).length} персонажа в разработке ·
          портреты — Gemini Image
        </div>
      </div>
    </div>
  );
}
