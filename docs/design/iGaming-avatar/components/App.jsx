// Main App — orchestrates state, device view, screens, tweaks

const INITIAL_CHAT = [
  { role: 'alex', text: 'Хэй 👋 Я Алекс — твой компаньон в мире ставок. Помогу разобраться, подскажу по матчам, просто поболтаю.' },
  { role: 'alex', text: 'Вижу, ты сегодня впервые. Давай коротко: расскажи, какие виды спорта тебе ближе?' },
  { role: 'user', text: 'В основном футбол, иногда баскет смотрю' },
  { role: 'alex', text: 'Отлично, сегодня как раз вечер твой 🔥\nЛа Лига: Реал — Барса в 21:00. Я бы глянул тотал больше 2.5 — у них последние 5 очных встреч 4+ голов.' },
];

const PROACTIVE = {
  big_win: 'Вот это размах! 💰 $520 на одной ставке — поздравляю серьёзно. Хочешь разберём, что сыграло?',
  loss_streak: 'Слушай, заметил — сегодня не твой день. Давай просто передохнём? Я рядом, если что.',
  freebet_expiring: '🎁 Напоминаю: твой фрибет $50 сгорает через 48 часов. Есть пара интересных матчей сегодня, если интересно — подскажу.',
  show_gallery: '',
  first_visit: 'Хэй 👋 Я Алекс — твой компаньон в мире ставок.',
};

const TRIGGER_MODE = {
  big_win: 'celebration',
  loss_streak: 'rg_care',
  freebet_expiring: 'bonus_nudge',
  show_gallery: 'normal',
  first_visit: 'normal',
};

function Confetti({ run }) {
  if (!run) return null;
  const pieces = React.useMemo(() => Array.from({ length: 90 }).map((_, i) => {
    const colors = ['#fbbf24', '#f59e0b', '#ec4899', '#6366f1', '#fcd34d', '#a78bfa'];
    return {
      left: Math.random() * 100,
      dx: (Math.random() - 0.5) * 200,
      dur: 2 + Math.random() * 1.6,
      delay: Math.random() * 0.3,
      color: colors[i % colors.length],
      rot: Math.random() * 360,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
    };
  }), [run]);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 150, overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <div key={i} className="confetto" style={{
          left: p.left + '%',
          background: p.color,
          width: p.w, height: p.h,
          '--dx': p.dx + 'px',
          '--dur': p.dur + 's',
          animationDelay: p.delay + 's',
          transform: `rotate(${p.rot}deg)`,
        }}/>
      ))}
    </div>
  );
}

function TweaksPanel({ state, set }) {
  const [open, setOpen] = React.useState(true);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setActive(true);
      if (e.data?.type === '__deactivate_edit_mode') setActive(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!active) return null;
  if (!open) return <div className="tweaks-badge" onClick={() => setOpen(true)}>⚙ Tweaks</div>;

  const sel = (label, key, opts) => (
    <React.Fragment>
      <label>{label}</label>
      <div className="tweaks-seg">
        {opts.map(o => (
          <button key={o.v} className={state[key] === o.v ? 'active' : ''} onClick={() => set(key, o.v)}>{o.l}</button>
        ))}
      </div>
    </React.Fragment>
  );

  return (
    <div className="tweaks-card">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <h4 style={{ flex: 1 }}>Tweaks</h4>
        <button onClick={() => setOpen(false)} style={{ width: 22, height: 22, padding: 0, background: 'transparent', border: 'none', color: 'var(--text-mute)', cursor: 'pointer', fontSize: 14 }}>−</button>
      </div>

      {sel('Устройство', 'device', [{ v: 'desktop', l: 'Desktop' }, { v: 'mobile', l: 'Mobile' }])}
      {sel('Виджет', 'widgetOpen', [{ v: false, l: 'Свёрнут' }, { v: true, l: 'Развёрнут' }])}
      {sel('Таб', 'tab', [{ v: 'chat', l: 'Chat' }, { v: 'admin', l: 'Admin' }])}

      <label>Состояние чата</label>
      <select value={state.chatState} onChange={e => set('chatState', e.target.value)}>
        <option value="populated">С сообщениями (онбординг)</option>
        <option value="empty">Пустой (первый визит)</option>
        <option value="typing">Алекс печатает</option>
        <option value="voice_playback">Алекс говорит (audio)</option>
      </select>

      <label>Mode / proactive</label>
      <select value={state.mode} onChange={e => set('mode', e.target.value)}>
        <option value="normal">normal</option>
        <option value="celebration">celebration</option>
        <option value="rg_care">rg_care (warm glow)</option>
        <option value="bonus_nudge">bonus_nudge</option>
      </select>

      {sel('Proactive bubble', 'showBubble', [{ v: false, l: 'Нет' }, { v: true, l: 'Показать' }])}
      {sel('Микрофон', 'micActive', [{ v: false, l: 'Off' }, { v: true, l: 'On' }])}
      {sel('Freebet badge', 'freebetBadge', [{ v: false, l: 'Off' }, { v: true, l: 'On' }])}
      {sel('Session chip', 'showSessionChip', [{ v: false, l: 'Off' }, { v: true, l: 'On' }])}
      {sel('Позиция аватарки', 'avatarPos', [{ v: 'right', l: 'Справа' }, { v: 'left', l: 'Слева' }])}

      <label style={{ marginTop: 14 }}>Быстрые действия</label>
      <button onClick={() => set('fireTrigger', 'big_win')} style={{ marginBottom: 6 }}>🎉 Big win + конфетти</button>
      <button onClick={() => set('fireTrigger', 'loss_streak')} style={{ marginBottom: 6 }}>😔 Loss streak → RG</button>
      <button onClick={() => set('showGallery', true)}>🎭 Открыть галерею</button>
    </div>
  );
}

