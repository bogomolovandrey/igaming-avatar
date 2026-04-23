"""Anthropic SDK wrapper — owns the streaming call and history shaping."""

from __future__ import annotations

from typing import AsyncIterator

from anthropic import AsyncAnthropic

from app.config import settings
from app.prompts import build_alex_prompt
from app.state import SessionState

MODEL = "claude-sonnet-4-6"
MAX_TOKENS = 700


def _client() -> AsyncAnthropic:
    return AsyncAnthropic(api_key=settings.anthropic_api_key)


def _history_for_api(session: SessionState, limit_turns: int = 20) -> list[dict]:
    """Trim conversation to the last 2*limit_turns user+assistant messages,
    matching Anthropic's alternating-role expectation."""
    relevant = [
        m for m in session.conversation if m.role in ("user", "assistant")
    ]
    tail = relevant[-2 * limit_turns :]
    return [{"role": m.role, "content": m.content} for m in tail]


_PROACTIVE_USER_STUB = "[trigger]"


async def stream_alex_reply(session: SessionState) -> AsyncIterator[str]:
    """Yield text deltas for the next assistant reply.

    Anthropic API requires `messages` to end with a user message. For
    proactive triggers (no user input) we append a tiny technical stub
    (`[trigger]`); the system prompt instructs Claude to ignore such
    markers and respond to LAST_EVENT instead.

    Caller is responsible for appending the final assistant message to
    session.conversation (we yield deltas only)."""
    system_prompt = build_alex_prompt(session)
    history = _history_for_api(session)
    if not history or history[-1]["role"] != "user":
        history = history + [
            {"role": "user", "content": _PROACTIVE_USER_STUB}
        ]

    async with _client().messages.stream(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=system_prompt,
        messages=history,
    ) as stream:
        async for text in stream.text_stream:
            yield text
