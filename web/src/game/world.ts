import type { Vec2, World } from './types'

export function keyOf(p: Vec2) {
  return `${p.x},${p.y}`
}

export function cloneWorld(w: World): World {
  return {
    w: w.w,
    h: w.h,
    walls: new Set(w.walls),
    goal: { ...w.goal },
    player: { ...w.player },
    tick: w.tick,
    lastSay: w.lastSay,
  }
}

export function inBounds(w: World, p: Vec2) {
  return p.x >= 0 && p.y >= 0 && p.x < w.w && p.y < w.h
}

export function isWall(w: World, p: Vec2) {
  return w.walls.has(keyOf(p))
}

export function isGoal(w: World, p: Vec2) {
  return p.x === w.goal.x && p.y === w.goal.y
}

