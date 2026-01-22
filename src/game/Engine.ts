import { Hero } from './Hero';
import { Goal } from './Goal';
import { Entity } from './types';

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  entities: Entity[] = [];
  hero: Hero;
  goal: Goal;
  lastTime: number = 0;
  isRunning: boolean = false;
  gridSize: number = 40;
  onWin?: () => void;

  constructor(canvas: HTMLCanvasElement, onWin?: () => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onWin = onWin;
    
    // Initialize hero
    this.hero = new Hero({ x: 120, y: 120 });
    this.entities.push(this.hero);
    
    // Initialize Goal
    this.goal = new Goal({ x: 360, y: 360 });
    this.entities.push(this.goal);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  stop() {
    this.isRunning = false;
  }

  private gameLoop = (time: number) => {
    if (!this.isRunning) return;

    const deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number) {
    this.entities.forEach(entity => entity.update(deltaTime));
    
    // Check collision
    const dx = this.hero.position.x - this.goal.position.x;
    const dy = this.hero.position.y - this.goal.position.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    if (distance < 10) {
      this.onWin?.();
      // Respawn goal for endless play in this prototype
      this.goal.position.x = Math.floor(Math.random() * (this.canvas.width / 40)) * 40;
      this.goal.position.y = Math.floor(Math.random() * (this.canvas.height / 40)) * 40;
    }
  }

  private render() {
    // Clear screen
    this.ctx.fillStyle = '#050505';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Grid
    this.ctx.strokeStyle = '#1a1a1a';
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Render entities
    this.entities.forEach(entity => entity.render(this.ctx));
  }

  // API for Code Execution
  getAPI() {
    return {
      move: (direction: 'up' | 'down' | 'left' | 'right') => {
        this.hero.move(direction);
      },
      wait: async (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    };
  }
}
