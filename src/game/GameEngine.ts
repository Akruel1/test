import { GameState, Entity, Position } from './types';

export const TILE_SIZE = 40;
export const GRID_WIDTH = 20;
export const GRID_HEIGHT = 15;

export const INITIAL_STATE: GameState = {
  width: GRID_WIDTH,
  height: GRID_HEIGHT,
  status: 'IDLE',
  logs: [],
  entities: [
    {
      id: 'player',
      type: 'PLAYER',
      pos: { x: 2, y: 2 },
      color: '#00ff9d',
      size: TILE_SIZE - 4
    },
    {
      id: 'wall-1',
      type: 'WALL',
      pos: { x: 5, y: 2 },
      color: '#7000ff',
      size: TILE_SIZE
    },
    {
      id: 'goal',
      type: 'GOAL',
      pos: { x: 18, y: 12 },
      color: '#ff0055',
      size: TILE_SIZE
    }
  ]
};

export class GameEngine {
  private state: GameState;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;

  constructor(initialState: GameState = INITIAL_STATE) {
    this.state = JSON.parse(JSON.stringify(initialState));
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Adjust canvas size to match grid
    this.canvas.width = this.state.width * TILE_SIZE;
    this.canvas.height = this.state.height * TILE_SIZE;
    
    this.draw();
  }

  public draw() {
    if (!this.ctx || !this.canvas) return;

    // Clear
    this.ctx.fillStyle = '#0f0f1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Grid (optional, for debugging/visuals)
    this.ctx.strokeStyle = '#1e1e1e';
    this.ctx.lineWidth = 1;
    for (let x = 0; x <= this.state.width; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * TILE_SIZE, 0);
      this.ctx.lineTo(x * TILE_SIZE, this.state.height * TILE_SIZE);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.state.height; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * TILE_SIZE);
      this.ctx.lineTo(this.state.width * TILE_SIZE, y * TILE_SIZE);
      this.ctx.stroke();
    }

    // Draw Entities
    this.state.entities.forEach(entity => {
      if (!this.ctx) return;
      
      this.ctx.fillStyle = entity.color;
      
      // Pixel art style rects
      const x = entity.pos.x * TILE_SIZE;
      const y = entity.pos.y * TILE_SIZE;
      const pad = (TILE_SIZE - entity.size) / 2;

      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = entity.color;
      this.ctx.fillRect(x + pad, y + pad, entity.size, entity.size);
      this.ctx.shadowBlur = 0;
    });
  }

  public update() {
    // Game loop logic
    this.draw();
  }

  public start() {
    if (this.animationId) return;
    
    const loop = () => {
      this.update();
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  // Method to be called by the code bridge
  public movePlayer(direction: 'up' | 'down' | 'left' | 'right') {
    const player = this.state.entities.find(e => e.type === 'PLAYER');
    if (!player) return;

    let newX = player.pos.x;
    let newY = player.pos.y;

    if (direction === 'up') newY--;
    if (direction === 'down') newY++;
    if (direction === 'left') newX--;
    if (direction === 'right') newX++;

    // Collision Check
    if (newX < 0 || newX >= this.state.width || newY < 0 || newY >= this.state.height) {
      this.log("Error: Out of bounds!");
      return;
    }

    const collision = this.state.entities.find(e => 
      e.id !== player.id && e.pos.x === newX && e.pos.y === newY
    );

    if (collision) {
      if (collision.type === 'WALL') {
        this.log("Error: Collision with wall!");
        // Visual feedback for collision?
        return;
      }
      if (collision.type === 'GOAL') {
        this.log("SUCCESS: Level Completed!");
        this.state.status = 'COMPLETED';
      }
    }

    player.pos = { x: newX, y: newY };
    this.draw();
  }

  private log(message: string) {
    console.log(`[GAME]: ${message}`);
    this.state.logs.push(message);
    // Dispatch event or callback to update UI
  }

  public triggerGlitch() {
    if (!this.ctx || !this.canvas) return;
    
    // Quick red flash and shake effect
    this.ctx.fillStyle = 'rgba(255, 0, 50, 0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Reset after short delay
    setTimeout(() => this.draw(), 200);
  }

  public reset() {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.draw();
  }
}
