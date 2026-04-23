"""Environment configuration loaded from process env."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

# Load project-root .env when present (dev/local). In Docker we get env via
# `environment:` in docker-compose, no .env file to load.
try:
    from dotenv import load_dotenv

    _root_env = Path(__file__).resolve().parents[2] / ".env"
    if _root_env.exists():
        load_dotenv(_root_env, override=False)
except ImportError:
    pass


def _split(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    anthropic_api_key: str
    google_credentials_path: str
    frontend_origins: list[str]
    tts_model: str
    deepgram_api_key: str
    cartesia_api_key: str
    cartesia_voice_id: str
    deepgram_model: str
    cartesia_model: str

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY", ""),
            # ↓ infra paths/URLs — must come from env, no fallback.
            google_credentials_path=os.environ.get(
                "GOOGLE_APPLICATION_CREDENTIALS", ""
            ),
            frontend_origins=_split(os.environ.get("FRONTEND_ORIGIN", "")),
            # ↓ behavioral defaults — sensible model + voice picks. Override
            # via env to swap voice/model without code changes.
            tts_model=os.environ.get("TTS_MODEL", "gemini-2.5-flash-preview-tts"),
            deepgram_api_key=os.environ.get("DEEPGRAM_API_KEY", ""),
            cartesia_api_key=os.environ.get("CARTESIA_API_KEY", ""),
            cartesia_voice_id=os.environ.get(
                "CARTESIA_VOICE_ID", "888b7df4-e165-4852-bfec-0ab2b96aaa46"
            ),
            deepgram_model=os.environ.get("DEEPGRAM_MODEL", "nova-3-general"),
            cartesia_model=os.environ.get("CARTESIA_MODEL", "sonic-2"),
        )


settings = Settings.from_env()
