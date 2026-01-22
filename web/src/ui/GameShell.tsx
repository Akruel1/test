import { useEffect, useMemo, useState } from 'react'
import './ui.css'
import type { LanguageId } from '../vm/languages'
import { LANGUAGES } from '../vm/languages'
import { LEVELS } from '../game/levels'
import { cloneWorld } from '../game/world'
import { applyCommand, glitchLog, rewardLog, systemLog } from '../game/engine'
import type { Command, LogEntry } from '../game/types'
import { GameCanvas } from './GameCanvas'
import { CodeEditorPanel } from './CodeEditorPanel'
import { LogPanel } from './LogPanel'
import { compile } from '../vm/compile'
import { loadPersisted, savePersisted } from '../game/persist'

export function GameShell({
  initialLanguage,
  language,
  onLanguageChange,
}: {
  initialLanguage: LanguageId
  language: LanguageId
  onLanguageChange: (l: LanguageId) => void
}) {
  const persisted = useMemo(() => loadPersisted(), [])
  const [levelIndex] = useState(() => persisted?.levelIndex ?? 0)
  const level = LEVELS[Math.min(Math.max(0, levelIndex), LEVELS.length - 1)]
  return (
    <GameSession
      key={level.id}
      initialLanguage={initialLanguage}
      language={language}
      onLanguageChange={onLanguageChange}
      persisted={persisted}
      levelIndex={levelIndex}
    />
  )
}

