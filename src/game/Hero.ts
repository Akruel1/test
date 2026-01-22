import { Vector2, Entity, Direction } from './types';

export class Hero implements Entity {
  id: string = 'hero';
  position: Vector2;
  targetPosition: Vector2;
  color: string = '#b026ff';
  speed: number = 200; // pixels per second
  isMoving: boolean = false;
  gridSize: number = 40;

  constructor(startPos: Vector2) {
    this.position = { ...startPos };
    this.targetPosition = { ...startPos };
  }

  move(direction: Direction) {
    if (this.isMoving) return;

    switch (direction) {
      case 'up':
        this.targetPosition.y -= this.gridSize;
        break;
      case 'down':
        this.targetPosition.y += this.gridSize;
        break;
      case 'left':
        this.targetPosition.x -= this.gridSize;
        break;
      case 'right':
        this.targetPosition.x += this.gridSize;
        break;
    }
    this.isMoving = true;
  }

  update(deltaTime: number) {
    if (!this.isMoving) return;

    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      this.position.x = this.targetPosition.x;
      this.position.y = this.targetPosition.y;
      this.isMoving = false;
      return;
    }

    const moveStep = this.speed * deltaTime;
    const ratio = moveStep / distance;

    this.position.x += dx * ratio;
    this.position.y += dy * ratio;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    
    // Draw simple pixel character
    const size = 30;
    const x = this.position.x;
    const y = this.position.y;
    
    ctx.fillRect(x, y, size, size);
    
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fillRect(x + 5, y + 5, 8, 8);
    ctx.fillRect(x + 17, y + 5, 8, 8);
    
    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 7, y + 7, 4, 4);
    ctx.fillRect(x + 19, y + 7, 4, 4);
  }
}
