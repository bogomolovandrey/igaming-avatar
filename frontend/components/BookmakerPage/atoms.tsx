import type { CSSProperties } from "react";

type SportTagProps = {
  code: string;
  dim?: boolean;
};

export function SportTag({ code, dim }: SportTagProps) {
  return (
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
        color: dim ? "var(--text-mute)" : "var(--text-dim)",
        border: "1px solid var(--border-strong)",
        borderRadius: 3,
        background: "transparent",
      }}
    >
      {code}
    </span>
  );
}

export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect
          x="0.5"
          y="0.5"
          width="21"
          height="21"
          rx="4"
          stroke="#fbbf24"
          strokeWidth="1"
        />
        <path
          d="M6 6 H12 A3 3 0 0 1 12 12 H6 Z M6 11 H13 A3 3 0 0 1 13 17 H6 Z"
          fill="#fbbf24"
        />
      </svg>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "var(--text)",
        }}
      >
        BETARENA
      </div>
    </div>
  );
}

type OddsChipProps = {
  label: string;
  value: number | null | undefined;
};

export function OddsChip({ label, value }: OddsChipProps) {
  if (value == null) {
    const empty: CSSProperties = {
      flex: 1,
      background: "transparent",
      border: "1px solid var(--border)",
      borderRadius: 4,
      padding: "9px 12px",
      textAlign: "center",
      color: "var(--text-mute)",
      fontSize: 12,
    };
    return <div style={empty}>—</div>;
  }
  return (
    <button
      className="odds"
      style={{
        flex: 1,
        background: "transparent",
        border: "1px solid var(--border-strong)",
        borderRadius: 4,
        padding: "8px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        color: "var(--text)",
      }}
    >
      <span
        className="mono"
        style={{
          fontSize: 10.5,
          color: "var(--text-mute)",
          fontWeight: 500,
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <span
        className="mono"
        style={{
          fontSize: 13.5,
          fontWeight: 500,
          color: "var(--gold)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value.toFixed(2)}
      </span>
    </button>
  );
}
