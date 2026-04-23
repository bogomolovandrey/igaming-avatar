"""POST /api/voice/tts — primary: Gemini Flash TTS, fallback: Cartesia Sonic-2.

Gemini gives natural-language voice direction (mood/tone). Cartesia stays
as a fallback when Gemini fails or quota runs out.
"""

from __future__ import annotations

import base64
import io
import json
import os
import struct
import urllib.error
import urllib.request

import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

router = APIRouter(prefix="/api/voice", tags=["voice"])

CARTESIA_MODEL = os.environ.get("CARTESIA_MODEL", "sonic-2")
CARTESIA_VOICE_ID = os.environ.get(
    "CARTESIA_VOICE_ID", "888b7df4-e165-4852-bfec-0ab2b96aaa46"  # Dmitri
)
CARTESIA_VERSION = "2024-06-10"

GEMINI_TTS_MODEL = os.environ.get(
    "GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts"
)
GEMINI_VOICE = os.environ.get("GEMINI_VOICE", "Puck")
GEMINI_TTS_PREFIX = os.environ.get(
    "GEMINI_TTS_PREFIX",
    "Скажи это тёплым дружеским тоном молодого парня лет 25, "
    "с лёгкой самоиронией. Мужской голос. На русском, без перевода: ",
)
SAMPLE_RATE = 24000

OPENAI_STT_MODEL = os.environ.get("OPENAI_STT_MODEL", "whisper-1")


class TtsRequest(BaseModel):
    text: str


def _pcm_to_wav(pcm: bytes, sample_rate: int = SAMPLE_RATE) -> bytes:
    bits_per_sample = 16
    channels = 1
    byte_rate = sample_rate * channels * bits_per_sample // 8
    block_align = channels * bits_per_sample // 8
    data_size = len(pcm)

    buf = io.BytesIO()
    buf.write(b"RIFF")
    buf.write(struct.pack("<I", 36 + data_size))
    buf.write(b"WAVE")
    buf.write(b"fmt ")
    buf.write(struct.pack("<I", 16))
    buf.write(struct.pack("<H", 1))
    buf.write(struct.pack("<H", channels))
    buf.write(struct.pack("<I", sample_rate))
    buf.write(struct.pack("<I", byte_rate))
    buf.write(struct.pack("<H", block_align))
    buf.write(struct.pack("<H", bits_per_sample))
    buf.write(b"data")
    buf.write(struct.pack("<I", data_size))
    buf.write(pcm)
    return buf.getvalue()


# ─────────────────────────────────────────────────────────────────


def _cartesia_tts(text: str, api_key: str) -> bytes:
    body = json.dumps(
        {
            "model_id": CARTESIA_MODEL,
            "transcript": text,
            "voice": {"mode": "id", "id": CARTESIA_VOICE_ID},
            "output_format": {
                "container": "wav",
                "encoding": "pcm_s16le",
                "sample_rate": SAMPLE_RATE,
            },
            "language": "ru",
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://api.cartesia.ai/tts/bytes",
        data=body,
        headers={
            "Content-Type": "application/json",
            "X-API-Key": api_key,
            "Cartesia-Version": CARTESIA_VERSION,
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def _gemini_tts(text: str, api_key: str) -> bytes:
    body = json.dumps(
        {
            "contents": [
                {"parts": [{"text": GEMINI_TTS_PREFIX + text}]}
            ],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {"voiceName": GEMINI_VOICE}
                    }
                },
            },
        }
    ).encode("utf-8")
    endpoint = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_TTS_MODEL}:generateContent?key={api_key}"
    )
    req = urllib.request.Request(
        endpoint,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.loads(resp.read())
    candidates = payload.get("candidates", [])
    if not candidates:
        raise RuntimeError(f"Gemini TTS empty: {payload!r}")
    parts = candidates[0].get("content", {}).get("parts", [])
    for part in parts:
        inline = part.get("inlineData") or part.get("inline_data")
        if inline and inline.get("data"):
            return _pcm_to_wav(base64.b64decode(inline["data"]))
    raise RuntimeError(f"Gemini TTS no audio: {payload!r}")


# ─────────────────────────────────────────────────────────────────


@router.post("/tts")
async def tts(req: TtsRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="empty text")

    google_key = os.environ.get("GOOGLE_API_KEY")
    cartesia_key = os.environ.get("CARTESIA_API_KEY")

    errors: list[str] = []

    if google_key:
        try:
            wav = _gemini_tts(text, google_key)
            return Response(
                content=wav,
                media_type="audio/wav",
                headers={
                    "Cache-Control": "no-store",
                    "X-TTS-Provider": "gemini",
                },
            )
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="ignore")[:200]
            errors.append(f"gemini HTTP {exc.code}: {body}")
        except Exception as exc:  # noqa: BLE001
            errors.append(f"gemini: {exc}")

    if cartesia_key:
        try:
            wav = _cartesia_tts(text, cartesia_key)
            return Response(
                content=wav,
                media_type="audio/wav",
                headers={
                    "Cache-Control": "no-store",
                    "X-TTS-Provider": "cartesia",
                },
            )
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="ignore")[:200]
            errors.append(f"cartesia HTTP {exc.code}: {body}")
        except Exception as exc:  # noqa: BLE001
            errors.append(f"cartesia: {exc}")

    if not errors:
        raise HTTPException(
            status_code=503,
            detail="no TTS provider configured (set GOOGLE_API_KEY or CARTESIA_API_KEY)",
        )
    raise HTTPException(status_code=502, detail=" | ".join(errors))


# ─────────────────────────────────────────────────────────────────
# Speech-to-text via OpenAI Whisper
# ─────────────────────────────────────────────────────────────────


@router.post("/stt")
async def stt(file: UploadFile = File(...)):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(503, "OPENAI_API_KEY not set")

    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(400, "empty audio")

    filename = file.filename or "audio.webm"
    content_type = file.content_type or "audio/webm"

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {api_key}"},
                files={"file": (filename, audio_bytes, content_type)},
                data={
                    "model": OPENAI_STT_MODEL,
                    "language": "ru",
                    "response_format": "json",
                    # Helps Whisper bias towards bookmaker / sports lexicon
                    "prompt": (
                        "Это диалог про букмекерскую платформу BETARENA. "
                        "Игрока зовут Дима. Пользователь говорит про матчи, "
                        "коэффициенты, ставки, фрибеты, Реал, Барселону, "
                        "Алекса."
                    ),
                },
            )
    except httpx.HTTPError as exc:
        raise HTTPException(502, f"OpenAI STT request failed: {exc}")

    if resp.status_code != 200:
        raise HTTPException(
            502,
            f"OpenAI STT {resp.status_code}: {resp.text[:200]}",
        )
    payload = resp.json()
    text = (payload.get("text") or "").strip()
    return {"text": text}
