"""POST /api/chat — text path, SSE streaming through Anthropic SDK."""

from __future__ import annotations

import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.llm import stream_alex_reply
from app.modes import maybe_auto_shift
from app.state import (
    append_message,
    clear_event,
    session_store,
    set_mode,
)

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    sessionId: str
    text: str


def _sse(payload: dict) -> str:
    return json.dumps(payload, ensure_ascii=False)


@router.post("")
async def chat(req: ChatRequest) -> EventSourceResponse:
    session = await session_store.get(req.sessionId)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")

    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="empty message")

    append_message(session, role="user", content=text, source="text")

    async def event_stream():
        full_text = ""
        try:
            async for delta in stream_alex_reply(session):
                full_text += delta
                yield {"event": "delta", "data": _sse({"text": delta})}
        except Exception as exc:  # noqa: BLE001
            yield {
                "event": "error",
                "data": _sse({"message": str(exc)}),
            }
            return

        if full_text:
            append_message(
                session,
                role="assistant",
                content=full_text,
                source="text",
            )
        # event was already consumed for this reply
        clear_event(session)
        # auto-shift mode after the reply if needed
        new_mode = maybe_auto_shift(session)
        if new_mode != session.mode:
            set_mode(session, new_mode)

        yield {
            "event": "done",
            "data": _sse({"mode": session.mode}),
        }

    return EventSourceResponse(event_stream())
