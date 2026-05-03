"""FastAPI entrypoint for the Avatar AI Demo backend."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.anam_api import router as anam_router
from app.chat_api import router as chat_router
from app.config import settings
from app.session_api import router as session_router
from app.trigger_api import router as trigger_router
from app.voice_api import router as voice_api_router

app = FastAPI(title="Avatar AI Demo", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session_router)
app.include_router(chat_router)
app.include_router(trigger_router)
app.include_router(voice_api_router)
app.include_router(anam_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "avatar-ai-backend"}
