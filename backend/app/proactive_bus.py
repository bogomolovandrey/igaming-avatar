"""Per-session asyncio queue for proactive Alex events.

Used by trigger/inject handlers to push deltas + state updates to the
SSE consumer (`GET /api/events`)."""

from __future__ import annotations

import asyncio
import json
from collections import defaultdict
from typing import AsyncIterator

from app.state import SessionState


class ProactiveBus:
    def __init__(self) -> None:
        self._queues: dict[str, asyncio.Queue[str]] = defaultdict(
            lambda: asyncio.Queue(maxsize=200)
        )

    async def publish(self, session_id: str, event: str, data: dict) -> None:
        message = f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
        await self._queues[session_id].put(message)

    async def publish_state(self, session: SessionState) -> None:
        await self.publish(
            session.id,
            "state",
            {
                "mode": session.mode,
                "balance": session.player.balance,
                "loginCount": session.player.loginCount,
                "activeBonuses": [b.model_dump() for b in session.player.activeBonuses],
            },
        )

    async def subscribe(self, session_id: str) -> AsyncIterator[str]:
        queue = self._queues[session_id]
        try:
            while True:
                # 25s heartbeat keeps the SSE connection from idle-closing
                # while still letting us yield real events promptly.
                try:
                    chunk = await asyncio.wait_for(queue.get(), timeout=25.0)
                    yield chunk
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            return


bus = ProactiveBus()
