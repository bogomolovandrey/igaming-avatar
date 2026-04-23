"""Mode auto-shift logic — invoked after every assistant turn.

Rules from spec §6.5:
    - onboarding → normal after first user/assistant pair
    - celebration → normal after 2 user-turns in celebration
    - bonus_nudge → normal after 1 user-turn
    - rg_care → sticky, only cleared by explicit reset
"""

from __future__ import annotations

from app.state import Mode, SessionState


def _user_turns_since(session: SessionState, since_index: int) -> int:
    if since_index >= len(session.conversation):
        return 0
    tail = session.conversation[since_index:]
    return sum(1 for m in tail if m.role == "user")


def maybe_auto_shift(session: SessionState) -> Mode:
    """Return the new mode after considering auto-shift rules.

    Uses `session.modeEnteredAt` to count user-turns since current mode
    started.
    """
    user_turns = _user_turns_since(session, session.modeEnteredAt)
    mode = session.mode

    if mode == "onboarding" and user_turns >= 1:
        return "normal"
    if mode == "celebration" and user_turns >= 2:
        return "normal"
    if mode == "bonus_nudge" and user_turns >= 1:
        return "normal"
    # rg_care is sticky — only cleared by explicit first_visit / reset trigger
    return mode
