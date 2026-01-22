import { Entity, Vector2 } from './types';

export class Goal implements Entity {
  id: string = 'goal';
  position: Vector2;
  color: string = '#00ff41';
  
  constructor(pos: Vector2) {
    this.position = pos;
  }

  update(deltaTime: number) {
    // Pulse effect or animation could go here
  }

  render(ctx: CanvasRenderingContext2D) {
    const x = this.position.x;
    const y = this.position.y;
    const size = 30;

    // Glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    
    ctx.strokeRect(x, y, size, size);
    
    // Inner square
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x + 8, y + 8, 14, 14);
    ctx.globalAlpha = 1.0;
    
    ctx.shadowBlur = 0;
  }
}
