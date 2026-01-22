import type { Runtime, RuntimeRunArgs } from '../runtime'

export function createStubRuntime(kind: string): Runtime {
  return {
    async run(args: RuntimeRunArgs) {
      args.emit({
        level: 'danger',
        message:
          `Модуль ${kind.toUpperCase()} ещё строится. ` +
          'Сейчас доступен безопасный Python-движок (Pyodide). ' +
          'Переключись на Python, чтобы оживить мир.',
      })
      throw new Error(`${kind} runtime is not implemented`)
    },
  }
}

