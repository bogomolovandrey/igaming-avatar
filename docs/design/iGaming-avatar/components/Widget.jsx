// Alex widget — collapsed avatar, expanded sidebar (desktop), fullscreen (mobile)

const AVATAR_GRADIENT = 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)';

function AlexAvatar({ size = 40, online = true, pulse = false, ring = false }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div className={pulse ? 'alex-pulse' : ''} style={{
        width: size, height: size, borderRadius: '50%',
        background: AVATAR_GRADIENT,
        display: 'grid', placeItems: 'center',
        color: '#fff',
        fontSize: size * 0.46, fontWeight: 700,
        fontFamily: 'Manrope, sans-serif',
        letterSpacing: '-0.02em',
        boxShadow: ring ? '0 0 0 2px rgba(245,158,11,0.5), 0 6px 20px rgba(99,102,241,0.35)' : '0 6px 20px rgba(99,102,241,0.25)',
        border: '2px solid rgba(255,255,255,0.08)',
      }}>А</div>
      {online && (
        <div style={{
          position: 'absolute', right: size * 0.02, bottom: size * 0.02,
          width: Math.max(8, size * 0.22), height: Math.max(8, size * 0.22),
          borderRadius: '50%',
          background: 'var(--success)',
          border: '2px solid var(--bg)',
        }}/>
      )}
    </div>
  );
}

function SpeechBubble({ text, onClick, onClose }) {
  return (
    <div className="bubble-in" onClick={onClick} style={{
      position: 'absolute', bottom: 88, right: 0,
      maxWidth: 260, minWidth: 200,
      background: 'rgba(26,31,46,0.94)',
      backdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14, borderBottomRightRadius: 4,
      padding: '12px 14px',
      color: 'var(--text)', fontSize: 13, lineHeight: 1.45,
      cursor: 'pointer',
      boxShadow: '0 14px 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>{text}</div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{
          background: 'transparent', border: 'none', color: 'var(--text-mute)',
          cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1, marginTop: -2,
        }}>×</button>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--text-mute)', marginTop: 6, letterSpacing: '0.03em' }}>Нажми, чтобы ответить</div>
    </div>
  );
}

function CollapsedWidget({ onOpen, bubble, onCloseBubble, rgMode, position }) {
  const ringPulse = !bubble;
  return (
    <div style={{
      position: 'fixed', zIndex: 90,
      bottom: 24, [position === 'left' ? 'left' : 'right']: 24,
    }}>
      {bubble && <SpeechBubble text={bubble} onClick={onOpen} onClose={onCloseBubble} />}
      <button onClick={onOpen} className={rgMode === 'rg_care' ? 'rg-glow' : ''} style={{
        width: 68, height: 68, borderRadius: '50%',
        background: 'transparent', border: 'none', cursor: 'pointer',
        padding: 0,
        position: 'relative',
      }}>
        <AlexAvatar size={68} online pulse={ringPulse} />
      </button>
    </div>
  );
}

/* ── Chat view ─────────────────────────────────────── */

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className="fade-in" style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 10,
      gap: 8,
    }}>
      {!isUser && <AlexAvatar size={28} online={false} />}
      <div style={{
        maxWidth: '78%',
        padding: '9px 13px',
        borderRadius: 14,
        borderBottomLeftRadius: isUser ? 14 : 4,
        borderBottomRightRadius: isUser ? 4 : 14,
        background: isUser
          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
          : 'rgba(255,255,255,0.04)',
        color: isUser ? '#0a0e14' : 'var(--text)',
        fontSize: 14, lineHeight: 1.45,
        fontWeight: isUser ? 600 : 400,
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.05)',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.text}
        {msg.voicePlayback && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', padding: 0, fontSize: 14 }}>⏸</button>
            <div style={{ flex: 1, height: 22, display: 'flex', alignItems: 'center', gap: 2 }}>
              {Array.from({length: 24}).map((_, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: 1,
                  height: [6,10,14,9,18,12,8,16,20,11,7,14,19,10,6,12,15,8,17,11,6,9,13,7][i],
                  background: i < 9 ? 'var(--gold)' : 'rgba(255,255,255,0.18)',
                }}/>
              ))}
            </div>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>0:06 / 0:18</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
      <AlexAvatar size={28} online={false} />
      <div style={{
        padding: '11px 16px',
        borderRadius: 14, borderBottomLeftRadius: 4,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span className="dot"/><span className="dot"/><span className="dot"/>
      </div>
    </div>
  );
}

