"""Render <matches> and <offers> blocks for system prompt.

Stable inside one session — re-rendered only when demo-state.yaml changes
on disk (which we hot-reload-disable for the demo)."""

from __future__ import annotations

from datetime import datetime
from functools import lru_cache

from app.demo_state_loader import DemoState, load_demo_state


def _short_time(iso: str) -> str:
    try:
        return datetime.fromisoformat(iso).strftime("%H:%M")
    except ValueError:
        return iso


def _render_match(m) -> str:
    odds = m.odds
    line = f"odds: П1 {odds.home:.2f}"
    if odds.draw is not None:
        line += f" | X {odds.draw:.2f}"
    line += f" | П2 {odds.away:.2f}"

    extra = ""
    if m.extendedLines:
        bullets = "\n      ".join(
            f"- {x.name}: {x.price:.2f}" for x in m.extendedLines
        )
        extra = f"\n    extra:\n      {bullets}"

    note = ""
    if m.analystNote:
        note_lines = m.analystNote.strip().replace("\n", " ").strip()
        note = f"\n    note: {note_lines}"

    return (
        f'  <match id="{m.id}" sport="{m.sport}" league="{m.league}" '
        f'time="{_short_time(m.startsAt)}">\n'
        f"    {m.home} — {m.away}\n"
        f"    {line}"
        f"{extra}"
        f"{note}\n"
        f"  </match>"
    )


def _render_offer(bonus_id: str, b) -> str:
    return (
        f'  <{b.type} id="{bonus_id}" amount="${b.amount:.0f}" '
        f'duration="{b.expires_in_hours}h"/>'
    )


@lru_cache(maxsize=1)
def render_global_state() -> str:
    state: DemoState = load_demo_state()
    matches_xml = "\n".join(_render_match(m) for m in state.matches)
    offers_xml = "\n".join(
        _render_offer(bid, b) for bid, b in state.bonus_catalog.items()
    )
    return (
        "<matches>\n"
        f"{matches_xml}\n"
        "</matches>\n\n"
        "<offers>\n"
        f"{offers_xml}\n"
        "</offers>"
    )
