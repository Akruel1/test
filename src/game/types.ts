export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Vector2;
  color: string;
  update: (deltaTime: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GameState {
  entities: Entity[];
  isRunning: boolean;
  score: number;
}
