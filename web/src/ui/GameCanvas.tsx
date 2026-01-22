import { useEffect, useMemo, useRef } from 'react'
import type { World } from '../game/types'
import { isGoal, isWall, keyOf } from '../game/world'
import './ui.css'

function drawPixelGlow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = 12
  ctx.fillStyle = color
  ctx.globalAlpha = 0.35
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

export function GameCanvas({ world }: { world: World }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const size = useMemo(() => {
    const tile = 16
    return { tile, w: world.w * tile, h: world.h * tile }
  }, [world.w, world.h])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    canvas.style.width = '100%'
    canvas.style.height = '100%'

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = false

    // background
    ctx.fillStyle = '#060716'
    ctx.fillRect(0, 0, size.w, size.h)

    // subtle grid
    ctx.globalAlpha = 0.25
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let x = 0; x <= world.w; x++) {
      ctx.beginPath()
      ctx.moveTo(x * size.tile + 0.5, 0)
      ctx.lineTo(x * size.tile + 0.5, size.h)
      ctx.stroke()
    }
    for (let y = 0; y <= world.h; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * size.tile + 0.5)
      ctx.lineTo(size.w, y * size.tile + 0.5)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // tiles
    for (let y = 0; y < world.h; y++) {
      for (let x = 0; x < world.w; x++) {
        const p = { x, y }
        const px = x * size.tile
        const py = y * size.tile
        if (isWall(world, p)) {
          ctx.fillStyle = 'rgba(255,255,255,0.05)'
          ctx.fillRect(px, py, size.tile, size.tile)
          drawPixelGlow(ctx, px + 2, py + 2, size.tile - 4, size.tile - 4, 'rgba(120,90,255,0.55)')
          ctx.strokeStyle = 'rgba(0,255,224,0.12)'
          ctx.strokeRect(px + 0.5, py + 0.5, size.tile - 1, size.tile - 1)
        } else if (isGoal(world, p)) {
          ctx.fillStyle = 'rgba(0,255,224,0.08)'
          ctx.fillRect(px, py, size.tile, size.tile)
          drawPixelGlow(ctx, px + 3, py + 3, size.tile - 6, size.tile - 6, 'rgba(0,255,224,0.85)')
          ctx.fillStyle = 'rgba(255,0,200,0.35)'
          ctx.fillRect(px + 6, py + 6, 4, 4)
        }
      }
    }

    // player sprite
    const pl = world.player
    const ppx = pl.x * size.tile
    const ppy = pl.y * size.tile
    drawPixelGlow(ctx, ppx + 4, ppy + 4, size.tile - 8, size.tile - 8, 'rgba(255,0,200,0.9)')
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillRect(ppx + 6, ppy + 5, 4, 4) // head
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(ppx + 7, ppy + 6, 1, 1)
    ctx.fillRect(ppx + 9, ppy + 6, 1, 1)
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillRect(ppx + 6, ppy + 10, 4, 4) // body

    // HUD text
    ctx.fillStyle = 'rgba(240,245,255,0.65)'
    ctx.font = '12px ui-sans-serif'
    ctx.fillText(`pos=${keyOf(world.player)}  tick=${world.tick}`, 10, size.h - 10)
  }, [world, size.h, size.tile, size.w])

  return (
    <div className="GameCanvasWrap">
      <canvas ref={canvasRef} className="GameCanvas" />
    </div>
  )
}