function ChatView({ messages, typing, micActive, interim, rgMode }) {
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, typing]);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: rgMode === 'rg_care' ? 'linear-gradient(180deg, rgba(245,158,11,0.04) 0%, transparent 40%)' : 'transparent' }}>
      {rgMode === 'rg_care' && (
        <div style={{
          margin: '10px 14px 0',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 10, padding: '8px 12px',
          fontSize: 11.5, color: '#fcd34d', display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <span>🫂</span><span>Режим заботы · Алекс рядом</span>
        </div>
      )}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 6px' }}>
        {messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
        {typing && <TypingIndicator />}
      </div>
      {micActive && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(236,72,153,0.06)' }}>
          <div style={{ fontSize: 10, color: '#fb7185', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>СЛУШАЮ…</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic' }}>{interim || '…'}</div>
        </div>
      )}
    </div>
  );
}

/* ── Admin view ────────────────────────────────── */

const TriggerIcon = ({ id }) => {
  const s = { stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  switch (id) {
    case 'big_win': return (
      <svg width="18" height="18" viewBox="0 0 20 20" {...s}>
        <path d="M10 2 L11.6 7 L17 7 L12.7 10.2 L14.3 15.2 L10 12 L5.7 15.2 L7.3 10.2 L3 7 L8.4 7 Z"/>
      </svg>
    );
    case 'loss_streak': return (
      <svg width="18" height="18" viewBox="0 0 20 20" {...s}>
        <path d="M3 15 L7 10 L10 12 L13 7 L17 11"/>
        <path d="M17 11 L17 7 L13 7" />
      </svg>
    );
    case 'freebet_expiring': return (
      <svg width="18" height="18" viewBox="0 0 20 20" {...s}>
        <circle cx="10" cy="10" r="7"/>
        <path d="M10 6 V10 L12.5 12"/>
      </svg>
    );
    case 'show_gallery': return (
      <svg width="18" height="18" viewBox="0 0 20 20" {...s}>
        <rect x="3" y="3" width="6" height="6" rx="1"/>
        <rect x="11" y="3" width="6" height="6" rx="1"/>
        <rect x="3" y="11" width="6" height="6" rx="1"/>
        <rect x="11" y="11" width="6" height="6" rx="1"/>
      </svg>
    );
    case 'first_visit': return (
      <svg width="18" height="18" viewBox="0 0 20 20" {...s}>
        <path d="M16 10 A6 6 0 1 1 10 4 L13 4"/>
        <path d="M13 1.5 L13 4 L10.5 4" />
      </svg>
    );
    default: return null;
  }
};

const TRIGGERS = [
  { id: 'big_win', label: 'Крупный выигрыш', desc: 'Конфетти + proactive реплика', kbd: '⌘1' },
  { id: 'loss_streak', label: 'Серия проигрышей 5×', desc: 'Переход в RG care режим', kbd: '⌘2' },
  { id: 'freebet_expiring', label: 'Фрибет сгорает (48ч)', desc: 'Badge в хедере + нудж', kbd: '⌘3' },
  { id: 'show_gallery', label: 'Галерея персонажей', desc: 'Открывает модал с командой', kbd: '⌘4' },
  { id: 'first_visit', label: 'Сброс / первый визит', desc: 'Чат и mode очищаются', kbd: '⌘5' },
];

function AdminBlock({ title, children, collapsible, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10, marginBottom: 10,
    }}>
      <button
        onClick={() => collapsible && setOpen(!open)}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          padding: '10px 12px', color: 'var(--text-dim)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: collapsible ? 'pointer' : 'default',
        }}>
        <span>{title}</span>
        {collapsible && <span style={{ fontSize: 10 }}>{open ? '▾' : '▸'}</span>}
      </button>
      {open && <div style={{ padding: '0 12px 12px' }}>{children}</div>}
    </div>
  );
}

function TriggerButton({ t, onClick, active }) {
  return (
    <button onClick={() => onClick(t.id)} className="btn-hover" style={{
      width: '100%',
      display: 'flex', alignItems: 'center', gap: 12,
      background: active ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.02)',
      border: active ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8, padding: '10px 12px',
      cursor: 'pointer', textAlign: 'left', color: 'var(--text)',
      marginBottom: 6,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'grid', placeItems: 'center',
        color: active ? 'var(--gold)' : 'var(--text-dim)',
        flexShrink: 0,
      }}>
        <TriggerIcon id={t.id} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{t.desc}</div>
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--text-mute)' }}>{t.kbd}</div>
    </button>
  );
}

