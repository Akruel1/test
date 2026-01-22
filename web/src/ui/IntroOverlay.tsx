import { useEffect, useMemo, useState } from 'react'
import './ui.css'

type Slide = {
  title: string
  body: string
  accent: 'cyan' | 'pink' | 'violet'
}

export function IntroOverlay({ onFinish }: { onFinish: () => void }) {
  const slides = useMemo<Slide[]>(
    () => [
      {
        title: 'Это не сайт. Это мир.',
        body: 'Здесь нет кнопок управления. Только код — и последствия в реальности.',
        accent: 'cyan',
      },
      {
        title: 'Ты — не игрок. Ты — разработчик мира.',
        body: 'Персонаж, объекты и события подчиняются программной логике. Ошибки выглядят как “глитчи”.',
        accent: 'pink',
      },
      {
        title: 'Пиши код → запускай → наблюдай.',
        body: 'Выбирай язык, экспериментируй, выполняй задания, открывай уровни и достижения.',
        accent: 'violet',
      },
    ],
    [],
  )

  const [i, setI] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1 >= slides.length ? v : v + 1)), 3600)
    return () => window.clearInterval(id)
  }, [slides.length])

  const slide = slides[i]

  return (
    <div className="IntroRoot pixelScanlines pixelNoise">
      <div className="IntroCard uiPanel">
        <div className={`IntroKicker IntroKicker_${slide.accent}`}>SYSTEM://BRIEFING</div>
        <div className="IntroTitle">{slide.title}</div>
        <div className="IntroBody">{slide.body}</div>

        <div className="IntroDots">
          {slides.map((_, idx) => (
            <div key={idx} className={idx === i ? 'IntroDot IntroDotActive' : 'IntroDot'} />
          ))}
        </div>

        <div className="IntroActions">
          <button className="uiBtn" onClick={onFinish}>
            Пропустить
          </button>
          {i < slides.length - 1 ? (
            <button className="uiBtn uiBtnPrimary" onClick={() => setI((v) => Math.min(slides.length - 1, v + 1))}>
              Далее
            </button>
          ) : (
            <button className="uiBtn uiBtnPrimary" onClick={onFinish}>
              Войти в мир
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

