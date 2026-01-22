import type { LanguageId } from '../vm/languages'

export type PersistedState = {
  levelIndex: number
  codeByLang: Partial<Record<LanguageId, string>>
  achievements: string[]
}

const KEY = 'neon-byte-world:v1'

export function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (typeof parsed !== 'object' || parsed == null) return null
    return parsed
  } catch {
    return null
  }
}

export function savePersisted(s: PersistedState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // ignore
  }
}

