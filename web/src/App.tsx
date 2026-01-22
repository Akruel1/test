import './App.css'
import { useEffect, useMemo, useReducer, useState } from 'react'
import { IntroSlides } from './ui/IntroSlides'
import { LoadingScreen } from './ui/LoadingScreen'
import { MainScreen } from './ui/MainScreen'
import { createDefaultProgress, loadProgress, saveProgress } from './storage/progress'
import { createWorld, worldReducer } from './world/world'
import type { LanguageId } from './runtime/runtime'
import { createRuntime } from './runtime/runtime'

function App() {
  const [phase, setPhase] = useState<'boot' | 'intro' | 'play'>('boot')
  const [progress, setProgress] = useState(() => loadProgress() ?? createDefaultProgress())
  const [language, setLanguage] = useState<LanguageId>(() => progress.lastLanguage ?? 'python')
  const [isRunning, setIsRunning] = useState(false)
  const [world, dispatchWorld] = useReducer(worldReducer, undefined, () => createWorld())

  const runtime = useMemo(() => createRuntime(language), [language])

  useEffect(() => {
    const next = { ...progress, lastLanguage: language }
    setProgress(next)
    saveProgress(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  useEffect(() => {
    if (phase !== 'boot') return
    const t = window.setTimeout(() => {
      if (progress.tutorialCompleted) setPhase('play')
      else setPhase('intro')
    }, 1600)
    return () => window.clearTimeout(t)
  }, [phase, progress.tutorialCompleted])

  const onFinishIntro = () => {
    const next = { ...progress, tutorialCompleted: true }
    setProgress(next)
    saveProgress(next)
    setPhase('play')
  }

  const unlock = (id: 'first_run' | 'first_move' | 'first_error') => {
    setProgress((prev) => {
      if (prev.achievements.includes(id)) return prev
      const next = { ...prev, achievements: [...prev.achievements, id] }
      saveProgress(next)
      return next
    })
  }

  const onRun = async (code: string) => {
    if (isRunning) return
    setIsRunning(true)
    unlock('first_run')
    dispatchWorld({ type: 'LOG', level: 'system', message: 'Синхронизация... запуск протокола выполнения.' })
    try {
      await runtime.run({
        code,
        emit: (e) => dispatchWorld({ type: 'LOG', level: e.level, message: e.message }),
        action: (a) => {
          if (a.type === 'MOVE') unlock('first_move')
          dispatchWorld({ type: 'ACTION', action: a })
        },
      })
      dispatchWorld({ type: 'LOG', level: 'ok', message: 'Цикл завершён. Мир зафиксировал изменения.' })
    } catch (err) {
      unlock('first_error')
      const msg = err instanceof Error ? err.message : String(err)
      dispatchWorld({
        type: 'LOG',
        level: 'danger',
        message: `Глитч в реальности: ${msg}`,
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="app">
      {phase === 'boot' && <LoadingScreen />}
      {phase === 'intro' && <IntroSlides onFinish={onFinishIntro} />}
      {phase === 'play' && (
        <MainScreen
          language={language}
          setLanguage={setLanguage}
          isRunning={isRunning}
          progress={progress}
          setProgress={setProgress}
          world={world}
          dispatchWorld={dispatchWorld}
          onRun={onRun}
        />
      )}
      <div className="crtNoise" />
    </div>
  )
}

export default App
