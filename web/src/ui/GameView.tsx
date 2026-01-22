import { useEffect, useMemo, useRef } from 'react'
import type { TileId, World } from '../world/world'

const TILE = 16

function tileColor(t: TileId): { fill: string; glow?: string } {
  switch (t) {
    case 'wall':
      return { fill: '#1b1533', glow: 'rgba(196,109,255,0.18)' }
    case 'neon':
      return { fill: '#0b0f22', glow: 'rgba(109,255,234,0.35)' }
    case 'floor':
      return { fill: '#0a0e20' }
    default:
      return { fill: '#050612' }
  }
}

export function GameView(props: { world: World }) {
  const { world } = props
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const w = world.width * TILE
  const h = world.height * TILE
  const scale = useMemo(() => 3, [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    // crisp pixels
    ctx.imageSmoothingEnabled = false

    // background
    ctx.clearRect(0, 0, w, h)
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#070812')
    g.addColorStop(0.55, '#070a18')
    g.addColorStop(1, '#050612')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    // tiles
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        const t = world.tiles[y * world.width + x]
        const { fill, glow } = tileColor(t)
        const px = x * TILE
        const py = y * TILE
        ctx.fillStyle = fill
        ctx.fillRect(px, py, TILE, TILE)

        if (glow) {
          ctx.fillStyle = glow
          ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4)
          ctx.strokeStyle = 'rgba(109,255,234,0.25)'
          ctx.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6)
        }

        // grid
        ctx.strokeStyle = 'rgba(124,255,246,0.07)'
        ctx.strokeRect(px + 0.5, py + 0.5, TILE, TILE)
      }
    }

    // player
    const px = world.player.x * TILE
    const py = world.player.y * TILE
    drawPlayer(ctx, px, py)

    // speech bubble
    const sp = world.lastSpeech
    if (sp && Date.now() - sp.ts < 3200) {
      drawSpeech(ctx, px + TILE / 2, py - 6, sp.text)
    }
  }, [world, w, h])

  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 14,
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.25)',
      }}
    >
      <canvas
        ref={canvasRef}
        width={w}
        height={h}
        style={{
          width: `${w * scale}px`,
          maxWidth: '100%',
          aspectRatio: `${w} / ${h}`,
          imageRendering: 'pixelated',
          display: 'block',
        }}
      />
    </div>
  )
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // glow
  ctx.fillStyle = 'rgba(109,255,234,0.22)'
  ctx.beginPath()
  ctx.ellipse(x + 8, y + 11, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // body (simple pixel sprite)
  const px = x + 5
  const py = y + 3
  ctx.fillStyle = '#0b0f22'
  ctx.fillRect(px, py, 6, 10)
  ctx.fillStyle = '#6dffea'
  ctx.fillRect(px + 1, py + 1, 4, 2) // visor
  ctx.fillStyle = '#c46dff'
  ctx.fillRect(px + 1, py + 4, 4, 5)
  ctx.fillStyle = '#2b1e55'
  ctx.fillRect(px, py + 10, 2, 3)
  ctx.fillRect(px + 4, py + 10, 2, 3)
}

function drawSpeech(ctx: CanvasRenderingContext2D, cx: number, cy: number, text: string) {
  const msg = text.length > 44 ? `${text.slice(0, 44)}…` : text
  ctx.save()
  ctx.font = '8px "Press Start 2P", ui-monospace, monospace'
  const pad = 6
  const tw = Math.min(220, Math.max(60, ctx.measureText(msg).width + pad * 2))
  const th = 22
  const x = Math.round(cx - tw / 2)
  const y = Math.round(cy - th)

  ctx.fillStyle = 'rgba(12,18,38,0.9)'
  ctx.strokeStyle = 'rgba(109,255,234,0.35)'
  roundRect(ctx, x, y, tw, th, 6)
  ctx.fill()
  ctx.stroke()

  // pointer
  ctx.fillStyle = 'rgba(12,18,38,0.9)'
  ctx.beginPath()
  ctx.moveTo(cx - 6, y + th)
  ctx.lineTo(cx, y + th + 7)
  ctx.lineTo(cx + 6, y + th)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(109,255,234,0.25)'
  ctx.stroke()

  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillText(msg, x + pad, y + 14)
  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

