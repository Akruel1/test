/// <reference lib="webworker" />

import { loadPyodide, type PyodideInterface } from 'pyodide'
import type { LogLevel, WorldAction } from '../../world/world'

type MainToWorker = { type: 'run'; code: string }
type WorkerToMain =
  | { type: 'ready' }
  | { type: 'log'; level: LogLevel; message: string }
  | { type: 'action'; action: WorldAction }
  | { type: 'result'; ok: true; stdout?: string; stderr?: string }
  | { type: 'result'; ok: false; error: { name: string; message: string; traceback?: string } }

let pyodide: PyodideInterface | null = null
let readySent = false

function post(msg: WorkerToMain) {
  ;(self as DedicatedWorkerGlobalScope).postMessage(msg)
}

function postLog(level: LogLevel, message: string) {
  post({ type: 'log', level, message } satisfies WorkerToMain)
}

function postAction(action: WorldAction) {
  post({ type: 'action', action } satisfies WorkerToMain)
}

async function ensurePyodide(): Promise<PyodideInterface> {
  if (pyodide) return pyodide
  postLog('system', 'Загрузка Pyodide (Python в браузере)...')
  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.2/full/',
  })

  ;(self as DedicatedWorkerGlobalScope & { send_action?: (s: string) => void; send_log?: (s: string) => void }).send_action =
    (s: string) => {
      try {
        const obj = JSON.parse(s) as WorldAction
        postAction(obj)
      } catch {
        postLog('danger', 'Движок получил повреждённое действие.')
      }
    }
  ;(self as DedicatedWorkerGlobalScope & { send_action?: (s: string) => void; send_log?: (s: string) => void }).send_log = (
    s: string,
  ) => {
    try {
      const obj = JSON.parse(s) as { level: LogLevel; message: string }
      postLog(obj.level, obj.message)
    } catch {
      postLog('danger', 'Движок получил повреждённое сообщение лога.')
    }
  }

  // Prelude: expose minimal game API into Python.
  const prelude = `
import sys, io, json, traceback, asyncio
from js import send_action, send_log

def _emit(level, message):
    send_log(json.dumps({"level": level, "message": str(message)}))

def move(dx, dy):
    send_action(json.dumps({"type": "MOVE", "dx": int(dx), "dy": int(dy)}))

def say(text):
    send_action(json.dumps({"type": "SAY", "text": str(text)}))

def set_tile(x, y, tile):
    send_action(json.dumps({"type": "SET_TILE", "x": int(x), "y": int(y), "tile": str(tile)}))

async def sleep(ms):
    await asyncio.sleep(float(ms) / 1000.0)
`
  await pyodide.runPythonAsync(prelude)
  postLog('ok', 'Pyodide готов.')
  if (!readySent) {
    readySent = true
    post({ type: 'ready' } satisfies WorkerToMain)
  }
  return pyodide
}

async function runPython(code: string) {
  const py = await ensurePyodide()

  py.globals.set('USER_CODE', code)

  const wrapper = `
import sys, io, traceback
_stdout = io.StringIO()
_stderr = io.StringIO()
sys.stdout = _stdout
sys.stderr = _stderr

_globals = globals()
_locals = {}

try:
    exec(USER_CODE, _globals, _locals)
    if "main" in _locals and callable(_locals["main"]):
        _res = _locals["main"]()
        # allow async main()
        if hasattr(_res, "__await__"):
            await _res
except Exception as e:
    _tb = traceback.format_exc()
    raise

OUT = _stdout.getvalue()
ERR = _stderr.getvalue()
`

  try {
    await py.runPythonAsync(wrapper)
    const stdout = String(py.globals.get('OUT') ?? '')
    const stderr = String(py.globals.get('ERR') ?? '')
    post({ type: 'result', ok: true, stdout, stderr } satisfies WorkerToMain)
  } catch (e: unknown) {
    const err = e as { name?: string; message?: string; stack?: string }
    post({
      type: 'result',
      ok: false,
      error: {
        name: err?.name ?? 'PythonError',
        message: err?.message ?? String(e),
        traceback: err?.stack,
      },
    } satisfies WorkerToMain)
  }
}

self.onmessage = (ev: MessageEvent<MainToWorker>) => {
  const msg = ev.data
  if (!msg) return
  if (msg.type === 'run') {
    void runPython(msg.code)
  }
}

// Start warm-up early to avoid deadlocks and reduce first-run latency.
void ensurePyodide()

