"""Compose the full system prompt for a session."""

from __future__ import annotations

from app.prompts.global_state import render_global_state
from app.prompts.mode_addons import render_mode_addon
from app.prompts.persona import BASE_PERSONA
from app.prompts.session_state import render_last_event, render_session_state
from app.state import SessionState

SECTION_GAP = "\n\n"


def build_alex_prompt(session: SessionState) -> str:
    """Assemble the layered system prompt for a session.

    Layers (matches design spec §7.1):
        BASE_PERSONA → GLOBAL_STATE → SESSION_STATE → MODE_ADDON → LAST_EVENT
    Conversation history is passed separately as `messages=` to Anthropic.
    """
    parts: list[str] = [
        "# PERSONA",
        BASE_PERSONA.strip(),
        "# GLOBAL STATE",
        render_global_state(),
        "# SESSION STATE",
        render_session_state(session),
        "# MODE",
        render_mode_addon(session.mode).strip(),
    ]

    last_event = render_last_event(session)
    if last_event:
        parts.append("# LAST EVENT — ТОЛЬКО ЧТО СЛУЧИЛОСЬ")
        parts.append(
            "Это произошло прямо сейчас. Реагируй на сам факт события "
            "как Алекс — как будто только что увидел. Игнорируй любые "
            "технические маркеры в последнем user-сообщении (например "
            "`[trigger]`); они служебные, отвечать на них не надо.\n\n"
            f"{last_event}"
        )

    return SECTION_GAP.join(parts)
