"""Anam AI proxy routes.

The browser receives only a short-lived Anam session token. The long-lived
Anam API key stays on the backend.
"""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.state import SessionState, session_store

router = APIRouter(prefix="/api/anam", tags=["anam"])

ANAM_API = "https://api.anam.ai/v1"


class AnamSessionTokenRequest(BaseModel):
    sessionId: str


def _missing_settings() -> list[str]:
    missing: list[str] = []
    if not settings.anam_api_key:
        missing.append("ANAM_API_KEY")
    if not settings.anam_avatar_id:
        missing.append("ANAM_AVATAR_ID")
    if not settings.anam_voice_id:
        missing.append("ANAM_VOICE_ID")
    return missing


def _require_settings() -> None:
    missing = _missing_settings()
    if missing:
        raise HTTPException(
            status_code=503,
            detail=f"{', '.join(missing)} is not set",
        )


def _headers() -> dict[str, str]:
    _require_settings()
    return {
        "Authorization": f"Bearer {settings.anam_api_key}",
        "Content-Type": "application/json",
    }


def _session_payload(session: SessionState) -> dict:
    return {
        "clientLabel": f"BETARENA Alex {session.id}",
        "personaConfig": {
            "name": "Alex BETARENA",
            "avatarId": settings.anam_avatar_id,
            "voiceId": settings.anam_voice_id,
            "llmId": settings.anam_llm_id,
            "systemPrompt": (
                "Ты Alex BETARENA, русскоязычный iGaming-ассистент. "
                "В этой интеграции текст ответа приходит из приложения, "
                "а ты должен только естественно озвучивать его как видеоаватар."
            ),
            "maxSessionLengthSeconds": settings.anam_max_session_seconds,
            "languageCode": settings.anam_language_code,
        },
    }


async def _request_session_token(
    client: httpx.AsyncClient,
    session: SessionState,
) -> dict:
    resp = await client.post(
        f"{ANAM_API}/auth/session-token",
        json=_session_payload(session),
        headers=_headers(),
    )
    if resp.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Anam session token {resp.status_code}: {resp.text[:300]}",
        )

    data = resp.json()
    if not data.get("sessionToken"):
        raise HTTPException(status_code=502, detail=f"Anam session token response: {data}")
    return data


@router.post("/session-token")
async def create_anam_session_token(req: AnamSessionTokenRequest) -> dict:
    session = await session_store.get(req.sessionId)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")

    async with httpx.AsyncClient(timeout=20) as client:
        data = await _request_session_token(client, session)

    return {
        "sessionToken": data["sessionToken"],
        "sessionId": data.get("sessionId"),
    }
