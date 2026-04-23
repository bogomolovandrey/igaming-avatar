import { Header } from "./Header";
import { Feed } from "./Feed";
import { SessionChip } from "./SessionChip";

type Props = {
  balance: number;
  balanceFlash?: boolean;
  freebetBadge?: { amount: number; expiresInLabel: string } | null;
  sessionId?: string;
};

const SPORT_TABS = [
  { code: "FB", label: "Футбол" },
  { code: "BB", label: "Баскет" },
  { code: "TN", label: "Теннис" },
  { code: "HK", label: "Хоккей" },
];

export function BackdropMobile({
  balance,
  balanceFlash,
  freebetBadge,
  sessionId,
}: Props) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Header
        balance={balance}
        balanceFlash={balanceFlash}
        freebetBadge={freebetBadge}
        compact
      />
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 12px",
          borderBottom: "1px solid var(--border)",
          overflowX: "auto",
          flexShrink: 0,
        }}
      >
        {SPORT_TABS.map((t, i) => (
          <button
            key={t.code}
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 11px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 4,
              background:
                i === 0 ? "rgba(251,191,36,0.1)" : "transparent",
              color: i === 0 ? "var(--gold)" : "var(--text-dim)",
              border:
                i === 0
                  ? "1px solid rgba(251,191,36,0.4)"
                  : "1px solid var(--border)",
            }}
          >
            <span
              className="mono"
              style={{ fontSize: 9.5, opacity: 0.7 }}
            >
              {t.code}
            </span>
            {t.label}
          </button>
        ))}
      </div>
      <Feed compact />
      {sessionId && <SessionChip id={sessionId} />}
    </div>
  );
}
