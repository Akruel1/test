import { useEffect, useMemo, useState } from 'react'

export function LoadingScreen() {
  const lines = useMemo(
    () => [
      'Инициализация неоновой сетки...',
      'Загрузка игровых протоколов...',
      'Сборка пиксельной реальности...',
      'Синхронизация песочницы кода...',
    ],
    [],
  )
  const [p, setP] = useState(0)
  const [i, setI] = useState(0)

  useEffect(() => {
    const started = performance.now()
    let raf = 0
    const loop = (t: number) => {
      const dt = (t - started) / 1200
      const next = Math.max(0, Math.min(1, dt))
      setP(next)
      setI(Math.min(lines.length - 1, Math.floor(next * lines.length)))
      if (next < 1) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [lines.length])

  return (
    <div className="fullscreen">
      <div className="panel">
        <div className="panelHeader">
          <span className="px title">CODEWORLD</span>
          <span className="chip">boot</span>
          <span style={{ flex: 1 }} />
          <span className="subtle">запуск игры</span>
        </div>
        <div style={{ padding: 18 }}>
          <div className="px" style={{ fontSize: 14, marginBottom: 14 }}>
            {lines[i]}
          </div>
          <div
            style={{
              height: 14,
              borderRadius: 999,
              border: '1px solid var(--line)',
              background: 'rgba(0,0,0,0.35)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.round(p * 100)}%`,
                background:
                  'linear-gradient(90deg, rgba(109,255,234,0.95), rgba(196,109,255,0.9), rgba(109,255,234,0.95))',
                boxShadow: '0 0 22px rgba(109,255,234,0.25)',
                transition: 'width 80ms linear',
              }}
            />
          </div>
          <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13 }}>
            Управление отключено. Здесь действует только код.
          </div>
        </div>
      </div>
    </div>
  )
}