function App() {
  const [state, setState] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('alex-demo-state') || '{}');
      return {
        device: 'desktop',
        widgetOpen: true,
        tab: 'chat',
        chatState: 'populated',
        mode: 'normal',
        showBubble: false,
        micActive: false,
        freebetBadge: false,
        showSessionChip: true,
        showGallery: false,
        avatarPos: 'right',
        ...saved,
      };
    } catch {
      return { device: 'desktop', widgetOpen: true, tab: 'chat', chatState: 'populated', mode: 'normal', showBubble: false, micActive: false, freebetBadge: false, showSessionChip: true, showGallery: false, avatarPos: 'right' };
    }
  });

  const [balance, setBalance] = React.useState(840);
  const [balanceFlash, setBalanceFlash] = React.useState(false);
  const [confetti, setConfetti] = React.useState(false);
  const [messages, setMessages] = React.useState(INITIAL_CHAT);
  const [lastTriggered, setLastTriggered] = React.useState(null);
  const sessionId = 'bright-fox';

  const set = (k, v) => {
    setState(s => {
      const next = { ...s, [k]: v };
      // Auto-collapse widget when switching device so the avatar icon is always visible first
      if (k === 'device' && v !== s.device) next.widgetOpen = false;
      try { localStorage.setItem('alex-demo-state', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Handle fireTrigger from tweaks
  React.useEffect(() => {
    if (state.fireTrigger) {
      fireTrigger(state.fireTrigger);
      set('fireTrigger', null);
    }
  }, [state.fireTrigger]);

  // chatState → derived flags
  const typing = state.chatState === 'typing';
  const voicePlayback = state.chatState === 'voice_playback';

  const displayMessages = React.useMemo(() => {
    if (state.chatState === 'empty') return [];
    const msgs = state.chatState === 'populated' || state.chatState === 'typing' || state.chatState === 'voice_playback'
      ? [...messages]
      : [];
    if (voicePlayback && msgs.length > 0) {
      const last = { ...msgs[msgs.length - 1], voicePlayback: true };
      msgs[msgs.length - 1] = last;
    }
    return msgs;
  }, [state.chatState, messages, voicePlayback]);

  function fireTrigger(id) {
    setLastTriggered(id);
    setTimeout(() => setLastTriggered(null), 1500);
    const mode = TRIGGER_MODE[id] || 'normal';
    set('mode', mode);

    if (id === 'big_win') {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
      setBalance(b => b + 520);
      setBalanceFlash(true);
      setTimeout(() => setBalanceFlash(false), 2000);
      setMessages(m => [...m, { role: 'alex', text: PROACTIVE.big_win }]);
      set('showBubble', true);
    } else if (id === 'loss_streak') {
      setMessages(m => [...m, { role: 'alex', text: PROACTIVE.loss_streak }]);
      set('showBubble', true);
    } else if (id === 'freebet_expiring') {
      set('freebetBadge', true);
      setMessages(m => [...m, { role: 'alex', text: PROACTIVE.freebet_expiring }]);
      set('showBubble', true);
    } else if (id === 'show_gallery') {
      set('showGallery', true);
    } else if (id === 'first_visit') {
      setMessages(INITIAL_CHAT);
      setBalance(840);
      set('freebetBadge', false);
      set('mode', 'normal');
      set('showBubble', false);
      setConfetti(false);
    }
  }

  function sendUser(text) {
    setMessages(m => [...m, { role: 'user', text }]);
  }

  const chatProps = {
    messages: displayMessages,
    typing,
    micActive: state.micActive,
    interim: state.micActive ? 'Покажи мне самые верные коэффициенты…' : '',
    rgMode: state.mode,
  };

  const adminProps = {
    sessionId, mode: state.mode, balance, loginCount: 1,
    onTrigger: fireTrigger, lastTriggered,
    miniTranscript: messages.map(m => ({ role: m.role, text: m.text })),
  };

  const inputProps = {
    onSend: sendUser,
    micActive: state.micActive,
    onMicDown: () => set('micActive', true),
    onMicUp: () => set('micActive', false),
    interim: 'Покажи мне самые верные коэффициенты…',
  };

  const widgetBodyProps = {
    tab: state.tab,
    setTab: (t) => set('tab', t),
    onClose: () => set('widgetOpen', false),
    onMinimize: () => set('widgetOpen', false),
    chatProps, adminProps, inputProps,
    rgMode: state.mode,
  };

  const proactiveText = state.showBubble ? (PROACTIVE[
    state.mode === 'celebration' ? 'big_win' :
    state.mode === 'rg_care' ? 'loss_streak' :
    state.mode === 'bonus_nudge' ? 'freebet_expiring' :
    'first_visit'
  ] || 'Готов помочь, как будет нужно.') : null;

  /* ── render ── */

  const isDesktop = state.device === 'desktop';
  const isMobile = state.device === 'mobile';

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      {isDesktop && (
        <React.Fragment>
          <Backdrop
            balance={balance} balanceFlash={balanceFlash}
            freebetBadge={state.freebetBadge}
            onPanelClick={() => { set('widgetOpen', true); set('tab', 'admin'); }}
            sessionId={sessionId} showSessionChip={state.showSessionChip}
          />
          {state.widgetOpen
            ? <DesktopWidget {...widgetBodyProps} />
            : <CollapsedWidget
                onOpen={() => { set('widgetOpen', true); set('showBubble', false); }}
                bubble={proactiveText}
                onCloseBubble={() => set('showBubble', false)}
                rgMode={state.mode}
                position={state.avatarPos}
              />}
        </React.Fragment>
      )}

      {isMobile && (
        <div style={{
          width: '100vw', height: '100vh',
          display: 'grid', placeItems: 'center',
          background: `
            radial-gradient(circle at 20% 30%, rgba(99,102,241,0.08), transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(236,72,153,0.06), transparent 55%),
            #05070a
          `,
          overflow: 'hidden',
        }}>
          <IOSDevice width={402} height={874} dark>
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', paddingTop: 58 }}>
              <BackdropMobile
                balance={balance} balanceFlash={balanceFlash}
                freebetBadge={state.freebetBadge}
                sessionId={sessionId} showSessionChip={state.showSessionChip}
              />
              {state.widgetOpen
                ? <MobileWidget {...widgetBodyProps} />
                : (
                  <div style={{ position: 'absolute', bottom: 24, [state.avatarPos === 'left' ? 'left' : 'right']: 18, zIndex: 40 }}>
                    {proactiveText && (
                      <SpeechBubbleAbs text={proactiveText} onClick={() => { set('widgetOpen', true); set('showBubble', false); }} onClose={() => set('showBubble', false)} />
                    )}
                    <button onClick={() => set('widgetOpen', true)} className={state.mode === 'rg_care' ? 'rg-glow' : ''} style={{ width: 64, height: 64, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
                      <AlexAvatar size={64} online pulse={!proactiveText} />
                    </button>
                  </div>
                )
              }
            </div>
          </IOSDevice>
        </div>
      )}

      {state.showGallery && <Gallery onClose={() => set('showGallery', false)} mobile={isMobile} />}

      <Confetti run={confetti} />

      <TweaksPanel state={state} set={set} />
    </div>
  );
}

// Positioned speech bubble for mobile
function SpeechBubbleAbs({ text, onClick, onClose }) {
  return (
    <div className="bubble-in" onClick={onClick} style={{
      position: 'absolute', bottom: 74, right: 0,
      width: 240,
      background: 'rgba(26,31,46,0.95)',
      backdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14, borderBottomRightRadius: 4,
      padding: '10px 12px',
      color: 'var(--text)', fontSize: 12.5, lineHeight: 1.4,
      cursor: 'pointer',
      boxShadow: '0 14px 40px rgba(0,0,0,0.55)',
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>{text}</div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{
          background: 'transparent', border: 'none', color: 'var(--text-mute)',
          cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1,
        }}>×</button>
      </div>
    </div>
  );
}

window.SpeechBubbleAbs = SpeechBubbleAbs;

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
