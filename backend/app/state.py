"""SessionState + in-memory SessionStore."""

from __future__ import annotations

import asyncio
import copy
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app import session_naming
from app.demo_state_loader import PlayerTemplate, load_demo_state

Mode = Literal["onboarding", "normal", "celebration", "rg_care", "bonus_nudge"]
DemoEventType = Literal[
    "first_visit",
    "big_win",
    "loss_streak",
    "freebet_expiring",
    "show_gallery",
    "custom",
]
MessageRole = Literal["user", "assistant", "system"]
MessageSource = Literal["voice", "text", "inject", "trigger"]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class Bet(BaseModel):
    matchId: str
    stake: float
    odds: float
    line: str
    status: Literal["open", "won", "lost"]
    payout: float | None = None
    settledAt: str | None = None


class Bonus(BaseModel):
    id: str
    type: Literal["freebet", "deposit_bonus"]
    amount: float
    currency: Literal["USD"]
    expiresAt: str
    used: bool = False
    description: str | None = None


class Player(BaseModel):
    name: str | None
    balance: float
    currency: Literal["USD"]
    loginCount: int
    recentBets: list[Bet] = Field(default_factory=list)
    activeBonuses: list[Bonus] = Field(default_factory=list)


class Message(BaseModel):
    role: MessageRole
    content: str
    at: str
    source: MessageSource


class DemoEvent(BaseModel):
    type: DemoEventType
    payload: dict = Field(default_factory=dict)
    at: str


class SessionState(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    player: Player
    mode: Mode = "onboarding"
    modeEnteredAt: int = 0  # conversation index when current mode was set
    conversation: list[Message] = Field(default_factory=list)
    lastEvent: DemoEvent | None = None
    createdAt: str = Field(default_factory=_now_iso)


def player_from_template(template: PlayerTemplate) -> Player:
    return Player(
        name=template.name,
        balance=template.balance,
        currency=template.currency,
        loginCount=template.loginCount,
        recentBets=[],
        activeBonuses=[],
    )


class SessionStore:
    """Thread-safe in-memory session store. Throwaway — restart clears all."""

    def __init__(self) -> None:
        self._sessions: dict[str, SessionState] = {}
        self._lock = asyncio.Lock()

    async def create(self) -> SessionState:
        demo = load_demo_state()
        async with self._lock:
            sid = session_naming.generate(taken=set(self._sessions.keys()))
            session = SessionState(
                id=sid,
                player=player_from_template(demo.player_template),
                mode="onboarding",
            )
            self._sessions[sid] = session
            return session

    async def get(self, sid: str) -> SessionState | None:
        async with self._lock:
            return self._sessions.get(sid)

    async def get_or_create(self, sid: str | None) -> SessionState:
        if sid:
            existing = await self.get(sid)
            if existing is not None:
                return existing
        return await self.create()

    async def reset(self, sid: str) -> SessionState | None:
        """Used by `first_visit` trigger — wipe session to template defaults."""
        demo = load_demo_state()
        async with self._lock:
            current = self._sessions.get(sid)
            if current is None:
                return None
            current.player = player_from_template(demo.player_template)
            current.mode = "onboarding"
            current.modeEnteredAt = 0
            current.conversation = []
            current.lastEvent = None
            return current

    def all_ids(self) -> list[str]:
        return list(self._sessions.keys())


# module-level singleton, used by routers
session_store = SessionStore()


def append_message(
    session: SessionState,
    role: MessageRole,
    content: str,
    source: MessageSource,
) -> Message:
    msg = Message(role=role, content=content, at=_now_iso(), source=source)
    session.conversation.append(msg)
    return msg


def set_event(session: SessionState, event: DemoEvent) -> None:
    session.lastEvent = event


def clear_event(session: SessionState) -> None:
    session.lastEvent = None


def set_mode(session: SessionState, mode: Mode) -> None:
    """Update mode and remember when it was set (for auto-shift)."""
    if session.mode == mode:
        return
    session.mode = mode
    session.modeEnteredAt = len(session.conversation)
