import { useEffect, useMemo, useState } from 'react'

type Slide = {
  title: string
  body: string
  footer?: string
}

export function IntroSlides(props: { onFinish: () => void }) {
  const slides = useMemo<Slide[]>(
    () => [
      {
        title: 'Это не сайт. Это мир.',
        body: 'Ты внутри пиксельной симуляции. Кнопок управления нет — мир слушает только программы.',
        footer: 'Нажми “Далее”, чтобы продолжить.',
      },
      {
        title: 'Код = управление',
        body: 'Движение, действия, события и логика задаются кодом. Ошибка — это не красный текст, а “глитч” в реальности.',
      },
      {
        title: 'Обучение через игру',
        body: 'Задания встроены в мир. Решая их, ты открываешь новые зоны и инструменты.',
      },
      {
        title: 'Переключай языки',
        body: 'Сейчас доступен безопасный Python-движок (Pyodide). Java/C++ подключим следующими модулями.',
        footer: 'Готов? Переходим в мир.',
      },
    ],
    [],
  )

  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        next()
      }
      if (e.key === 'Escape') props.onFinish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const next = () => {
    if (idx >= slides.length - 1) props.onFinish()
    else setIdx((x) => x + 1)
  }

  const s = slides[idx]

  return (
    <div className="fullscreen">
      <div className="panel">
        <div className="panelHeader">
          <span className="px title">ВСТУПЛЕНИЕ</span>
          <span className="chip">
            {idx + 1}/{slides.length}
          </span>
          <span style={{ flex: 1 }} />
          <button className="btn" onClick={props.onFinish}>
            Пропустить <span className="kbd">Esc</span>
          </button>
        </div>
        <div style={{ padding: 18 }}>
          <div className="px" style={{ fontSize: 16, marginBottom: 14 }}>
            {s.title}
          </div>
          <div style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.6 }}>{s.body}</div>
          {s.footer && (
            <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13 }}>{s.footer}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>
              Подсказка: жми <span className="kbd">Enter</span> или <span className="kbd">Space</span>
            </div>
            <button className="btn px" onClick={next}>
              Далее
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

