// Single source of TypeScript types shared across the SPA.
// Структура зеркалит backend pydantic-модели (см. backend/app/demo_state_loader.py
// и backend/app/state.py). При изменении — обновить ОБЕ стороны.

export type Sport = "football" | "basketball";

export type Odds = {
  home: number;
  draw?: number;
  away: number;
};

export type ExtendedLine = {
  name: string;
  price: number;
};

export type Match = {
  id: string;
  sport: Sport;
  league: string;
  home: string;
  away: string;
  startsAt: string; // ISO
  odds: Odds;
  extendedLines?: ExtendedLine[];
  analystNote?: string;
  featured?: boolean;
};

export type LeagueChip = {
  code: Sport;
  name: string;
  count: number;
};

export type Bet = {
  matchId: string;
  stake: number;
  odds: number;
  line: string;
  status: "open" | "won" | "lost";
  payout?: number;
  settledAt?: string;
};

export type BonusType = "freebet" | "deposit_bonus";

export type Bonus = {
  id: string;
  type: BonusType;
  amount: number;
  currency: "USD";
  expiresAt: string;
  used: boolean;
  description?: string;
};

export type BonusTemplate = {
  type: BonusType;
  amount: number;
  currency: "USD";
  expires_in_hours: number;
  description?: string;
};

export type Player = {
  name: string | null;
  balance: number;
  currency: "USD";
  loginCount: number;
  recentBets: Bet[];
  activeBonuses: Bonus[];
};

export type PlayerTemplate = Player;

export type Mode =
  | "onboarding"
  | "normal"
  | "celebration"
  | "rg_care"
  | "bonus_nudge";

export type DemoEventType =
  | "first_visit"
  | "big_win"
  | "loss_streak"
  | "freebet_expiring"
  | "show_gallery"
  | "custom";

export type DemoEvent = {
  type: DemoEventType;
  payload: Record<string, unknown>;
  at: string;
};

export type MessageRole = "user" | "assistant" | "system";

export type MessageSource = "voice" | "text" | "inject" | "trigger" | "video" | "anam";

export type Message = {
  role: MessageRole;
  content: string;
  at: string;
  source: MessageSource;
};

export type SessionState = {
  id: string;
  player: Player;
  mode: Mode;
  conversation: Message[];
  lastEvent: DemoEvent | null;
  createdAt: string;
};

// ─── Trigger preset payloads (mirrors data/demo-state.yaml::trigger_presets) ───

export type BigWinPreset = {
  matchId: string;
  line: string;
  stake: number;
  odds: number;
  payout: number;
};

export type LossStreakPreset = {
  count: number;
  total_loss: number;
  notable: string;
};

export type FreebetExpiringPreset = {
  bonusId: string;
};

export type TriggerPresets = {
  big_win: BigWinPreset;
  loss_streak: LossStreakPreset;
  freebet_expiring: FreebetExpiringPreset;
};

export type DemoState = {
  matches: Match[];
  leagues: LeagueChip[];
  player_template: PlayerTemplate;
  bonus_catalog: Record<string, BonusTemplate>;
  trigger_presets: TriggerPresets;
};
