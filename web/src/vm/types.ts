import type { Command } from '../game/types'
import type { LanguageId } from './languages'

export type VmError = {
  message: string
  line?: number
  col?: number
  detail?: string
}

export type CompileResult =
  | { ok: true; commands: Command[]; warnings: string[] }
  | { ok: false; error: VmError }

export type Compiler = (code: string) => CompileResult

export type ProgramTemplates = Record<LanguageId, string>

