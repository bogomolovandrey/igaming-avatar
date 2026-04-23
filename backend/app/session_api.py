from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.state import SessionState, session_store

router = APIRouter(prefix="/api/session", tags=["session"])


class CreateSessionRequest(BaseModel):
    sessionId: str | None = None  # client passes existing id from cookie if any


@router.post("", response_model=SessionState)
async def create_or_resume(req: CreateSessionRequest) -> SessionState:
    return await session_store.get_or_create(req.sessionId)


@router.get("/{session_id}", response_model=SessionState)
async def get_session(session_id: str) -> SessionState:
    session = await session_store.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    return session
