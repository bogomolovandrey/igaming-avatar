import { matches } from "@/lib/demo-state";
import { MatchCard } from "./MatchCard";

type Props = {
  compact?: boolean;
  league?: string | null;
};

const LIVE_MATCHES = [
  { home: "Атлетико", away: "Севилья", score: "1:0", minute: "34'" },
  { home: "Бавария", away: "Лейпциг", score: "2:2", minute: "67'" },
  { home: "Спартак", away: "Зенит", score: "0:1", minute: "21'" },
];

export function Feed({ compact = false, league = null }: Props) {
  const filtered = league
    ? matches.filter((m) => m.league === league)
    : matches;

  return (
    <main
      style={{
        flex: 1,
        minWidth: 0,
        padding: compact ? "16px 12px 120px" : "28px 32px 60px",
        overflow: "auto",
        height: "calc(100vh - 58px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: compact ? 20 : 24,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          {league ?? "Сегодня"}
        </h2>
        <span
          className="mono"
          style={{
            color: "var(--text-mute)",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          · {league ? "League" : "Top matches"}
        </span>
        <span style={{ flex: 1 }} />
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--text-mute)" }}
        >
          {String(filtered.length).padStart(2, "0")} events
        </span>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--border-strong)",
            borderRadius: 8,
            padding: "40px 20px",
            textAlign: "center",
            color: "var(--text-mute)",
            fontSize: 13,
          }}
        >
          Нет ивентов в этой лиге.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: compact
              ? "1fr"
              : "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 10,
          }}
        >
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} compact={compact} />
          ))}
        </div>
      )}

      {!compact && !league && (
        <div style={{ marginTop: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.015em",
              }}
            >
              Лайв
            </h3>
            <span
              className="mono"
              style={{
                color: "var(--error)",
                fontSize: 10.5,
                letterSpacing: "0.12em",
              }}
            >
              ● NOW
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 10,
            }}
          >
            {LIVE_MATCHES.map((l) => (
              <div
                key={`${l.home}-${l.away}`}
                className="match-card"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <span
                    className="pulse-dot"
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 99,
                      background: "var(--error)",
                    }}
                  />
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--error)",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                    }}
                  >
                    LIVE
                  </span>
                  <span style={{ flex: 1 }} />
                  <span
                    className="mono"
                    style={{ fontSize: 11, color: "var(--text-dim)" }}
                  >
                    {l.minute}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  <span>{l.home}</span>
                  <span
                    className="mono"
                    style={{
                      color: "var(--text)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {l.score.split(":")[0]}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <span>{l.away}</span>
                  <span
                    className="mono"
                    style={{
                      color: "var(--text)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {l.score.split(":")[1]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
