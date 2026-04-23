import pytest

from app.state import SessionStore


@pytest.mark.asyncio
async def test_create_returns_unique_session():
    store = SessionStore()
    a = await store.create()
    b = await store.create()
    assert a.id != b.id
    assert a.player.balance == 840
    assert a.mode == "onboarding"


@pytest.mark.asyncio
async def test_get_or_create_resumes_existing():
    store = SessionStore()
    a = await store.create()
    again = await store.get_or_create(a.id)
    assert again is a


@pytest.mark.asyncio
async def test_get_or_create_creates_on_unknown_id():
    store = SessionStore()
    s = await store.get_or_create("nonexistent")
    assert s.id != "nonexistent"


@pytest.mark.asyncio
async def test_reset_clears_history_and_resets_mode():
    store = SessionStore()
    s = await store.create()
    s.player.balance = 1000
    s.mode = "celebration"
    s.conversation = []  # noop but explicit
    await store.reset(s.id)
    fresh = await store.get(s.id)
    assert fresh is not None
    assert fresh.mode == "onboarding"
    assert fresh.player.balance == 840
