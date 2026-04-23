from app.demo_state_loader import load_demo_state


def test_loads_matches():
    state = load_demo_state()
    assert len(state.matches) >= 5
    real_barca = state.match_by_id("m_real_barca")
    assert real_barca is not None
    assert real_barca.home == "Реал Мадрид"
    assert real_barca.odds.home == 2.10


def test_player_template():
    state = load_demo_state()
    p = state.player_template
    assert p.balance == 840
    assert p.currency == "USD"


def test_trigger_presets():
    state = load_demo_state()
    big_win = state.trigger_presets.big_win
    assert big_win.payout == 520
    assert big_win.matchId == "m_real_barca"


def test_bonus_catalog():
    state = load_demo_state()
    freebet = state.bonus_by_id("freebet_10")
    assert freebet is not None
    assert freebet.amount == 10
    assert freebet.expires_in_hours == 48
