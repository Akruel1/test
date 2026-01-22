import { useEffect, useState } from 'react'
import type { Dispatch } from 'react'
import type { LanguageId } from '../runtime/runtime'
import type { Progress } from '../storage/progress'
import { saveProgress } from '../storage/progress'
import type { World, WorldReducerAction } from '../world/world'
import { defaultTemplate } from './codeTemplates'
import { EditorPanel } from './EditorPanel'
import { GameView } from './GameView'
import { LogPanel } from './LogPanel'

export function MainScreen(props: {
  language: LanguageId
  setLanguage: (l: LanguageId) => void
  isRunning: boolean
  progress: Progress
  setProgress: (p: Progress) => void
  world: World
  dispatchWorld: Dispatch<WorldReducerAction>
  onRun: (code: string) => Promise<void>
}) {
  const [code, setCode] = useState(() => props.progress.codeByLanguage[props.language] ?? defaultTemplate(props.language))

  useEffect(() => {
    setCode(props.progress.codeByLanguage[props.language] ?? defaultTemplate(props.language))
  }, [props.language, props.progress.codeByLanguage])

  useEffect(() => {
    const t = window.setTimeout(() => {
      props.setProgress((prev) => {
        const next: Progress = { ...prev, codeByLanguage: { ...prev.codeByLanguage, [props.language]: code } }
        saveProgress(next)
        return next
      })
    }, 250)
    return () => window.clearTimeout(t)
  }, [code, props.language, props.setProgress])

  const run = async () => {
    await props.onRun(code)
  }

  return (
    <div className="main">
      <div className="topbar">
        <div className="topbarTitle">
          <div className="px" style={{ fontSize: 14 }}>
            CODEWORLD
          </div>
          <div className="topbarSubtitle">игровая среда, управляемая программированием</div>
        </div>

        <span style={{ flex: 1 }} />

        <span className="chip">достижения: {props.progress.achievements.length}</span>

        <select
          className="select"
          value={props.language}
          onChange={(e) => props.setLanguage(e.target.value as LanguageId)}
          disabled={props.isRunning}
        >
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>

        <button className="btn px" onClick={run} disabled={props.isRunning}>
          {props.isRunning ? 'ВЫПОЛНЯЮ…' : 'RUN'}
        </button>

        <button className="btn" onClick={() => props.dispatchWorld({ type: 'RESET' })} disabled={props.isRunning}>
          Сброс мира
        </button>
      </div>

      <div className="mainGrid">
        <div className="stack">
          <div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <span className="chip">мир: {props.world.width}×{props.world.height}</span>
              <span className="chip">
                игрок: ({props.world.player.x}, {props.world.player.y})
              </span>
              <span className="chip">tick: {props.world.tick}</span>
              <span style={{ flex: 1 }} />
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                подсказка: иди к неону и попробуй менять тайлы
              </span>
            </div>
            <GameView world={props.world} />
          </div>
          <LogPanel logs={props.world.logs} onClear={() => props.dispatchWorld({ type: 'CLEAR_LOGS' })} />
        </div>

        <EditorPanel language={props.language} code={code} setCode={setCode} isRunning={props.isRunning} />
      </div>
    </div>
  )
}

