"""Routes for admin triggers, inject-message, and the proactive event SSE."""

from __future__ import annotations

import asyncio
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from starlette.responses import StreamingResponse

from app.events import inject_user_message, trigger_event
from app.proactive_bus import bus
from app.state import DemoEventType

router = APIRouter(prefix="/api", tags=["admin"])


class TriggerRequest(BaseModel):
    sessionId: str
    type: DemoEventType
    payload: dict = Field(default_factory=dict)
    delivery: Literal["classic", "video", "tavus", "both"] = "classic"


class InjectRequest(BaseModel):
    sessionId: str
    text: str


@router.post("/trigger")
async def post_trigger(req: TriggerRequest):
    # Run in background so the HTTP request returns fast — the proactive
    # stream gets pushed through /api/events SSE.
    async def runner():
        try:
            await trigger_event(
                req.sessionId,
                req.type,
                req.payload,
                # `tavus` remains accepted as a legacy alias. In the Anam
                # path the frontend speaks the normal SSE deltas, so every
                # delivery mode keeps the backend LLM stream enabled.
                stream_reply=True,
            )
        except Exception as exc:  # noqa: BLE001
            await bus.publish(
                req.sessionId,
                "message-error",
                {"message": f"trigger failed: {exc}"},
            )

    asyncio.create_task(runner())
    return {"accepted": True, "type": req.type}


@router.post("/inject")
async def post_inject(req: InjectRequest):
    async def runner():
        try:
            await inject_user_message(req.sessionId, req.text)
        except Exception as exc:  # noqa: BLE001
            await bus.publish(
                req.sessionId,
                "message-error",
                {"message": f"inject failed: {exc}"},
            )

    asyncio.create_task(runner())
    return {"accepted": True}


@router.get("/events")
async def events_stream(sessionId: str):
    if not sessionId:
        raise HTTPException(status_code=400, detail="sessionId required")

    async def event_generator():
        async for chunk in bus.subscribe(sessionId):
            yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable proxy buffering
        },
    )
