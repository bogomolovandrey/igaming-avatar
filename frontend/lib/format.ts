import type { Sport } from "./types";

const SPORT_TAGS: Record<Sport, string> = {
  football: "FB",
  basketball: "BB",
};

export function sportTag(sport: Sport): string {
  return SPORT_TAGS[sport];
}

export function timeOfDay(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatBalance(value: number, fractionDigits = 2): string {
  return value.toFixed(fractionDigits);
}
