import { useEffect, useState } from 'react'
import './App.css'
import { BootScreen } from './ui/BootScreen'
import { IntroOverlay } from './ui/IntroOverlay'
import { GameShell } from './ui/GameShell'
import type { LanguageId } from './vm/languages'

type Phase = 'boot' | 'intro' | 'play'

export default function App() {
  const [phase, setPhase] = useState<Phase>('boot')
  const [progress, setProgress] = useState(0)
  const [language, setLanguage] = useState<LanguageId>('python')
  const [initialLanguage] = useState<LanguageId>(language)

  useEffect(() => {
    if (phase !== 'boot') return
    const started = performance.now()
    const durationMs = 1900
    let raf = 0
    const tick = () => {
      const t = Math.min(1, (performance.now() - started) / durationMs)
      setProgress(Math.round(100 * t))
      if (t >= 1) {
        setTimeout(() => setPhase('intro'), 250)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  const onIntroDone = () => setPhase('play')

  return (
    <div className="AppRoot">
      {phase === 'boot' && <BootScreen progress={progress} />}
      {phase === 'intro' && <IntroOverlay onFinish={onIntroDone} />}
      {phase === 'play' && (
        <GameShell
          initialLanguage={initialLanguage}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}
    </div>
  )
}
