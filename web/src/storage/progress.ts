export type AchievementId = 'first_run' | 'first_move' | 'first_error'

export type Progress = {
  tutorialCompleted: boolean
  lastLanguage?: 'python' | 'java' | 'cpp'
  achievements: AchievementId[]
  codeByLanguage: Partial<Record<'python' | 'java' | 'cpp', string>>
}

const KEY = 'codeworld.progress.v1'

export function createDefaultProgress(): Progress {
  return {
    tutorialCompleted: false,
    lastLanguage: 'python',
    achievements: [],
    codeByLanguage: {},
  }
}

export function loadProgress(): Progress | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as Progress
  } catch {
    return null
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

