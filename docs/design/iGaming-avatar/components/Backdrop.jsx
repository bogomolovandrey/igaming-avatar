// BETARENA bookmaker backdrop — refined, typography-led, minimal decoration

const LEAGUES = [
  { code: 'FB', name: 'Ла Лига', count: 8 },
  { code: 'FB', name: 'АПЛ', count: 6 },
  { code: 'FB', name: 'Серия А', count: 5 },
  { code: 'FB', name: 'Бундеслига', count: 7 },
  { code: 'BB', name: 'NBA', count: 11 },
  { code: 'BB', name: 'Евролига', count: 4 },
  { code: 'TN', name: 'ATP Tour', count: 14 },
  { code: 'HK', name: 'КХЛ', count: 6 },
  { code: 'MM', name: 'UFC', count: 3 },
];

const MATCHES = [
  { id: 'm1', sport: 'FB', league: 'Ла Лига', home: 'Реал Мадрид', away: 'Барселона', time: '21:00', odds: ['2.10', '3.40', '3.20'], featured: true },
  { id: 'm2', sport: 'FB', league: 'АПЛ', home: 'Ливерпуль', away: 'Манчестер Сити', time: '18:30', odds: ['1.85', '3.60', '4.20'] },
  { id: 'm3', sport: 'BB', league: 'NBA', home: 'Лейкерс', away: 'Бостон', time: '03:00', odds: ['1.95', null, '1.85'] },
  { id: 'm4', sport: 'FB', league: 'Серия А', home: 'Интер', away: 'Милан', time: '22:45', odds: ['2.40', '3.30', '2.90'] },
  { id: 'm5', sport: 'TN', league: 'ATP 500', home: 'Алькарас', away: 'Синнер', time: '16:00', odds: ['1.72', null, '2.10'] },
];

function SportTag({ code, dim }) {
  return <span className="mono" style={{
    display: 'inline-block', minWidth: 22, height: 18,
    padding: '0 5px', lineHeight: '18px', textAlign: 'center',
    fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
    color: dim ? 'var(--text-mute)' : 'var(--text-dim)',
    border: '1px solid var(--border-strong)',
    borderRadius: 3,
    background: 'transparent',
  }}>{code}</span>;
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="0.5" y="0.5" width="21" height="21" rx="4" stroke="#fbbf24" strokeWidth="1"/>
        <path d="M6 6 H12 A3 3 0 0 1 12 12 H6 Z M6 11 H13 A3 3 0 0 1 13 17 H6 Z" fill="#fbbf24"/>
      </svg>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text)' }}>
        BETARENA
      </div>
    </div>
  );
}

function Header({ balance, balanceFlash, freebetBadge, onPanelClick, compact = false }) {
  const nav = ['Спорт', 'Live', 'Казино', 'Промо'];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 5,
      background: 'rgba(10,14,20,0.92)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
      height: compact ? 52 : 58,
      display: 'flex', alignItems: 'center',
      padding: compact ? '0 10px' : '0 24px',
      gap: compact ? 8 : 28,
    }}>
      {compact ? (
        <button aria-label="menu" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: 4, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 5h12M3 9h12M3 13h12"/></svg>
        </button>
      ) : null}
      <Logo />
      {!compact && (
        <nav style={{ display: 'flex', gap: 2, marginLeft: 8, alignSelf: 'stretch', alignItems: 'stretch' }}>
          {nav.map((n, i) => (
            <a key={n} href="#" style={{
              display: 'flex', alignItems: 'center',
              padding: '0 14px', fontSize: 13, fontWeight: 500,
              color: i === 0 ? 'var(--text)' : 'var(--text-dim)',
              textDecoration: 'none',
              borderBottom: i === 0 ? '1px solid var(--gold)' : '1px solid transparent',
            }}>{n}</a>
          ))}
        </nav>
      )}
      <div style={{ flex: 1 }} />
      {freebetBadge && !compact && (
        <div style={{
          border: '1px solid rgba(251,191,36,0.35)',
          color: 'var(--gold)',
          padding: '4px 10px', borderRadius: 3,
          fontSize: 11, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8,
        }} className="mono">
          <span>FREEBET $50</span>
          <span style={{ color: 'var(--text-mute)' }}>48h</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 8 : 16 }}>
        {!compact && (
          <div style={{ textAlign: 'right', lineHeight: 1.1 }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Balance</div>
            <div className={balanceFlash ? 'balance-flash mono' : 'mono'} style={{ fontSize: 14, fontWeight: 500, color: 'var(--gold)', fontVariantNumeric: 'tabular-nums' }}>
              ${balance.toFixed(2)}
            </div>
          </div>
        )}
        {compact && (
          <div className={balanceFlash ? 'balance-flash mono' : 'mono'} style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)', fontVariantNumeric: 'tabular-nums' }}>
            ${balance.toFixed(0)}
          </div>
        )}
        <button className="btn-hover" style={{
          background: 'var(--gold)',
          color: '#0a0e14', border: 'none',
          padding: compact ? '6px 10px' : '8px 16px', borderRadius: 4,
          fontSize: compact ? 11.5 : 12.5, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.02em', whiteSpace: 'nowrap',
        }}>{compact ? '+ Депозит' : 'Депозит'}</button>
        {!compact && (
          <button onClick={onPanelClick} className="btn-hover" title="Panel" style={{
            width: 32, height: 32,
            background: 'transparent', color: 'var(--text-dim)',
            border: '1px solid var(--border-strong)', borderRadius: 4,
            cursor: 'pointer', fontSize: 14,
            display: 'grid', placeItems: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2" stroke="currentColor"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.5 2.5l1.5 1.5M10 10l1.5 1.5M2.5 11.5L4 10M10 4l1.5-1.5" stroke="currentColor"/></svg>
          </button>
        )}
      </div>
    </header>
  );
}

