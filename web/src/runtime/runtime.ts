import type { LogLevel, WorldAction } from '../world/world'
import { createPythonRuntime } from './python/pythonRuntime'
import { createStubRuntime } from './stub/stubRuntime'

export type LanguageId = 'python' | 'java' | 'cpp'

export type RuntimeEvent = {
  level: LogLevel
  message: string
}

export type RuntimeRunArgs = {
  code: string
  emit: (e: RuntimeEvent) => void
  action: (a: WorldAction) => void
}

export type Runtime = {
  run: (args: RuntimeRunArgs) => Promise<void>
  dispose?: () => void
}

export function createRuntime(lang: LanguageId): Runtime {
  switch (lang) {
    case 'python':
      return createPythonRuntime()
    case 'java':
      return createStubRuntime('java')
    case 'cpp':
      return createStubRuntime('cpp')
    default:
      return createStubRuntime('unknown')
  }
}

