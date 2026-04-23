// Character gallery — 9 archetype cards, 1 active (Alex)

const CHARACTERS = [
  { id: 'alex', name: 'Алекс', role: 'Дружелюбный компаньон', monogram: 'А', grad: 'linear-gradient(135deg, #6366f1, #ec4899)', active: true },
  { id: 'max', name: 'Макс', role: 'Ботаник-аналитик', monogram: 'М', grad: 'linear-gradient(135deg, #0ea5e9, #6366f1)' },
  { id: 'lika', name: 'Лика', role: 'Эмоциональная тусовщица', monogram: 'Л', grad: 'linear-gradient(135deg, #f472b6, #f59e0b)' },
  { id: 'gennady', name: 'Геннадий', role: 'Ветеран-тренер', monogram: 'Г', grad: 'linear-gradient(135deg, #475569, #1e293b)' },
  { id: 'stas', name: 'Стас', role: 'Стример-шутник', monogram: 'С', grad: 'linear-gradient(135deg, #10b981, #06b6d4)' },
  { id: 'vera', name: 'Вера', role: 'Статистик в деловом стиле', monogram: 'В', grad: 'linear-gradient(135deg, #64748b, #334155)' },
  { id: 'artem', name: 'Артём', role: 'Хипстер-крипта', monogram: 'А', grad: 'linear-gradient(135deg, #a855f7, #6366f1)' },
  { id: 'boris', name: 'Борис', role: 'Старая школа', monogram: 'Б', grad: 'linear-gradient(135deg, #92400e, #451a03)' },
  { id: 'dron', name: 'Дрон', role: 'Bro-tier атлет', monogram: 'Д', grad: 'linear-gradient(135deg, #ef4444, #f59e0b)' },
];

function CharCard({ c, mobile }) {
  return (
    <div className="btn-hover" style={{
      background: 'var(--surface)',
      border: c.active ? '1px solid rgba(251,191,36,0.5)' : '1px solid var(--border)',
      borderRadius: 12, padding: 14,
      position: 'relative', overflow: 'hidden',
      cursor: c.active ? 'default' : 'not-allowed',
      opacity: c.active ? 1 : 0.65,
    }} title={c.active ? '' : 'Скоро'}>
      {/* Portrait placeholder */}
      <div style={{
        width: '100%', aspectRatio: '1',
        borderRadius: 10,
        background: c.grad,
        filter: c.active ? 'none' : 'grayscale(0.7) brightness(0.75)',
        display: 'grid', placeItems: 'center',
        position: 'relative', overflow: 'hidden',
        marginBottom: 10,
      }}>
        <div style={{
          color: 'rgba(255,255,255,0.96)',
          fontSize: mobile ? 48 : 68,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>{c.monogram}</div>
        {/* Subtle stripe texture */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 8px, transparent 8px 16px)',
        }}/>
        {!c.active && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(10,14,20,0.55)',
            display: 'grid', placeItems: 'center',
          }}>
            <div style={{
              background: 'rgba(10,14,20,0.9)',
              padding: '6px 12px', borderRadius: 999,
              fontSize: 11, fontWeight: 700,
              color: 'var(--text-dim)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              border: '1px solid var(--border-strong)',
            }}>Coming soon</div>
          </div>
        )}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{c.name}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 2, lineHeight: 1.3, minHeight: 28 }}>{c.role}</div>
      {c.active && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(16,185,129,0.14)',
          border: '1px solid rgba(16,185,129,0.5)',
          color: 'var(--success)',
          padding: '3px 8px', borderRadius: 999,
          fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--success)' }}/>
          Активен
        </div>
      )}
    </div>
  );
}

function Gallery({ onClose, mobile }) {
  const cols = mobile ? 2 : 3;
  return (
    <div className="fade-in" style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(5,7,12,0.78)',
      backdropFilter: 'blur(8px)',
      display: 'grid', placeItems: mobile ? 'stretch' : 'center',
      padding: mobile ? 0 : 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface-alt)',
        border: mobile ? 'none' : '1px solid var(--border-strong)',
        borderRadius: mobile ? 0 : 16,
        width: mobile ? '100%' : 820,
        maxWidth: '100%',
        height: mobile ? '100%' : 'auto',
        maxHeight: mobile ? '100%' : '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          padding: mobile ? '18px 16px 14px' : '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(180deg, rgba(99,102,241,0.05) 0%, transparent 100%)',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Команда</div>
            <h2 style={{ margin: '4px 0 0', fontSize: mobile ? 18 : 22, fontWeight: 700, letterSpacing: '-0.01em' }}>Твоя команда компаньонов</h2>
          </div>
          <div style={{ flex: 1 }}/>
          <button onClick={onClose} className="btn-hover" style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18,
          }}>×</button>
        </div>
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: mobile ? 14 : 24,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: mobile ? 10 : 14,
        }}>
          {CHARACTERS.map(c => <CharCard key={c.id} c={c} mobile={mobile} />)}
        </div>
        <div style={{
          padding: mobile ? '12px 16px' : '14px 24px',
          borderTop: '1px solid var(--border)',
          fontSize: 11.5, color: 'var(--text-mute)', textAlign: 'center',
        }}>
          8 персонажей в разработке · портреты генерируются через Nano Banana 2
        </div>
      </div>
    </div>
  );
}

window.Gallery = Gallery;
