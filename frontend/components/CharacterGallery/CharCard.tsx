import type { Character } from "@/lib/characters";

type Props = {
  c: Character;
  mobile?: boolean;
};

export function CharCard({ c, mobile }: Props) {
  return (
    <div
      className="btn-hover"
      title={c.active ? "" : "Скоро"}
      style={{
        background: "var(--surface)",
        border: c.active
          ? "1px solid rgba(251,191,36,0.5)"
          : "1px solid var(--border)",
        borderRadius: 12,
        padding: 14,
        position: "relative",
        overflow: "hidden",
        cursor: c.active ? "default" : "not-allowed",
        opacity: c.active ? 1 : 0.65,
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          borderRadius: 10,
          background: c.grad,
          filter: c.active ? "none" : "grayscale(0.7) brightness(0.75)",
          position: "relative",
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        {/* Monogram lives underneath; img shows on top when it loaded. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "rgba(255,255,255,0.96)",
            fontSize: mobile ? 48 : 68,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            pointerEvents: "none",
          }}
        >
          {c.monogram}
        </div>
        <img
          src={`/characters/${c.id}.png`}
          alt={c.name}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* Subtle stripe texture from the prototype */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 8px, transparent 8px 16px)",
            pointerEvents: "none",
          }}
        />
        {!c.active && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10,14,20,0.55)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{
                background: "rgba(10,14,20,0.9)",
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-dim)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border: "1px solid var(--border-strong)",
              }}
            >
              Coming soon
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--text)",
        }}
      >
        {c.name}
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: "var(--text-mute)",
          marginTop: 2,
          lineHeight: 1.3,
          minHeight: 28,
        }}
      >
        {c.role}
      </div>

      {c.active && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(16,185,129,0.14)",
            border: "1px solid rgba(16,185,129,0.5)",
            color: "var(--success)",
            padding: "3px 8px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 99,
              background: "var(--success)",
            }}
          />
          Активен
        </div>
      )}
    </div>
  );
}
