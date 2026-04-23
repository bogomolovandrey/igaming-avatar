"""Render <player>/<mode> blocks — per-session, mutates often."""

from __future__ import annotations

from app.state import SessionState


def render_session_state(session: SessionState) -> str:
    p = session.player
    name = p.name or "не представился"
    bonuses = ", ".join(
        f"{b.type}:${b.amount:.0f}" for b in p.activeBonuses
    ) or "нет"
    player_tag = (
        f'<player name="{name}" balance="${p.balance:.2f}" '
        f'loginCount="{p.loginCount}" recent_bets="{len(p.recentBets)}" '
        f'active_bonuses="{bonuses}"/>'
    )
    return f"{player_tag}\n<mode>{session.mode}</mode>"


def render_last_event(session: SessionState) -> str:
    """Returns empty string when there is no event."""
    e = session.lastEvent
    if e is None:
        return ""
    attrs = " ".join(f'{k}="{v}"' for k, v in e.payload.items())
    if attrs:
        attrs = " " + attrs
    return f'<event type="{e.type}"{attrs} at="{e.at}"/>'
