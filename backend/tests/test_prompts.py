from app.demo_state_loader import load_demo_state
from app.prompts import build_alex_prompt
from app.state import (
    DemoEvent,
    Player,
    SessionState,
    player_from_template,
)


def _new_session(mode="onboarding", with_event=None) -> SessionState:
    demo = load_demo_state()
    s = SessionState(
        id="test-session",
        player=player_from_template(demo.player_template),
        mode=mode,
    )
    s.lastEvent = with_event
    return s


def test_prompt_contains_persona_and_state():
    s = _new_session()
    prompt = build_alex_prompt(s)
    assert "Алекс" in prompt
    assert "PERSONA" in prompt
    assert "GLOBAL STATE" in prompt
    assert "SESSION STATE" in prompt
    assert "MODE" in prompt
    # global state has at least one match
    assert "Реал Мадрид" in prompt
    # session state has player tag
    assert "<player " in prompt
    assert "<mode>onboarding</mode>" in prompt


def test_prompt_includes_event_when_present():
    event = DemoEvent(
        type="big_win",
        payload={"payout": 520, "stake": 100, "odds": 5.20},
        at="2026-04-23T20:15:00+00:00",
    )
    s = _new_session(mode="celebration", with_event=event)
    prompt = build_alex_prompt(s)
    assert "LAST EVENT" in prompt
    assert "big_win" in prompt
    assert 'payout="520"' in prompt


def test_each_mode_renders():
    for mode in ["onboarding", "normal", "celebration", "rg_care", "bonus_nudge"]:
        s = _new_session(mode=mode)
        prompt = build_alex_prompt(s)
        assert f"<mode>{mode}</mode>" in prompt
