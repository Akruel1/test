import type { Command } from '../game/types'
import type { LanguageId } from './languages'
import type { CompileResult } from './types'

const MAX_COMMANDS = 240

function tooMany(): CompileResult {
  return {
    ok: false,
    error: {
      message: 'Слишком много действий за один запуск',
      detail: `Лимит: ${MAX_COMMANDS}. Упрости программу или сократи циклы.`,
    },
  }
}

function parseIntStrict(s: string) {
  if (!/^[+-]?\d+$/.test(s.trim())) return null
  const n = Number(s)
  if (!Number.isFinite(n)) return null
  return Math.trunc(n)
}

function parseStringLiteral(s: string) {
  const t = s.trim()
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1)
  }
  return null
}

function stripLineComment(line: string, comment: string) {
  const idx = line.indexOf(comment)
  return idx >= 0 ? line.slice(0, idx) : line
}

function compilePython(code: string): CompileResult {
  const lines = code.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n')

  function compileBlock(start: number, indent: number): { commands: Command[]; next: number } | { error: CompileResult } {
    const out: Command[] = []
    let i = start
    while (i < lines.length) {
      const raw = lines[i]
      const noComment = stripLineComment(raw, '#')
      if (noComment.trim() === '') {
        i++
        continue
      }
      const leadingSpaces = noComment.match(/^\s*/)?.[0]?.length ?? 0
      if (leadingSpaces < indent) break
      if (leadingSpaces > indent) {
        return {
          error: {
            ok: false,
            error: {
              message: 'Неожиданный отступ',
              line: i + 1,
              col: leadingSpaces + 1,
              detail: 'Проверь отступы. В Python блоки должны быть выровнены.',
            },
          },
        }
      }

      const line = noComment.trim()

      // for i in range(N):
      const mFor = line.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\((.+)\)\s*:\s*$/)
      if (mFor) {
        const n = parseIntStrict(mFor[2])
        if (n == null || n < 0 || n > 200) {
          return {
            error: {
              ok: false,
              error: {
                message: 'Некорректный range(...)',
                line: i + 1,
                detail: 'В этом прототипе range принимает целое число 0..200.',
              },
            },
          }
        }

        // find child indent (next non-empty line)
        let j = i + 1
        while (j < lines.length) {
          const l = stripLineComment(lines[j], '#')
          if (l.trim() === '') {
            j++
            continue
          }
          break
        }
        if (j >= lines.length) {
          return {
            error: {
              ok: false,
              error: { message: 'Пустой блок цикла', line: i + 1, detail: 'После ":" должен быть блок с кодом.' },
            },
          }
        }
        const childIndent = (stripLineComment(lines[j], '#').match(/^\s*/)?.[0]?.length ?? 0)
        if (childIndent <= indent) {
          return {
            error: {
              ok: false,
              error: {
                message: 'Ожидается блок после ":"',
                line: j + 1,
                col: childIndent + 1,
                detail: 'Добавь отступы внутри цикла.',
              },
            },
          }
        }

        const bodyRes = compileBlock(i + 1, childIndent)
        if ('error' in bodyRes) return { error: bodyRes.error }
        const body = bodyRes.commands
        for (let k = 0; k < n; k++) {
          out.push(...body)
          if (out.length > MAX_COMMANDS) return { error: tooMany() }
        }
        i = bodyRes.next
        continue
      }

      // call: move(a,b) | say("x") | wait(n)
      const mCall = line.match(/^(move|say|wait)\s*\((.*)\)\s*$/)
      if (!mCall) {
        return {
          error: {
            ok: false,
            error: {
              message: 'Неизвестная инструкция',
              line: i + 1,
              detail: `Разрешено: move(dx,dy), say("text"), wait(steps), for .. in range(n):`,
            },
          },
        }
      }

      const fn = mCall[1]
      const args = mCall[2]
      if (fn === 'move') {
        const parts = args.split(',').map((p) => p.trim())
        if (parts.length !== 2) {
          return { error: { ok: false, error: { message: 'move ожидает 2 аргумента', line: i + 1 } } }
        }
        const dx = parseIntStrict(parts[0])
        const dy = parseIntStrict(parts[1])
        if (dx == null || dy == null) {
          return { error: { ok: false, error: { message: 'move ожидает целые числа', line: i + 1 } } }
        }
        out.push({ kind: 'move', dx, dy })
      } else if (fn === 'wait') {
        const n = parseIntStrict(args)
        if (n == null) return { error: { ok: false, error: { message: 'wait ожидает целое число', line: i + 1 } } }
        out.push({ kind: 'wait', steps: n })
      } else if (fn === 'say') {
        const s = parseStringLiteral(args)
        if (s == null) {
          return { error: { ok: false, error: { message: 'say ожидает строку в кавычках', line: i + 1 } } }
        }
        out.push({ kind: 'say', text: s })
      }

      if (out.length > MAX_COMMANDS) return { error: tooMany() }
      i++
    }
    return { commands: out, next: i }
  }

  const res = compileBlock(0, 0)
  if ('error' in res) return res.error
  return { ok: true, commands: res.commands, warnings: [] }
}