function AdminView({ sessionId, mode, balance, loginCount, onTrigger, lastTriggered, miniTranscript }) {
  const [custom, setCustom] = React.useState('');
  const [injectText, setInjectText] = React.useState('');
  const [injectVoice, setInjectVoice] = React.useState(true);
  const [customMode, setCustomMode] = React.useState('normal');

  const modeColor = {
    normal: 'var(--text-dim)',
    celebration: 'var(--gold)',
    rg_care: 'var(--warn)',
    bonus_nudge: 'var(--blue)',
  }[mode] || 'var(--text-dim)';

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 14px', background: 'rgba(5,7,12,0.4)' }}>
      {/* Session Info */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10, padding: 12, marginBottom: 12,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>session</div>
            <div className="mono" style={{ fontSize: 13, color: 'var(--text)', marginTop: 2 }}>{sessionId}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>mode</div>
            <div className="mono" style={{ fontSize: 13, color: modeColor, marginTop: 2, fontWeight: 600 }}>{mode}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>balance</div>
            <div className="mono" style={{ fontSize: 13, color: 'var(--gold)', marginTop: 2 }}>${balance.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>loginCount</div>
            <div className="mono" style={{ fontSize: 13, marginTop: 2 }}>{loginCount}</div>
          </div>
        </div>
      </div>

      <AdminBlock title="⚡ Preset triggers">
        {TRIGGERS.map(t => <TriggerButton key={t.id} t={t} onClick={onTrigger} active={lastTriggered === t.id} />)}
      </AdminBlock>

      <AdminBlock title="📝 Custom event" collapsible defaultOpen={false}>
        <textarea
          value={custom} onChange={e => setCustom(e.target.value)}
          placeholder="Игрок только что пополнил $500"
          style={{
            width: '100%', minHeight: 60, padding: 10,
            background: '#0c1220', border: '1px solid var(--border-strong)',
            borderRadius: 8, color: 'var(--text)', fontSize: 13,
            resize: 'vertical', fontFamily: 'inherit', marginBottom: 8,
          }}/>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={customMode} onChange={e => setCustomMode(e.target.value)} style={{ flex: 1, background: '#0c1220', border: '1px solid var(--border-strong)', borderRadius: 8, padding: 8, color: 'var(--text)', fontSize: 12 }} className="mono">
            <option value="normal">mode: normal</option>
            <option value="celebration">mode: celebration</option>
            <option value="rg_care">mode: rg_care</option>
            <option value="bonus_nudge">mode: bonus_nudge</option>
          </select>
          <button className="btn-hover" style={{ padding: '8px 14px', background: 'var(--gold)', color: '#0a0e14', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Отправить</button>
        </div>
      </AdminBlock>

      <AdminBlock title="💬 Inject as user" collapsible defaultOpen={false}>
        <textarea
          value={injectText} onChange={e => setInjectText(e.target.value)}
          placeholder="Реплика от имени пользователя"
          style={{
            width: '100%', minHeight: 50, padding: 10,
            background: '#0c1220', border: '1px solid var(--border-strong)',
            borderRadius: 8, color: 'var(--text)', fontSize: 13,
            resize: 'vertical', fontFamily: 'inherit', marginBottom: 8,
          }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)', cursor: 'pointer', flex: 1 }}>
            <input type="checkbox" checked={injectVoice} onChange={e => setInjectVoice(e.target.checked)} />
            озвучить голосом
          </label>
          <button className="btn-hover" style={{ padding: '8px 14px', background: 'var(--gold)', color: '#0a0e14', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Отправить</button>
        </div>
      </AdminBlock>

      <AdminBlock title="📜 Mini transcript (last 10)" collapsible defaultOpen>
        <div style={{
          background: '#0c1220', border: '1px solid var(--border-strong)',
          borderRadius: 8, padding: '8px 10px', maxHeight: 160, overflowY: 'auto',
        }} className="mono">
          {miniTranscript.length === 0 ? (
            <div style={{ color: 'var(--text-mute)', fontSize: 11, padding: '12px 0', textAlign: 'center' }}>— нет сообщений —</div>
          ) : miniTranscript.slice(-10).map((m, i) => (
            <div key={i} style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--text-dim)', padding: '2px 0' }}>
              <span style={{ color: m.role === 'alex' ? 'var(--avatar-to)' : 'var(--gold)', fontWeight: 600 }}>{m.role}:</span> {m.text.length > 60 ? m.text.slice(0, 60) + '…' : m.text}
            </div>
          ))}
        </div>
      </AdminBlock>
    </div>
  );
}

/* ── Widget header + input bar ────────────────────────────── */

function WidgetHeader({ onClose, onMinimize, mobile }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(236,72,153,0.03) 100%)',
      display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
    }}>
      {mobile && (
        <button onClick={onMinimize} className="btn-hover" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 20, padding: 0, width: 28 }}>↓</button>
      )}
      <AlexAvatar size={mobile ? 34 : 40} online />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Алекс</div>
        <div style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--success)' }}/>
          онлайн · AI компаньон
        </div>
      </div>
      {!mobile && (
        <button onClick={onClose} className="btn-hover" title="Свернуть" style={{
          width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
          color: 'var(--text-dim)', fontSize: 16,
        }}>×</button>
      )}
      {mobile && (
        <button className="btn-hover" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18, padding: 0, width: 28 }}>⋯</button>
      )}
    </div>
  );
}

