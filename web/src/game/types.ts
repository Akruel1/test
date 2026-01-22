export type Vec2 = { x: number; y: number }

export type Tile = 'floor' | 'wall' | 'goal'

export type World = {
  w: number
  h: number
  walls: Set<string>
  goal: Vec2
  player: Vec2
  tick: number
  lastSay?: string
}

export type Command =
  | { kind: 'move'; dx: number; dy: number }
  | { kind: 'say'; text: string }
  | { kind: 'wait'; steps: number }

export type LogKind = 'system' | 'action' | 'glitch' | 'reward'

export type LogEntry = {
  id: string
  at: number
  kind: LogKind
  title: string
  detail?: string
}

export type LevelObjective = {
  id: string
  text: string
  isComplete: (w: World) => boolean
}

export type Level = {
  id: string
  title: string
  intro: string
  initialWorld: World
  objectives: LevelObjective[]
  starterCode: Partial<Record<'python' | 'java' | 'cpp', string>>
}

