import type { Runtime, RuntimeRunArgs } from '../runtime'
import type { LogLevel, WorldAction } from '../../world/world'

type WorkerToMain =
  | { type: 'ready' }
  | { type: 'log'; level: LogLevel; message: string }
  | { type: 'action'; action: WorldAction }
  | { type: 'result'; ok: true; stdout?: string; stderr?: string }
  | { type: 'result'; ok: false; error: { name: string; message: string; traceback?: string } }

type MainToWorker = { type: 'run'; code: string }

let _worker: Worker | null = null
let _ready: Promise<void> | null = null

function ensureWorker(): { worker: Worker; ready: Promise<void> } {
  if (_worker && _ready) return { worker: _worker, ready: _ready }

  const worker = new Worker(new URL('./pythonWorker.worker.ts', import.meta.url), { type: 'module' })
  _worker = worker

  _ready = new Promise<void>((resolve) => {
    const onMessage = (ev: MessageEvent<WorkerToMain>) => {
      if (ev.data?.type === 'ready') {
        worker.removeEventListener('message', onMessage)
        resolve()
      }
    }
    worker.addEventListener('message', onMessage)
  })

  return { worker, ready: _ready }
}

export function createPythonRuntime(): Runtime {
  return {
    async run(args: RuntimeRunArgs) {
      const { worker, ready } = ensureWorker()
      args.emit({ level: 'system', message: 'Pyodide-ядро загружается в песочнице...' })
      await ready
      args.emit({ level: 'ok', message: 'Песочница активна. Выполняю код.' })

      await new Promise<void>((resolve, reject) => {
        const onMessage = (ev: MessageEvent<WorkerToMain>) => {
          const msg = ev.data
          if (!msg) return
          if (msg.type === 'log') args.emit({ level: msg.level, message: msg.message })
          if (msg.type === 'action') args.action(msg.action)
          if (msg.type === 'result') {
            worker.removeEventListener('message', onMessage)
            if (msg.ok) {
              const out = (msg.stdout ?? '').trim()
              const err = (msg.stderr ?? '').trim()
              if (out) args.emit({ level: 'info', message: `stdout: ${out}` })
              if (err) args.emit({ level: 'danger', message: `stderr: ${err}` })
              resolve()
            } else {
              const tb = msg.error.traceback ? `\n${msg.error.traceback}` : ''
              reject(new Error(`${msg.error.name}: ${msg.error.message}${tb}`))
            }
          }
        }

        worker.addEventListener('message', onMessage)
        worker.postMessage({ type: 'run', code: args.code } satisfies MainToWorker)
      })
    },
    dispose() {
      _worker?.terminate()
      _worker = null
      _ready = null
    },
  }
}

