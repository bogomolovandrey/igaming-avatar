export function RightRail() {
  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        borderLeft: "1px solid var(--border)",
        padding: "20px 18px",
        height: "calc(100vh - 58px)",
        overflow: "auto",
        position: "sticky",
        top: 58,
      }}
    >
      <div
        style={{
          border: "1px solid var(--border-strong)",
          borderRadius: 6,
          padding: "16px 16px 18px",
          marginBottom: 20,
          background: "transparent",
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--gold)",
            fontWeight: 500,
            letterSpacing: "0.14em",
          }}
        >
          PROMO / 01
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginTop: 10,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          Экспресс дня
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--gold)",
            marginTop: 6,
            fontWeight: 500,
          }}
        >
          × коэф +15%
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-dim)",
            marginTop: 10,
            lineHeight: 1.45,
          }}
        >
          Собери экспресс из 4+ событий сегодня.
        </div>
      </div>
      <div
        className="mono"
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: "var(--text-mute)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          margin: "0 0 12px",
        }}
      >
        Купон
      </div>
      <div
        style={{
          border: "1px dashed var(--border-strong)",
          borderRadius: 6,
          padding: "28px 16px",
          textAlign: "center",
          color: "var(--text-mute)",
          fontSize: 13,
        }}
      >
        Купон пуст
        <div
          style={{
            fontSize: 11,
            marginTop: 6,
            color: "var(--text-mute)",
          }}
        >
          Добавь событие из списка
        </div>
      </div>
    </aside>
  );
}
