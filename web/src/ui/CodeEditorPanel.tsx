import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import type { LanguageId } from '../vm/languages'
import './ui.css'

function extFor(lang: LanguageId) {
  if (lang === 'python') return [python()]
  if (lang === 'java') return [java()]
  return [cpp()]
}

export function CodeEditorPanel({
  language,
  value,
  onChange,
  disabled,
}: {
  language: LanguageId
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className={disabled ? 'EditorRoot EditorRootDisabled' : 'EditorRoot'}>
      <CodeMirror
        value={value}
        height="100%"
        theme={oneDark}
        extensions={extFor(language)}
        onChange={(v) => onChange(v)}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
          highlightActiveLineGutter: false,
        }}
      />
    </div>
  )
}

