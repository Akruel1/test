export type TileId = 'void' | 'floor' | 'wall' | 'neon'

export type LogLevel = 'system' | 'info' | 'ok' | 'danger'

export type LogEntry = {
  id: string
  ts: number
  level: LogLevel
  message: string
}

export type WorldAction =
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'SAY'; text: string }
  | { type: 'SET_TILE'; x: number; y: number; tile: TileId }

export type World = {
  width: number
  height: number
  tiles: TileId[]
  tick: number
  player: { x: number; y: number }
  lastSpeech?: { text: string; ts: number }
  logs: LogEntry[]
}

export type WorldReducerAction =
  | { type: 'RESET' }
  | { type: 'ACTION'; action: WorldAction }
  | { type: 'LOG'; level: LogLevel; message: string }
  | { type: 'CLEAR_LOGS' }

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

export function createWorld(): World {
  const width = 28
  const height = 16
  const tiles: TileId[] = Array.from({ length: width * height }, () => 'floor')

  // Border walls
  for (let x = 0; x < width; x++) {
    tiles[idx(width, x, 0)] = 'wall'
    tiles[idx(width, x, height - 1)] = 'wall'
  }
  for (let y = 0; y < height; y++) {
    tiles[idx(width, 0, y)] = 'wall'
    tiles[idx(width, width - 1, y)] = 'wall'
  }

  // A neon “portal”
  tiles[idx(width, width - 3, 2)] = 'neon'
  tiles[idx(width, width - 3, 3)] = 'neon'
  tiles[idx(width, width - 2, 2)] = 'neon'
  tiles[idx(width, width - 2, 3)] = 'neon'

  return {
    width,
    height,
    tiles,
    tick: 0,
    player: { x: 2, y: 2 },
    logs: [
      {
        id: uid(),
        ts: Date.now(),
        level: 'info',
        message: 'Мир загружен. Управление отключено. Пиши код, чтобы двигаться и менять реальность.',
      },
    ],
  }
}

function idx(width: number, x: number, y: number): number {
  return y * width + x
}

function inBounds(w: World, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < w.width && y < w.height
}

function getTile(w: World, x: number, y: number): TileId {
  if (!inBounds(w, x, y)) return 'void'
  return w.tiles[idx(w.width, x, y)] ?? 'void'
}

function setTile(w: World, x: number, y: number, t: TileId): World {
  if (!inBounds(w, x, y)) return w
  const nextTiles = w.tiles.slice()
  nextTiles[idx(w.width, x, y)] = t
  return { ...w, tiles: nextTiles }
}

function pushLog(w: World, level: LogLevel, message: string): World {
  const entry: LogEntry = { id: uid(), ts: Date.now(), level, message }
  const logs = w.logs.length > 300 ? w.logs.slice(-250) : w.logs
  return { ...w, logs: [...logs, entry] }
}

function applyWorldAction(w: World, a: WorldAction): World {
  switch (a.type) {
    case 'MOVE': {
      const dx = clamp(a.dx, -1, 1)
      const dy = clamp(a.dy, -1, 1)
      const nx = w.player.x + dx
      const ny = w.player.y + dy
      const t = getTile(w, nx, ny)
      if (t === 'wall') {
        return pushLog(w, 'danger', 'Стена отклоняет команду. Реальность не пропускает.')
      }
      const moved = { ...w, player: { x: nx, y: ny }, tick: w.tick + 1 }
      if (t === 'neon') {
        return pushLog(moved, 'ok', 'Неоновый узел откликнулся: портал мерцает и запоминает тебя.')
      }
      return pushLog(moved, 'info', `Шаг выполнен: (${nx}, ${ny}).`)
    }
    case 'SAY': {
      const text = a.text.slice(0, 140)
      const next = { ...w, lastSpeech: { text, ts: Date.now() } }
      return pushLog(next, 'system', `Голос протокола: “${text}”`)
    }
    case 'SET_TILE': {
      const x = Math.floor(a.x)
      const y = Math.floor(a.y)
      if (!inBounds(w, x, y)) return pushLog(w, 'danger', 'Команда вышла за границы мира. Пустота не отвечает.')
      if (x === 0 || y === 0 || x === w.width - 1 || y === w.height - 1) {
        return pushLog(w, 'danger', 'Границы защищены. Переписать периметр нельзя.')
      }
      const next = setTile(w, x, y, a.tile)
      return pushLog(next, 'ok', `Материя изменена: tile(${x}, ${y}) = ${a.tile}.`)
    }
    default: {
      return w
    }
  }
}

export function worldReducer(state: World, action: WorldReducerAction): World {
  switch (action.type) {
    case 'RESET':
      return createWorld()
    case 'ACTION':
      return applyWorldAction(state, action.action)
    case 'LOG':
      return pushLog(state, action.level, action.message)
    case 'CLEAR_LOGS':
      return { ...state, logs: [] }
    default:
      return state
  }
}

function clamp(n: number, a: number, b: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(a, Math.min(b, n))
}

