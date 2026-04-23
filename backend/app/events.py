"""Trigger handlers — mutate SessionState and stream Alex's reaction.

Handlers are invoked by trigger_api.py. Each handler:
    1. Mutates session state synchronously (mode, balance, bonuses, bets).
    2. Sets `session.lastEvent` so build_alex_prompt picks it up.
    3. Pushes a `state` SSE event so the UI re-renders.
    4. Optionally streams an Alex reply through `proactive_bus` as
       `message-start` / `message-delta` / `message-done`.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from app.demo_state_loader import load_demo_state
from app.llm import stream_alex_reply
from app.modes import maybe_auto_shift
from app.proactive_bus import bus
from app.state import (
    Bet,
    Bonus,
    DemoEvent,
    DemoEventType,
    Mode,
    SessionState,
    append_message,
    clear_event,
    session_store,
    set_event,
    set_mode,
)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _expires_at(hours: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat(
        timespec="seconds"
    )


# ─────────────────────────────────────────────────────────────────
# State mutation per trigger type
# ─────────────────────────────────────────────────────────────────


def _apply_big_win(session: SessionState, payload: dict) -> dict:
    state = load_demo_state()
    preset = state.trigger_presets.big_win.model_dump()
    merged = {**preset, **payload}

    payout = float(merged["payout"])
    session.player.balance += payout
    session.player.recentBets.append(
        Bet(
            matchId=merged.get("matchId", "unknown"),
            stake=float(merged["stake"]),
            odds=float(merged["odds"]),
            line=str(merged.get("line", "")),
            status="won",
            payout=payout,
            settledAt=_now(),
        )
    )
    set_mode(session, "celebration")
    return merged


def _apply_loss_streak(session: SessionState, payload: dict) -> dict:
    state = load_demo_state()
    preset = state.trigger_presets.loss_streak.model_dump()
    merged = {**preset, **payload}

    count = int(merged["count"])
    avg_stake = float(merged["total_loss"]) / max(count, 1)
    for i in range(count):
        session.player.recentBets.append(
            Bet(
                matchId="m_loss",
                stake=avg_stake,
                odds=2.0,
                line="series loss",
                status="lost",
                settledAt=_now(),
            )
        )
    set_mode(session, "rg_care")
    return merged


def _apply_freebet_expiring(session: SessionState, payload: dict) -> dict:
    state = load_demo_state()
    preset = state.trigger_presets.freebet_expiring.model_dump()
    merged = {**preset, **payload}

    bonus_id = str(merged["bonusId"])
    bonus_template = state.bonus_by_id(bonus_id)
    if bonus_template is None:
        return merged
    hours = int(payload.get("expires_in_hours", bonus_template.expires_in_hours))
    bonus = Bonus(
        id=bonus_id,
        type=bonus_template.type,
        amount=bonus_template.amount,
        currency=bonus_template.currency,
        expiresAt=_expires_at(hours),
        used=False,
        description=bonus_template.description,
    )
    # replace any existing bonus with the same id
    session.player.activeBonuses = [
        b for b in session.player.activeBonuses if b.id != bonus_id
    ] + [bonus]
    set_mode(session, "bonus_nudge")
    merged["amount"] = bonus.amount
    merged["expires_in_hours"] = hours
    return merged


def _apply_first_visit(session: SessionState, _payload: dict) -> dict:
    # full reset is handled by SessionStore.reset; here we set mode and
    # increment loginCount to mirror "logged in for the first time".
    set_mode(session, "onboarding")
    return {}


def _apply_show_gallery(_session: SessionState, _payload: dict) -> dict:
    # No state mutation; UI hint only — handled by trigger_api.
    return {}


def _apply_custom(session: SessionState, payload: dict) -> dict:
    description = str(payload.get("description", "")).strip()
    requested_mode = payload.get("mode")
    if isinstance(requested_mode, str) and requested_mode in {
        "normal",
        "celebration",
        "rg_care",
        "bonus_nudge",
        "onboarding",
    }:
        set_mode(session, requested_mode)  # type: ignore[arg-type]
    return {"description": description}


_DISPATCH: dict[
    DemoEventType,
    Any,  # callable[(SessionState, dict), dict]
] = {
    "big_win": _apply_big_win,
    "loss_streak": _apply_loss_streak,
    "freebet_expiring": _apply_freebet_expiring,
    "first_visit": _apply_first_visit,
    "show_gallery": _apply_show_gallery,
    "custom": _apply_custom,
}


# ─────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────


async def trigger_event(
    session_id: str,
    event_type: DemoEventType,
    payload: dict,
) -> SessionState:
    """Mutate state, push state-update over SSE, and trigger Alex's
    proactive reply (via background-streamed message-* events).
    """
    if event_type == "first_visit":
        # Full reset wipes conversation, mode → onboarding, balance → template.
        await session_store.reset(session_id)
    session = await session_store.get(session_id)
    if session is None:
        session = await session_store.create()

    handler = _DISPATCH.get(event_type)
    if handler is None:
        merged_payload = payload
    else:
        merged_payload = handler(session, payload)

    event = DemoEvent(type=event_type, payload=merged_payload, at=_now())
    set_event(session, event)

    # Notify UI of the state change immediately.
    await bus.publish_state(session)

    if event_type == "show_gallery":
        await bus.publish(session.id, "ui", {"kind": "open_gallery"})
        clear_event(session)
        return session
    if event_type == "first_visit":
        await bus.publish(session.id, "ui", {"kind": "reset"})
        clear_event(session)
        return session

    # UI hint per event for animations
    ui_hint = _ui_hint_for(event_type, merged_payload)
    if ui_hint is not None:
        await bus.publish(session.id, "ui", ui_hint)

    await _stream_proactive_reply(session)
    return session


async def inject_user_message(session_id: str, text: str) -> SessionState:
    session = await session_store.get(session_id)
    if session is None:
        raise LookupError("session not found")
    text = text.strip()
    if not text:
        raise ValueError("empty inject text")

    append_message(session, role="user", content=text, source="inject")
    await bus.publish(
        session.id,
        "user-message",
        {"text": text},
    )
    await _stream_proactive_reply(session)
    return session


def _ui_hint_for(event_type: DemoEventType, payload: dict) -> dict | None:
    if event_type == "big_win":
        return {
            "kind": "celebration",
            "payout": payload.get("payout"),
            "newBalance": None,  # frontend reads new balance from state event
        }
    if event_type == "loss_streak":
        return {"kind": "rg_care_enter"}
    if event_type == "freebet_expiring":
        return {
            "kind": "freebet_nudge",
            "amount": payload.get("amount"),
            "expires_in_hours": payload.get("expires_in_hours"),
        }
    return None


async def _stream_proactive_reply(session: SessionState) -> None:
    """Run the LLM and stream deltas through the bus."""
    await bus.publish(session.id, "message-start", {})

    full_text = ""
    try:
        async for delta in stream_alex_reply(session):
            full_text += delta
            await bus.publish(session.id, "message-delta", {"text": delta})
    except Exception as exc:  # noqa: BLE001
        await bus.publish(session.id, "message-error", {"message": str(exc)})
        clear_event(session)
        # ensure UI exits "streaming" state even on failure
        await bus.publish(session.id, "message-done", {"text": ""})
        return

    if full_text:
        append_message(
            session,
            role="assistant",
            content=full_text,
            source="trigger",
        )

    new_mode: Mode = maybe_auto_shift(session)
    if new_mode != session.mode:
        set_mode(session, new_mode)

    clear_event(session)
    await bus.publish_state(session)
    await bus.publish(session.id, "message-done", {"text": full_text})
