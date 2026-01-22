import Editor from '@monaco-editor/react'
import { useEffect, useMemo, useState } from 'react'
import type { LanguageId } from '../runtime/runtime'
import { monacoLanguage } from './codeTemplates'

export function EditorPanel(props: {
  language: LanguageId
  code: string
  setCode: (s: string) => void
  isRunning: boolean
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const options = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 13,
      lineHeight: 20,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      scrollBeyondLastLine: false,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on' as const,
      renderLineHighlight: 'all' as const,
      padding: { top: 10, bottom: 10 },
      overviewRulerBorder: false,
      scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      readOnly: props.isRunning,
    }),
    [props.isRunning],
  )

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
          РЕДАКТОР
        </span>
        <span className="chip">{props.language}</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>
          Запуск — единственный способ взаимодействия
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {/* Monaco иногда плохо ведёт себя при SSR/строгих гидрациях; в Vite всё ок, но монтируем явно */}
        {mounted && (
          <Editor
            language={monacoLanguage(props.language)}
            value={props.code}
            onChange={(v) => props.setCode(v ?? '')}
            theme="vs-dark"
            options={options}
          />
        )}
      </div>
    </div>
  )
}

