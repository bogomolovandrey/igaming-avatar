type Props = {
  size?: number;
  online?: boolean;
  pulse?: boolean;
  ring?: boolean;
};

const GRADIENT = "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)";

export function AlexAvatar({
  size = 40,
  online = true,
  pulse = false,
  ring = false,
}: Props) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <div
        className={pulse ? "alex-pulse" : ""}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: GRADIENT,
          display: "grid",
          placeItems: "center",
          color: "#fff",
          fontSize: size * 0.46,
          fontWeight: 700,
          fontFamily: "Manrope, sans-serif",
          letterSpacing: "-0.02em",
          boxShadow: ring
            ? "0 0 0 2px rgba(245,158,11,0.5), 0 6px 20px rgba(99,102,241,0.35)"
            : "0 6px 20px rgba(99,102,241,0.25)",
          border: "2px solid rgba(255,255,255,0.08)",
        }}
      >
        А
      </div>
      {online && (
        <div
          style={{
            position: "absolute",
            right: size * 0.02,
            bottom: size * 0.02,
            width: Math.max(8, size * 0.22),
            height: Math.max(8, size * 0.22),
            borderRadius: "50%",
            background: "var(--success)",
            border: "2px solid var(--bg)",
          }}
        />
      )}
    </div>
  );
}