function GameSession({
  initialLanguage,
  language,
  onLanguageChange,
  persisted,
  levelIndex,
}: {
  initialLanguage: LanguageId
  language: LanguageId
  onLanguageChange: (l: LanguageId) => void
  persisted: ReturnType<typeof loadPersisted>
  levelIndex: number
}) {
  const level = LEVELS[Math.min(Math.max(0, levelIndex), LEVELS.length - 1)]

  const [world, setWorld] = useState(() => cloneWorld(level.initialWorld))
  const [queue, setQueue] = useState<Command[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [levelDone, setLevelDone] = useState(false)

  const [achievements, setAchievements] = useState<Set<string>>(() => new Set(persisted?.achievements ?? []))
  const [codeByLang, setCodeByLang] = useState<Record<LanguageId, string>>(() => {
    const base = {
      python: level.starterCode.python ?? '',
      java: level.starterCode.java ?? '',
      cpp: level.starterCode.cpp ?? '',
    }
    return {
      ...base,
      ...(persisted?.codeByLang ?? {}),
    }
  })

  const [logs, setLogs] = useState<LogEntry[]>(() => [
    systemLog(`Уровень: ${level.title}`),
    systemLog(level.intro),
    systemLog('Подсказка: управление отключено. Используй только код → “Запуск”.'),
  ])

  const hint = useMemo(() => LANGUAGES.find((l) => l.id === language)?.hint ?? '', [language])
  const code = codeByLang[language] ?? ''

  const objectiveStates = useMemo(
    () => level.objectives.map((o) => ({ ...o, done: o.isComplete(world) })),
    [level.objectives, world],
  )
  const allObjectivesDone = objectiveStates.every((o) => o.done)

  useEffect(() => {
    savePersisted({
      levelIndex,
      codeByLang,
      achievements: Array.from(achievements),
    })
  }, [achievements, codeByLang, levelIndex])

  useEffect(() => {
    if (!isRunning || queue.length === 0) return
    const t = window.setTimeout(() => {
      const cmd = queue[0]
      const rest = queue.slice(1)
      setQueue(rest)
      setWorld((prev) => {
        const res = applyCommand(prev, cmd)
        const nextWorld = res.world
        setLogs((l) => [...l, ...res.logs])
        if (res.didMove) setAchievements((a) => new Set(a).add('first_move'))
        if (res.didSay) setAchievements((a) => new Set(a).add('first_signal'))
        const doneNow = !levelDone && level.objectives.every((o) => o.isComplete(nextWorld))
        if (doneNow) {
          setLevelDone(true)
          setAchievements((a) => new Set(a).add(`level_${level.id}_done`))
          setLogs((l) => [
            ...l,
            rewardLog(
              'Уровень завершён',
              'Маяк принял сигнал. Доступ к следующим зонам будет расширяться по мере разработки.',
            ),
          ])
          setIsRunning(false)
          setQueue([])
        } else if (rest.length === 0) {
          setIsRunning(false)
          setLogs((l) => [...l, systemLog('Программа завершена')])
        }
        return nextWorld
      })
    }, 170)
    return () => window.clearTimeout(t)
  }, [isRunning, level.id, level.objectives, levelDone, queue])

  const run = () => {
    setAchievements((a) => new Set(a).add('first_run'))
    const res = compile(language, code)
    if (!res.ok) {
      setAchievements((a) => new Set(a).add('first_error'))
      const where = res.error.line ? `строка ${res.error.line}` : 'ввод'
      setLogs((l) => [
        ...l,
        glitchLog(`Глитч компиляции (${where})`, [res.error.message, res.error.detail].filter(Boolean).join('\n')),
      ])
      return
    }
    setLogs((l) => [...l, systemLog('Программа загружена', `действий: ${res.commands.length}`)])
    setQueue(res.commands)
    setIsRunning(true)
  }

  const stop = () => {
    setIsRunning(false)
    setQueue([])
    setLogs((l) => [...l, systemLog('Исполнение остановлено')])
  }

  const resetWorld = () => {
    setIsRunning(false)
    setQueue([])
    setLevelDone(false)
    setWorld(cloneWorld(level.initialWorld))
    setLogs((l) => [...l, systemLog('Сброс мира', 'Координаты и события восстановлены.')])
  }

  return (
    <div className="ShellRoot">
      <header className="ShellTop uiPanel">
        <div className="ShellBrand">
          <div className="ShellBrandTitle">NEON BYTE WORLD</div>
          <div className="ShellBrandSub">код — это единственный контроллер</div>
        </div>

        <div className="ShellControls">
          <select
            className="uiSelect"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageId)}
            aria-label="Выбор языка"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <button className="uiBtn" onClick={resetWorld} disabled={isRunning}>
            Сброс
          </button>
          {isRunning ? (
            <button className="uiBtn" onClick={stop}>
              Стоп
            </button>
          ) : (
            <button className="uiBtn uiBtnPrimary" onClick={run}>
              Запуск
            </button>
          )}
        </div>
      </header>

      <div className="ShellGrid">
        <section className="ShellGame uiPanel pixelScanlines">
          <div className="ShellPanelTitle">Мир</div>
          <div className="ShellGameMeta">
            <span className="uiBadge">
              LVL: <b style={{ color: 'rgba(240,245,255,0.92)' }}>{level.title}</b>
            </span>
            <span className="uiBadge">
              ACH: <b style={{ color: 'rgba(0,255,224,0.9)' }}>{achievements.size}</b>
            </span>
            {allObjectivesDone ? <span className="uiBadge">STATUS: ✅</span> : <span className="uiBadge">STATUS: …</span>}
          </div>
          <div className="ShellObjectives">
            {objectiveStates.map((o) => (
              <div key={o.id} className={o.done ? 'Obj ObjDone' : 'Obj'}>
                <span className="ObjMark">{o.done ? '✓' : '•'}</span>
                <span className="ObjText">{o.text}</span>
              </div>
            ))}
          </div>
          <GameCanvas world={world} />
        </section>

        <section className="ShellEditor uiPanel">
          <div className="ShellPanelTitle">Код</div>
          <div className="ShellHint">{hint}</div>
          <CodeEditorPanel
            language={language}
            value={code}
            onChange={(v) => setCodeByLang((s) => ({ ...s, [language]: v }))}
            disabled={isRunning}
          />
          <div className="ShellEditorFooter">
            <span className="uiBadge">
              RUN: <b style={{ color: isRunning ? 'rgba(255,210,74,0.95)' : 'rgba(45,255,143,0.9)' }}>
                {isRunning ? 'EXECUTING' : 'IDLE'}
              </b>
            </span>
            <span className="uiBadge">
              Q: <b style={{ color: 'rgba(240,245,255,0.9)' }}>{queue.length}</b>
            </span>
            <span className="uiBadge">
              INIT_LANG: <b style={{ color: 'rgba(240,245,255,0.9)' }}>{initialLanguage}</b>
            </span>
          </div>
        </section>

        <section className="ShellLog uiPanel">
          <div className="ShellPanelTitle">События</div>
          <LogPanel logs={logs} />
        </section>
      </div>
    </div>
  )
}

