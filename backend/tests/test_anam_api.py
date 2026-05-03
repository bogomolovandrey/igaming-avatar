from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app import anam_api
from app.demo_state_loader import load_demo_state
from app.state import SessionState, player_from_template


def _settings(**overrides):
    base = {
        "anam_api_key": "anam_key",
        "anam_avatar_id": "avatar_id",
        "anam_voice_id": "voice_id",
        "anam_language_code": "ru",
        "anam_llm_id": "CUSTOMER_CLIENT_V1",
        "anam_max_session_seconds": 600,
    }
    base.update(overrides)
    return SimpleNamespace(**base)


def _session() -> SessionState:
    return SessionState(
        id="session-1",
        player=player_from_template(load_demo_state().player_template),
    )


class _Response:
    def __init__(self, status_code: int, data: dict | None = None, text: str = ""):
        self.status_code = status_code
        self._data = data or {}
        self.text = text

    def json(self):
        return self._data


class _Client:
    def __init__(self, response: _Response):
        self.response = response
        self.calls = []

    async def post(self, url, *, json, headers):
        self.calls.append({"url": url, "json": json, "headers": headers})
        return self.response


def test_anam_requires_voice_id(monkeypatch):
    monkeypatch.setattr(anam_api, "settings", _settings(anam_voice_id=""))

    with pytest.raises(HTTPException) as exc:
        anam_api._require_settings()

    assert exc.value.status_code == 503
    assert "ANAM_VOICE_ID" in exc.value.detail


@pytest.mark.asyncio
async def test_anam_session_token_payload(monkeypatch):
    monkeypatch.setattr(anam_api, "settings", _settings())
    client = _Client(_Response(200, {"sessionToken": "token-1", "sessionId": "anam-1"}))

    data = await anam_api._request_session_token(client, _session())

    assert data["sessionToken"] == "token-1"
    call = client.calls[0]
    assert call["url"] == "https://api.anam.ai/v1/auth/session-token"
    assert call["headers"]["Authorization"] == "Bearer anam_key"
    assert call["json"]["personaConfig"]["llmId"] == "CUSTOMER_CLIENT_V1"
    assert call["json"]["personaConfig"]["languageCode"] == "ru"
    assert call["json"]["personaConfig"]["voiceId"] == "voice_id"


@pytest.mark.asyncio
async def test_anam_api_error_maps_to_502(monkeypatch):
    monkeypatch.setattr(anam_api, "settings", _settings())
    client = _Client(_Response(404, text='{"detail":"Not Found"}'))

    with pytest.raises(HTTPException) as exc:
        await anam_api._request_session_token(client, _session())

    assert exc.value.status_code == 502
    assert "Anam session token 404" in exc.value.detail