function LeagueSidebar() {
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      borderRight: '1px solid var(--border)',
      padding: '20px 0',
      height: 'calc(100vh - 58px)', overflow: 'auto', position: 'sticky', top: 58,
    }}>
      <div className="mono" style={{ padding: '0 18px 14px', fontSize: 10, fontWeight: 500, color: 'var(--text-mute)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Top leagues</div>
      {LEAGUES.map((l, i) => (
        <a key={i} href="#" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 18px', fontSize: 13, color: i === 0 ? 'var(--text)' : 'var(--text-dim)',
          textDecoration: 'none',
          borderLeft: i === 0 ? '2px solid var(--gold)' : '2px solid transparent',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = i === 0 ? 'var(--text)' : 'var(--text-dim)'}
        >
          <SportTag code={l.code} />
          <span style={{ flex: 1 }}>{l.name}</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>{l.count}</span>
        </a>
      ))}
    </aside>
  );
}

function OddsChip({ label, value, highlighted }) {
  if (!value) return (
    <div style={{
      flex: 1, background: 'transparent', border: '1px solid var(--border)',
      borderRadius: 4, padding: '9px 12px', textAlign: 'center',
      color: 'var(--text-mute)', fontSize: 12,
    }}>—</div>
  );
  return (
    <button className="odds" style={{
      flex: 1,
      background: 'transparent',
      border: '1px solid var(--border-strong)',
      borderRadius: 4, padding: '8px 12px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      cursor: 'pointer', color: 'var(--text)',
    }}>
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-mute)', fontWeight: 500, letterSpacing: '0.05em' }}>{label}</span>
      <span className="mono" style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--gold)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </button>
  );
}

