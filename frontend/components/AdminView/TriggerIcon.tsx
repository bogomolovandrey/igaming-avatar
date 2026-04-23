type Props = { id: string };

const COMMON = {
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

export function TriggerIcon({ id }: Props) {
  switch (id) {
    case "big_win":
      return (
        <svg width="18" height="18" viewBox="0 0 20 20" {...COMMON}>
          <path d="M10 2 L11.6 7 L17 7 L12.7 10.2 L14.3 15.2 L10 12 L5.7 15.2 L7.3 10.2 L3 7 L8.4 7 Z" />
        </svg>
      );
    case "loss_streak":
      return (
        <svg width="18" height="18" viewBox="0 0 20 20" {...COMMON}>
          <path d="M3 15 L7 10 L10 12 L13 7 L17 11" />
          <path d="M17 11 L17 7 L13 7" />
        </svg>
      );
    case "freebet_expiring":
      return (
        <svg width="18" height="18" viewBox="0 0 20 20" {...COMMON}>
          <circle cx="10" cy="10" r="7" />
          <path d="M10 6 V10 L12.5 12" />
        </svg>
      );
    case "show_gallery":
      return (
        <svg width="18" height="18" viewBox="0 0 20 20" {...COMMON}>
          <rect x="3" y="3" width="6" height="6" rx="1" />
          <rect x="11" y="3" width="6" height="6" rx="1" />
          <rect x="3" y="11" width="6" height="6" rx="1" />
          <rect x="11" y="11" width="6" height="6" rx="1" />
        </svg>
      );
    case "first_visit":
      return (
        <svg width="18" height="18" viewBox="0 0 20 20" {...COMMON}>
          <path d="M16 10 A6 6 0 1 1 10 4 L13 4" />
          <path d="M13 1.5 L13 4 L10.5 4" />
        </svg>
      );
    default:
      return null;
  }
}
