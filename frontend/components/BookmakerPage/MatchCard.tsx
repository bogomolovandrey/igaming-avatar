import type { Match } from "@/lib/types";
import { sportTag, timeOfDay } from "@/lib/format";
import { OddsChip, SportTag } from "./atoms";

type Props = {
  match: Match;
  compact?: boolean;
};

export function MatchCard({ match, compact = false }: Props) {
  const hasDraw = match.odds.draw != null;
  return (
    <div
      className="match-card"
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: compact ? 14 : 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 11,
          color: "var(--text-mute)",
        }}
      >
        <SportTag code={sportTag(match.sport)} />
        <span
          className="mono"
          style={{
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {match.league}
        </span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ color: "var(--text-dim)" }}>
          {timeOfDay(match.startsAt)}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div
          style={{
            fontSize: compact ? 14 : 15,
            fontWeight: 500,
            color: "var(--text)",
            letterSpacing: "-0.005em",
          }}
        >
          {match.home}
        </div>
        <div
          style={{
            fontSize: compact ? 14 : 15,
            fontWeight: 500,
            color: "var(--text)",
            letterSpacing: "-0.005em",
          }}
        >
          {match.away}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <OddsChip label="П1" value={match.odds.home} />
        {hasDraw && <OddsChip label="X" value={match.odds.draw} />}
        <OddsChip label="П2" value={match.odds.away} />
      </div>
    </div>
  );
}