function WidgetTabs({ tab, setTab }) {
  return (
    <div style={{
      display: 'flex', padding: '0 16px', gap: 18,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(0,0,0,0.15)',
      flexShrink: 0,
    }}>
      {[{ id: 'chat', label: 'Chat' }, { id: 'admin', label: '⚙ Admin' }].map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          padding: '12px 2px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600,
          color: tab === t.id ? 'var(--gold)' : 'var(--text-mute)',
          borderBottom: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
          marginBottom: -1, transition: 'all 160ms ease',
        }}>{t.label}</button>
      ))}
    </div>
  );
}

function InputBar({ onSend, micActive, onMicDown, onMicUp, interim }) {
  const [val, setVal] = React.useState('');
  return (
    <div style={{
      padding: '10px 12px 12px', borderTop: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(0,0,0,0.25)', flexShrink: 0,
      display: 'flex', gap: 8, alignItems: 'center',
    }}>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        background: '#0c1220', border: '1px solid var(--border-strong)',
        borderRadius: 999, padding: '8px 14px',
      }}>
        <input
          value={micActive ? (interim || '') : val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && val.trim()) { onSend(val); setVal(''); } }}
          placeholder="Напиши Алексу…"
          readOnly={micActive}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: micActive ? 'var(--text-dim)' : 'var(--text)',
            fontSize: 14, outline: 'none',
            fontStyle: micActive ? 'italic' : 'normal',
            fontFamily: 'inherit',
          }}/>
      </div>
      <button
        onMouseDown={onMicDown} onMouseUp={onMicUp} onMouseLeave={onMicUp}
        onTouchStart={onMicDown} onTouchEnd={onMicUp}
        style={{
          width: 40, height: 40, borderRadius: '50%',
          background: micActive ? 'linear-gradient(135deg, #ec4899, #6366f1)' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          border: 'none', cursor: 'pointer', color: '#0a0e14',
          display: 'grid', placeItems: 'center', flexShrink: 0,
          boxShadow: micActive ? '0 0 0 4px rgba(236,72,153,0.25)' : '0 4px 12px rgba(251,191,36,0.3)',
          transition: 'all 180ms ease',
        }}>
        {micActive ? (
          <div style={{ display: 'flex', alignItems: 'center', color: '#0a0e14' }}>
            <div className="mic-bar"/><div className="mic-bar"/><div className="mic-bar"/><div className="mic-bar"/><div className="mic-bar"/>
          </div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="2" width="6" height="8" rx="3" fill="currentColor"/>
            <path d="M3 7a5 5 0 0010 0M8 12v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
        )}
      </button>
    </div>
  );
}

function WidgetBody({ tab, setTab, mobile, onClose, onMinimize, chatProps, adminProps, inputProps }) {
  return (
    <React.Fragment>
      <WidgetHeader mobile={mobile} onClose={onClose} onMinimize={onMinimize} />
      <WidgetTabs tab={tab} setTab={setTab} />
      {tab === 'chat' ? <ChatView {...chatProps} /> : <AdminView {...adminProps} />}
      <InputBar {...inputProps} />
    </React.Fragment>
  );
}

function DesktopWidget(props) {
  const { rgMode } = props;
  return (
    <div className={'sidebar-enter ' + (rgMode === 'rg_care' ? 'rg-glow' : '')} style={{
      width: 400, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface-alt)',
      borderLeft: '1px solid rgba(255,255,255,0.06)',
      height: '100vh', position: 'relative',
    }}>
      <WidgetBody mobile={false} {...props} />
    </div>
  );
}

function MobileWidget(props) {
  const { rgMode } = props;
  return (
    <div className={'slide-up ' + (rgMode === 'rg_care' ? 'rg-glow' : '')} style={{
      position: 'absolute', top: 58, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface-alt)',
      zIndex: 30,
      paddingBottom: 34,
    }}>
      <WidgetBody mobile={true} {...props} />
    </div>
  );
}

Object.assign(window, {
  AlexAvatar, CollapsedWidget, DesktopWidget, MobileWidget, TRIGGERS,
});
