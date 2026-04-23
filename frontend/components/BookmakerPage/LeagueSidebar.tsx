"use client";

import { leagues, matches } from "@/lib/demo-state";
import { sportTag } from "@/lib/format";
import { SportTag } from "./atoms";

export const ALL_LEAGUES = "__all__";

type Props = {
  activeLeague: string;
  onSelect: (league: string) => void;
};

export function LeagueSidebar({ activeLeague, onSelect }: Props) {
  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        padding: "20px 0",
        height: "calc(100vh - 58px)",
        overflow: "auto",
        position: "sticky",
        top: 58,
      }}
    >
      <div
        className="mono"
        style={{
          padding: "0 18px 14px",
          fontSize: 10,
          fontWeight: 500,
          color: "var(--text-mute)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Top leagues
      </div>
      <button
        type="button"
        onClick={() => onSelect(ALL_LEAGUES)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 18px",
          fontSize: 13,
          color:
            activeLeague === ALL_LEAGUES
              ? "var(--text)"
              : "var(--text-dim)",
          background:
            activeLeague === ALL_LEAGUES
              ? "rgba(251,191,36,0.06)"
              : "transparent",
          border: "none",
          textAlign: "left",
          borderLeft:
            activeLeague === ALL_LEAGUES
              ? "2px solid var(--gold)"
              : "2px solid transparent",
          cursor: "pointer",
          transition: "background 140ms ease, color 140ms ease",
          fontFamily: "inherit",
        }}
      >
        <span
          className="mono"
          style={{
            display: "inline-block",
            minWidth: 22,
            height: 18,
            padding: "0 5px",
            lineHeight: "18px",
            textAlign: "center",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: "var(--gold)",
            border: "1px solid rgba(251,191,36,0.4)",
            borderRadius: 3,
          }}
        >
          ALL
        </span>
        <span style={{ flex: 1 }}>Все матчи</span>
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--text-mute)" }}
        >
          {matches.length}
        </span>
      </button>

      <div
        style={{
          height: 1,
          background: "var(--border)",
          margin: "8px 18px 4px",
        }}
      />

      {leagues.map((l) => {
        const active = l.name === activeLeague;
        return (
          <button
            key={`${l.code}-${l.name}`}
            type="button"
            onClick={() => onSelect(l.name)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 18px",
              fontSize: 13,
              color: active ? "var(--text)" : "var(--text-dim)",
              background: active
                ? "rgba(251,191,36,0.06)"
                : "transparent",
              border: "none",
              textAlign: "left",
              borderLeft: active
                ? "2px solid var(--gold)"
                : "2px solid transparent",
              cursor: "pointer",
              transition: "background 140ms ease, color 140ms ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = "var(--text-dim)";
            }}
          >
            <SportTag code={sportTag(l.code)} />
            <span style={{ flex: 1 }}>{l.name}</span>
            <span
              className="mono"
              style={{ fontSize: 11, color: "var(--text-mute)" }}
            >
              {l.count}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
