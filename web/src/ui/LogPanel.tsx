import type { LogEntry } from '../game/types'
import './ui.css'

function fmtTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function LogPanel({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="LogRoot">
      {logs.length === 0 ? (
        <div className="LogEmpty">Пока тихо. Запусти код — и мир ответит.</div>
      ) : (
        <div className="LogList">
          {logs.slice(-120).reverse().map((l) => (
            <div key={l.id} className={`LogItem LogItem_${l.kind}`}>
              <div className="LogHeader">
                <span className="LogTime">{fmtTime(l.at)}</span>
                <span className="LogTitle">{l.title}</span>
              </div>
              {l.detail ? <div className="LogDetail">{l.detail}</div> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