function compileCurly(code: string, lang: 'java' | 'cpp'): CompileResult {
  // A safe, limited “subset compiler”: we only recognize move/say/wait and for(int i=0; i<n; i++){...}
  const src = code.replaceAll('\r\n', '\n').replaceAll('\r', '\n')

  // remove /* */ blocks (very naive but safe for this prototype)
  const noBlockComments = src.replace(/\/\*[\s\S]*?\*\//g, '')
  const lines = noBlockComments.split('\n').map((l) => stripLineComment(l, '//'))

  // We parse braces by walking line-by-line and building a stack of blocks.
  type Frame = { kind: 'root' } | { kind: 'block' } | { kind: 'for'; n: number; body: Command[] }
  const stack: Frame[] = [{ kind: 'root' }]
  const rootCommands: Command[] = []
  const pushCmd = (c: Command) => {
    const top = stack[stack.length - 1]
    if (top.kind === 'for') top.body.push(c)
    else rootCommands.push(c)
    if ((top.kind === 'for' ? top.body.length : rootCommands.length) > MAX_COMMANDS) {
      throw new Error('MAX')
    }
  }

  try {
    for (let idx = 0; idx < lines.length; idx++) {
      const raw = lines[idx]
      const line = raw.trim()
      if (line === '') continue

      // for (int i = 0; i < N; i++) {
      const forMatch = line.match(
        /^for\s*\(\s*int\s+[A-Za-z_]\w*\s*=\s*0\s*;\s*[A-Za-z_]\w*\s*<\s*([0-9]+)\s*;\s*[A-Za-z_]\w*\s*\+\+\s*\)\s*\{\s*$/,
      )
      if (forMatch) {
        const n = parseIntStrict(forMatch[1]) ?? -1
        if (n < 0 || n > 200) {
          return {
            ok: false,
            error: {
              message: 'Некорректный лимит цикла',
              line: idx + 1,
              detail: 'В этом прототипе поддерживается for(...) с числом 0..200.',
            },
          }
        }
        stack.push({ kind: 'for', n, body: [] })
        continue
      }

      if (line === '}' || line === '};') {
        const frame = stack.pop()
        if (!frame || frame.kind === 'root') {
          return { ok: false, error: { message: 'Лишняя закрывающая скобка', line: idx + 1 } }
        }
        if (frame.kind === 'block') continue
        // expand loop
        for (let k = 0; k < frame.n; k++) {
          for (const c of frame.body) pushCmd(c)
        }
        continue
      }

      // ignore other braces (class/method wrappers) but keep balance safe
      if (line === '{') {
        stack.push({ kind: 'block' })
        continue
      }

      const callMatch = line.match(/^(move|say|wait)\s*\((.*)\)\s*;\s*$/)
      if (!callMatch) {
        // ignore harmless wrappers like "public static void main(String[] args) {"
        if (line.endsWith('{')) {
          stack.push({ kind: 'block' })
          continue
        }
        return {
          ok: false,
          error: {
            message: `Неизвестная инструкция (${lang})`,
            line: idx + 1,
            detail: 'Разрешено: move(dx,dy); say("text"); wait(steps); for(...) { ... }',
          },
        }
      }

      const fn = callMatch[1]
      const args = callMatch[2]
      if (fn === 'move') {
        const parts = args.split(',').map((p) => p.trim())
        if (parts.length !== 2) return { ok: false, error: { message: 'move ожидает 2 аргумента', line: idx + 1 } }
        const dx = parseIntStrict(parts[0])
        const dy = parseIntStrict(parts[1])
        if (dx == null || dy == null) return { ok: false, error: { message: 'move ожидает целые числа', line: idx + 1 } }
        pushCmd({ kind: 'move', dx, dy })
      } else if (fn === 'wait') {
        const n = parseIntStrict(args)
        if (n == null) return { ok: false, error: { message: 'wait ожидает целое число', line: idx + 1 } }
        pushCmd({ kind: 'wait', steps: n })
      } else if (fn === 'say') {
        const s = parseStringLiteral(args)
        if (s == null) return { ok: false, error: { message: 'say ожидает строку в кавычках', line: idx + 1 } }
        pushCmd({ kind: 'say', text: s })
      }
    }
  } catch (e) {
    if (String(e) === 'Error: MAX') return tooMany()
    return { ok: false, error: { message: 'Ошибка разбора', detail: String(e) } }
  }

  if (stack.length !== 1) {
    return { ok: false, error: { message: 'Незакрытый блок { ... }', detail: 'Проверь фигурные скобки.' } }
  }

  if (rootCommands.length > MAX_COMMANDS) return tooMany()
  return { ok: true, commands: rootCommands, warnings: [] }
}

export function compile(language: LanguageId, code: string): CompileResult {
  if (language === 'python') return compilePython(code)
  if (language === 'java') return compileCurly(code, 'java')
  return compileCurly(code, 'cpp')
}

