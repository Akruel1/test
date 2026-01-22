import type { Command, LogEntry, World } from './types'
import { cloneWorld, inBounds, isGoal, isWall, keyOf } from './world'

function mkId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function systemLog(title: string, detail?: string): LogEntry {
  return { id: mkId(), at: Date.now(), kind: 'system', title, detail }
}

export function glitchLog(title: string, detail?: string): LogEntry {
  return { id: mkId(), at: Date.now(), kind: 'glitch', title, detail }
}

export function rewardLog(title: string, detail?: string): LogEntry {
  return { id: mkId(), at: Date.now(), kind: 'reward', title, detail }
}

export function actionLog(title: string, detail?: string): LogEntry {
  return { id: mkId(), at: Date.now(), kind: 'action', title, detail }
}

export type StepResult = {
  world: World
  logs: LogEntry[]
  didMove?: boolean
  didSay?: boolean
}

export function applyCommand(world: World, cmd: Command): StepResult {
  const w = cloneWorld(world)
  w.tick += 1

  if (cmd.kind === 'wait') {
    const steps = Math.max(0, Math.min(200, Math.floor(cmd.steps)))
    w.tick += Math.max(0, steps - 1)
    return { world: w, logs: [actionLog('Ожидание', `steps=${steps}`)] }
  }

  if (cmd.kind === 'say') {
    const text = String(cmd.text ?? '').slice(0, 120)
    w.lastSay = text
    return { world: w, logs: [actionLog('Сигнал', text)], didSay: true }
  }

  if (cmd.kind === 'move') {
    const dx = Math.max(-1, Math.min(1, Math.floor(cmd.dx)))
    const dy = Math.max(-1, Math.min(1, Math.floor(cmd.dy)))
    if (dx === 0 && dy === 0) return { world: w, logs: [glitchLog('Пустое движение', 'dx=0, dy=0')] }
    const next = { x: w.player.x + dx, y: w.player.y + dy }
    if (!inBounds(w, next)) return { world: w, logs: [glitchLog('Граница мира', 'ты упёрся в край карты')] }
    if (isWall(w, next)) return { world: w, logs: [glitchLog('Стена', `плитка ${keyOf(next)} заблокирована`)] }
    w.player = next
    const arrived = isGoal(w, next)
    return {
      world: w,
      logs: [actionLog('Шаг', `→ ${keyOf(next)}${arrived ? ' (маяк)' : ''}`)],
      didMove: true,
    }
  }

  // exhaustive
  const _never: never = cmd
  return { world: w, logs: [glitchLog('Неизвестная команда', JSON.stringify(_never))] }
}

