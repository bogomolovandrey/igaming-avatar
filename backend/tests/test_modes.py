from app.demo_state_loader import load_demo_state
from app.modes import maybe_auto_shift
from app.state import Message, SessionState, player_from_template, set_mode


def _new(mode):
    s = SessionState(
        id="t",
        player=player_from_template(load_demo_state().player_template),
    )
    set_mode(s, mode)
    return s


def _user(s):
    s.conversation.append(
        Message(role="user", content="x", at="now", source="text")
    )


def _assistant(s):
    s.conversation.append(
        Message(role="assistant", content="y", at="now", source="text")
    )


def test_onboarding_to_normal_after_one_user_turn():
    s = _new("onboarding")
    _user(s)
    _assistant(s)
    assert maybe_auto_shift(s) == "normal"


def test_celebration_needs_two_user_turns():
    s = _new("celebration")
    _user(s)
    _assistant(s)
    assert maybe_auto_shift(s) == "celebration"
    _user(s)
    _assistant(s)
    assert maybe_auto_shift(s) == "normal"


def test_bonus_nudge_to_normal_after_one_user_turn():
    s = _new("bonus_nudge")
    _user(s)
    _assistant(s)
    assert maybe_auto_shift(s) == "normal"


def test_rg_care_is_sticky():
    s = _new("rg_care")
    for _ in range(5):
        _user(s)
        _assistant(s)
    assert maybe_auto_shift(s) == "rg_care"
