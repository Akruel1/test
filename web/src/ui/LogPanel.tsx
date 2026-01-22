import type { LogEntry } from '../world/world'

export function LogPanel(props: { logs: LogEntry[]; onClear: () => void }) {
  const { logs } = props
  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 14,
        background: 'var(--panel)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span className="px" style={{ fontSize: 12 }}>
          ЛОГИ
        </span>
        <span className="chip">{logs.length}</span>
        <span style={{ flex: 1 }} />
        <button className="btn" onClick={props.onClear}>
          Очистить
        </button>
      </div>
      <div style={{ padding: 12, overflow: 'auto', fontSize: 13, lineHeight: 1.55 }}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--muted)' }}>Пусто. Запусти код, чтобы мир начал говорить.</div>
        ) : (
          logs.slice(-200).map((l) => (
            <div key={l.id} style={{ marginBottom: 8, color: colorFor(l.level) }}>
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>{formatTime(l.ts)} </span>
              {l.message}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function colorFor(level: LogEntry['level']): string {
  switch (level) {
    case 'ok':
      return 'var(--ok)'
    case 'danger':
      return 'var(--danger)'
    case 'system':
      return 'rgba(255,255,255,0.92)'
    case 'info':
    default:
      return 'rgba(255,255,255,0.82)'
  }
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

