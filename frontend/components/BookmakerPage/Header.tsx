import { Logo } from "./atoms";
import { formatBalance } from "@/lib/format";

type Props = {
  balance: number;
  balanceFlash?: boolean;
  freebetBadge?: { amount: number; expiresInLabel: string } | null;
  onPanelClick?: () => void;
  compact?: boolean;
};

const NAV_ITEMS = ["Спорт", "Live", "Казино", "Промо"];

export function Header({
  balance,
  balanceFlash,
  freebetBadge,
  onPanelClick,
  compact = false,
}: Props) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        background: "rgba(10,14,20,0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
        height: compact ? 52 : 58,
        display: "flex",
        alignItems: "center",
        padding: compact ? "0 10px" : "0 24px",
        gap: compact ? 8 : 28,
      }}
    >
      {compact && (
        <button
          aria-label="menu"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-dim)",
            padding: 4,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          >
            <path d="M3 5h12M3 9h12M3 13h12" />
          </svg>
        </button>
      )}

      <Logo />

      {!compact && (
        <nav
          style={{
            display: "flex",
            gap: 2,
            marginLeft: 8,
            alignSelf: "stretch",
            alignItems: "stretch",
          }}
        >
          {NAV_ITEMS.map((item, i) => {
            const active = i === 0;
            return (
              <button
                key={item}
                type="button"
                disabled={!active}
                title={active ? "" : "Demo · скоро"}
                onClick={(e) => e.preventDefault()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  background: "transparent",
                  border: "none",
                  color: active ? "var(--text)" : "var(--text-mute)",
                  cursor: active ? "default" : "not-allowed",
                  borderBottom: active
                    ? "1px solid var(--gold)"
                    : "1px solid transparent",
                }}
              >
                {item}
              </button>
            );
          })}
        </nav>
      )}

      <div style={{ flex: 1 }} />

      {freebetBadge && !compact && (
        <div
          className="mono"
          style={{
            border: "1px solid rgba(251,191,36,0.35)",
            color: "var(--gold)",
            padding: "4px 10px",
            borderRadius: 3,
            fontSize: 11,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>FREEBET ${freebetBadge.amount}</span>
          <span style={{ color: "var(--text-mute)" }}>
            {freebetBadge.expiresInLabel}
          </span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 8 : 16,
        }}
      >
        {!compact && (
          <div style={{ textAlign: "right", lineHeight: 1.1 }}>
            <div
              className="mono"
              style={{
                fontSize: 9.5,
                color: "var(--text-mute)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 2,
              }}
            >
              Balance
            </div>
            <div
              className={balanceFlash ? "balance-flash mono" : "mono"}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--gold)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ${formatBalance(balance)}
            </div>
          </div>
        )}
        {compact && (
          <div
            className={balanceFlash ? "balance-flash mono" : "mono"}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--gold)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ${formatBalance(balance, 0)}
          </div>
        )}

        <button
          className="btn-hover"
          style={{
            background: "var(--gold)",
            color: "#0a0e14",
            border: "none",
            padding: compact ? "6px 10px" : "8px 16px",
            borderRadius: 4,
            fontSize: compact ? 11.5 : 12.5,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}
        >
          {compact ? "+ Депозит" : "Депозит"}
        </button>

        {!compact && onPanelClick && (
          <button
            onClick={onPanelClick}
            className="btn-hover"
            title="Panel"
            style={{
              width: 32,
              height: 32,
              background: "transparent",
              color: "var(--text-dim)",
              border: "1px solid var(--border-strong)",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="2" stroke="currentColor" />
              <path
                d="M7 1v2M7 11v2M1 7h2M11 7h2M2.5 2.5l1.5 1.5M10 10l1.5 1.5M2.5 11.5L4 10M10 4l1.5-1.5"
                stroke="currentColor"
              />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