function MatchCard({ m, compact = false }) {
  const isFootball = m.odds.length === 3 && m.odds[1];
  return (
    <div className="match-card" style={{
      background: 'transparent',
      border: '1px solid var(--border)',
      borderRadius: 6, padding: compact ? 14 : 16,
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--text-mute)' }}>
        <SportTag code={m.sport} />
        <span className="mono" style={{ fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{m.league}</span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ color: 'var(--text-dim)' }}>{m.time}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontSize: compact ? 14 : 15, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.005em' }}>{m.home}</div>
        <div style={{ fontSize: compact ? 14 : 15, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.005em' }}>{m.away}</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <OddsChip label="П1" value={m.odds[0]} highlighted={m.featured} />
        {isFootball && <OddsChip label="X" value={m.odds[1]} />}
        <OddsChip label="П2" value={m.odds[2]} />
      </div>
    </div>
  );
}

function Feed({ compact = false }) {
  return (
    <main style={{ flex: 1, minWidth: 0, padding: compact ? '16px 12px 120px' : '28px 32px 60px', overflow: 'auto', height: 'calc(100vh - 58px)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: compact ? 20 : 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Сегодня</h2>
        <span className="mono" style={{ color: 'var(--text-mute)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>· Top matches</span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>{MATCHES.length.toString().padStart(2, '0')} events</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 10,
      }}>
        {MATCHES.map(m => <MatchCard key={m.id} m={m} compact={compact} />)}
      </div>

      {!compact && (
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em' }}>Лайв</h3>
            <span className="mono" style={{ color: 'var(--error)', fontSize: 10.5, letterSpacing: '0.12em' }}>● NOW</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 10,
          }}>
            {[
              { h: 'Атлетико', a: 'Севилья', score: '1:0', min: "34'" },
              { h: 'Бавария', a: 'Лейпциг', score: '2:2', min: "67'" },
              { h: 'Спартак', a: 'Зенит', score: '0:1', min: "21'" },
            ].map((l, i) => (
              <div key={i} className="match-card" style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--error)' }}/>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--error)', fontWeight: 500, letterSpacing: '0.12em' }}>LIVE</span>
                  <span style={{ flex: 1 }} />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{l.min}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 500, marginBottom: 2 }}><span>{l.h}</span><span className="mono" style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{l.score.split(':')[0]}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 500 }}><span>{l.a}</span><span className="mono" style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{l.score.split(':')[1]}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function RightRail() {
  return (
    <aside style={{
      width: 260, flexShrink: 0, borderLeft: '1px solid var(--border)',
      padding: '20px 18px', height: 'calc(100vh - 58px)', overflow: 'auto', position: 'sticky', top: 58,
    }}>
      <div style={{
        border: '1px solid var(--border-strong)', borderRadius: 6, padding: '16px 16px 18px',
        marginBottom: 20, background: 'transparent',
      }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 500, letterSpacing: '0.14em' }}>PROMO / 01</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 10, lineHeight: 1.3, letterSpacing: '-0.01em' }}>Экспресс дня</div>
        <div style={{ fontSize: 13, color: 'var(--gold)', marginTop: 6, fontWeight: 500 }}>× коэф +15%</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.45 }}>Собери экспресс из 4+ событий сегодня.</div>
      </div>
      <div className="mono" style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-mute)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>Купон</div>
      <div style={{ border: '1px dashed var(--border-strong)', borderRadius: 6, padding: '28px 16px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
        Купон пуст
        <div style={{ fontSize: 11, marginTop: 6, color: 'var(--text-mute)' }}>Добавь событие из списка</div>
      </div>
    </aside>
  );
}

function SessionChip({ id }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div onClick={() => { navigator.clipboard?.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      style={{
      position: 'fixed', bottom: 12, left: 12, zIndex: 3,
      background: 'rgba(10,14,20,0.85)', backdropFilter: 'blur(8px)',
      border: '1px solid var(--border)', borderRadius: 3,
      padding: '5px 9px', fontSize: 10.5,
      color: 'var(--text-mute)', cursor: 'pointer',
      userSelect: 'none', letterSpacing: '0.02em',
    }} className="mono">
      {copied ? 'copied' : `sess · ${id}`}
    </div>
  );
}

function Backdrop({ balance, balanceFlash, freebetBadge, onPanelClick, sessionId, showSessionChip }) {
  return (
    <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <Header balance={balance} balanceFlash={balanceFlash} freebetBadge={freebetBadge} onPanelClick={onPanelClick} />
      <div style={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0 }}>
        <LeagueSidebar />
        <Feed />
      </div>
      {showSessionChip && <SessionChip id={sessionId} />}
    </div>
  );
}

function BackdropMobile({ balance, balanceFlash, freebetBadge, sessionId, showSessionChip }) {
  const sportTabs = [
    { code: 'FB', label: 'Футбол' },
    { code: 'BB', label: 'Баскет' },
    { code: 'TN', label: 'Теннис' },
    { code: 'HK', label: 'Хоккей' },
    { code: 'MM', label: 'UFC' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <Header balance={balance} balanceFlash={balanceFlash} freebetBadge={freebetBadge} compact />
      <div style={{ display: 'flex', gap: 6, padding: '10px 12px', borderBottom: '1px solid var(--border)', overflowX: 'auto', flexShrink: 0 }}>
        {sportTabs.map((t, i) => (
          <button key={t.code} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 11px', fontSize: 12, fontWeight: 500,
            borderRadius: 4,
            background: i === 0 ? 'rgba(251,191,36,0.1)' : 'transparent',
            color: i === 0 ? 'var(--gold)' : 'var(--text-dim)',
            border: i === 0 ? '1px solid rgba(251,191,36,0.4)' : '1px solid var(--border)',
          }}>
            <span className="mono" style={{ fontSize: 9.5, opacity: 0.7 }}>{t.code}</span>
            {t.label}
          </button>
        ))}
      </div>
      <Feed compact />
      {showSessionChip && <SessionChip id={sessionId} />}
    </div>
  );
}

window.Backdrop = Backdrop;
window.BackdropMobile = BackdropMobile;
