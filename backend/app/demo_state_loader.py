"""Load and validate data/demo-state.yaml — backend mirror of frontend types.ts."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, ConfigDict, Field

# data/demo-state.yaml is mounted into the container at /app/data
# (see backend/Dockerfile: COPY data /app/data).
DEFAULT_YAML_PATH = Path(__file__).resolve().parents[2] / "data" / "demo-state.yaml"


class _Yaml(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Odds(_Yaml):
    home: float
    draw: float | None = None
    away: float


class ExtendedLine(_Yaml):
    name: str
    price: float


class Match(_Yaml):
    id: str
    sport: Literal["football", "basketball"]
    league: str
    home: str
    away: str
    startsAt: str
    odds: Odds
    extendedLines: list[ExtendedLine] = Field(default_factory=list)
    analystNote: str | None = None
    featured: bool = False


class LeagueChip(_Yaml):
    code: Literal["football", "basketball"]
    name: str
    count: int


class PlayerTemplate(_Yaml):
    name: str | None
    balance: float
    currency: Literal["USD"]
    loginCount: int
    recentBets: list = Field(default_factory=list)
    activeBonuses: list = Field(default_factory=list)


class BonusTemplate(_Yaml):
    type: Literal["freebet", "deposit_bonus"]
    amount: float
    currency: Literal["USD"]
    expires_in_hours: int
    description: str | None = None


class BigWinPreset(_Yaml):
    matchId: str
    line: str
    stake: float
    odds: float
    payout: float


class LossStreakPreset(_Yaml):
    count: int
    total_loss: float
    notable: str


class FreebetExpiringPreset(_Yaml):
    bonusId: str


class TriggerPresets(_Yaml):
    big_win: BigWinPreset
    loss_streak: LossStreakPreset
    freebet_expiring: FreebetExpiringPreset


class DemoState(_Yaml):
    matches: list[Match]
    leagues: list[LeagueChip]
    player_template: PlayerTemplate
    bonus_catalog: dict[str, BonusTemplate]
    trigger_presets: TriggerPresets

    def match_by_id(self, match_id: str) -> Match | None:
        return next((m for m in self.matches if m.id == match_id), None)

    def bonus_by_id(self, bonus_id: str) -> BonusTemplate | None:
        return self.bonus_catalog.get(bonus_id)


@lru_cache(maxsize=1)
def load_demo_state(path: Path | str | None = None) -> DemoState:
    yaml_path = Path(path) if path is not None else DEFAULT_YAML_PATH
    with yaml_path.open("r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    return DemoState.model_validate(raw)
