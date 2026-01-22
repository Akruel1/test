export type LanguageId = 'python' | 'java' | 'cpp'

export type LanguageMeta = {
  id: LanguageId
  label: string
  hint: string
}

export const LANGUAGES: readonly LanguageMeta[] = [
  { id: 'python', label: 'Python', hint: 'Синтаксис: move(1, 0), for i in range(n):' },
  { id: 'java', label: 'Java', hint: 'Синтаксис: move(1, 0); for (int i=0; i<n; i++) { ... }' },
  { id: 'cpp', label: 'C++', hint: 'Синтаксис: move(1, 0); for (int i=0; i<n; i++) { ... }' },
] as const

